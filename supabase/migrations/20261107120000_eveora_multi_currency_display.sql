begin;

alter table public.campaigns
  add column if not exists target_amount_minor bigint;

update public.campaigns
set target_amount_minor = target_amount_kobo
where target_amount_minor is null
  and target_amount_kobo is not null
  and currency = 'NGN';

alter table public.campaigns
  drop constraint if exists campaigns_currency_check;

alter table public.campaigns
  add constraint campaigns_currency_check
  check (currency in ('NGN','USD','GBP','EUR','GHS','KES','CAD','AUD'));

alter table public.assistance_requests
  add constraint assistance_requests_currency_check
  check (currency in ('NGN','USD','GBP','EUR','GHS','KES','CAD','AUD'));

alter table public.campaigns
  add constraint campaigns_target_amount_minor_check
  check (target_amount_minor is null or target_amount_minor > 0);

create index if not exists campaigns_currency_status_idx
  on public.campaigns(currency,status);

commit;
