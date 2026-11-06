-- Eveora donations and assistance requests.
-- Additive migration only: preserves the existing donations and bill_requests tables.
create extension if not exists pgcrypto;

-- Eveora v1.4 has its own donation ledger so the existing bill-support donation
-- schema and its RLS policies remain untouched.
create table if not exists public.eveora_donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  reference text not null unique,
  amount_kobo bigint not null check (amount_kobo >= 10000),
  currency text not null default 'NGN' check (currency = 'NGN'),
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  donor_name text,
  message text,
  paystack_access_code text,
  paystack_transaction_id text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists eveora_donations_user_created_idx
  on public.eveora_donations(user_id, created_at desc);
alter table public.eveora_donations enable row level security;
drop policy if exists "Users can read their own Eveora donations" on public.eveora_donations;
create policy "Users can read their own Eveora donations"
  on public.eveora_donations for select to authenticated
  using (auth.uid() = user_id);
drop policy if exists "Users can create their own pending Eveora donations" on public.eveora_donations;
create policy "Users can create their own pending Eveora donations"
  on public.eveora_donations for insert to authenticated
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and paid_at is null
    and paystack_transaction_id is null
  );
-- No client update/delete policy: payment state changes only after server verification.

create table if not exists public.assistance_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  reference text not null unique,
  category text not null,
  country text not null,
  requested_amount numeric(14,2),
  currency text not null default 'NGN',
  summary text not null,
  details text not null,
  status text not null default 'submitted' check (status in ('submitted','under_review','approved','declined','closed')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists assistance_user_created_idx
  on public.assistance_requests(user_id, created_at desc);
alter table public.assistance_requests enable row level security;
drop policy if exists "Users can read their own assistance requests" on public.assistance_requests;
create policy "Users can read their own assistance requests"
  on public.assistance_requests for select to authenticated
  using (auth.uid() = user_id);
drop policy if exists "Users can create their own assistance requests" on public.assistance_requests;
create policy "Users can create their own assistance requests"
  on public.assistance_requests for insert to authenticated
  with check (auth.uid() = user_id and status = 'submitted' and admin_note is null);
-- No client update/delete policy: reviewers use the server-only service role.
