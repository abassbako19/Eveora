-- Eveora v1.4 Credits: separate from money and Impact Points.
-- Additive only. Existing profiles, auth triggers and RLS policies remain untouched.
create table if not exists public.eveora_credits_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  amount integer not null check (amount <> 0),
  event_type text not null check (event_type in ('verified_donation','weekly_login','weekly_streak_bonus','premium_redemption','admin_adjustment')),
  description text not null,
  source_key text unique,
  created_at timestamptz not null default now()
);
create index if not exists eveora_credits_user_created_idx
  on public.eveora_credits_ledger(user_id, created_at desc);
alter table public.eveora_credits_ledger enable row level security;
drop policy if exists "Users read own Eveora Credits ledger" on public.eveora_credits_ledger;
create policy "Users read own Eveora Credits ledger"
  on public.eveora_credits_ledger for select to authenticated using (auth.uid() = user_id);

create table if not exists public.eveora_weekly_activity (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  streak_weeks integer not null default 1 check (streak_weeks > 0),
  rewarded_at timestamptz not null default now(),
  primary key(user_id, week_start)
);
alter table public.eveora_weekly_activity enable row level security;
drop policy if exists "Users read own weekly Eveora activity" on public.eveora_weekly_activity;
create policy "Users read own weekly Eveora activity"
  on public.eveora_weekly_activity for select to authenticated using (auth.uid() = user_id);

create table if not exists public.eveora_premium_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.eveora_premium_entitlements enable row level security;
drop policy if exists "Users read own Eveora premium entitlement" on public.eveora_premium_entitlements;
create policy "Users read own Eveora premium entitlement"
  on public.eveora_premium_entitlements for select to authenticated using (auth.uid() = user_id);

-- All mutations are server-side service-role RPCs. Idempotency keys prevent duplicate rewards.
create or replace function public.eveora_award_credits(
  p_user_id uuid, p_amount integer, p_event_type text, p_description text, p_source_key text
) returns void language plpgsql security definer set search_path = public as $$
begin
  if p_amount <= 0 or p_amount > 1000 then raise exception 'Invalid credit amount'; end if;
  insert into public.eveora_credits_ledger(user_id, amount, event_type, description, source_key)
  values (p_user_id, p_amount, p_event_type, left(p_description, 240), p_source_key)
  on conflict (source_key) do nothing;
end; $$;

create or replace function public.eveora_record_weekly_login(p_user_id uuid)
returns table(credits_awarded integer, streak_weeks integer)
language plpgsql security definer set search_path = public as $$
declare
  v_week date;
  v_prev integer;
  v_streak integer;
  v_reward integer;
begin
  -- ISO week starts Monday, using UTC for consistent cross-timezone accounting.
  v_week := date_trunc('week', now() at time zone 'UTC')::date;
  select w.streak_weeks into v_prev
    from public.eveora_weekly_activity w
    where w.user_id = p_user_id and w.week_start = v_week - 7;
  v_streak := case when v_prev is null then 1 else least(v_prev + 1, 52) end;
  insert into public.eveora_weekly_activity(user_id, week_start, streak_weeks)
    values(p_user_id, v_week, v_streak)
    on conflict(user_id, week_start) do nothing;
  if not found then
    return query select 0, (select streak_weeks from public.eveora_weekly_activity where user_id=p_user_id and week_start=v_week);
    return;
  end if;
  v_reward := 5 + case when v_streak >= 4 then 20 when v_streak = 3 then 15 when v_streak = 2 then 10 else 0 end;
  insert into public.eveora_credits_ledger(user_id, amount, event_type, description, source_key)
    values(p_user_id, v_reward, case when v_streak > 1 then 'weekly_streak_bonus' else 'weekly_login' end,
      'Weekly login reward — week streak ' || v_streak, 'weekly-login:' || p_user_id::text || ':' || v_week::text)
    on conflict(source_key) do nothing;
  return query select v_reward, v_streak;
end; $$;

create or replace function public.eveora_redeem_premium(p_user_id uuid, p_days integer, p_cost integer)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare
  v_balance integer;
  v_expiry timestamptz;
  v_source text;
begin
  if not ((p_days=7 and p_cost=100) or (p_days=30 and p_cost=250)) then
    raise exception 'Invalid premium reward';
  end if;
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));
  select coalesce(sum(amount),0)::integer into v_balance
    from public.eveora_credits_ledger where user_id=p_user_id;
  if v_balance < p_cost then raise exception 'Not enough Credits'; end if;
  select greatest(expires_at, now()) into v_expiry from public.eveora_premium_entitlements where user_id=p_user_id;
  v_expiry := coalesce(v_expiry, now()) + make_interval(days => p_days);
  v_source := 'premium:' || p_user_id::text || ':' || gen_random_uuid()::text;
  insert into public.eveora_credits_ledger(user_id,amount,event_type,description,source_key)
    values(p_user_id,-p_cost,'premium_redemption','Redeemed ' || p_days || ' days of Premium',v_source);
  insert into public.eveora_premium_entitlements(user_id,expires_at,updated_at)
    values(p_user_id,v_expiry,now())
    on conflict(user_id) do update set expires_at=excluded.expires_at,updated_at=now();
  return v_expiry;
end; $$;

revoke all on function public.eveora_award_credits(uuid,integer,text,text,text) from public, anon, authenticated;
revoke all on function public.eveora_record_weekly_login(uuid) from public, anon, authenticated;
revoke all on function public.eveora_redeem_premium(uuid,integer,integer) from public, anon, authenticated;
grant execute on function public.eveora_award_credits(uuid,integer,text,text,text) to service_role;
grant execute on function public.eveora_record_weekly_login(uuid) to service_role;
grant execute on function public.eveora_redeem_premium(uuid,integer,integer) to service_role;


-- Atomically mark a verified donation paid and grant its one-time reward.
create or replace function public.eveora_confirm_donation(p_reference text, p_transaction_id text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_user uuid; v_donation_id uuid;
begin
  update public.eveora_donations
    set status='paid', paid_at=coalesce(paid_at,now()),
        paystack_transaction_id=p_transaction_id,
        receipt_number=coalesce(receipt_number,'EVE-REC-' || upper(right(p_reference,12)))
    where reference=p_reference and status in ('pending','failed')
    returning id,user_id into v_donation_id,v_user;
  if v_donation_id is null then return false; end if;
  insert into public.eveora_credits_ledger(user_id,amount,event_type,description,source_key)
    values(v_user,10,'verified_donation','Reward for a Paystack-verified donation','verified-donation:' || p_reference)
    on conflict(source_key) do nothing;
  return true;
end; $$;
revoke all on function public.eveora_confirm_donation(text,text) from public, anon, authenticated;
grant execute on function public.eveora_confirm_donation(text,text) to service_role;
