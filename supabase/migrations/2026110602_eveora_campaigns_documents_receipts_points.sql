-- Eveora v1.3: campaigns, private evidence uploads, printable donor receipts and Impact Points.
-- Additive only. Does not modify profiles, auth triggers, or existing policies.
create extension if not exists pgcrypto;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 4 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  summary text not null check (char_length(summary) between 10 and 220),
  description text not null,
  category text not null default 'Community support',
  target_amount_kobo bigint check (target_amount_kobo is null or target_amount_kobo > 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  status text not null default 'draft' check (status in ('draft','active','paused','completed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists campaigns_status_created_idx on public.campaigns(status, created_at desc);
alter table public.campaigns enable row level security;
drop policy if exists "Anyone can view active campaigns" on public.campaigns;
create policy "Anyone can view active campaigns" on public.campaigns for select to anon, authenticated using (status = 'active');

alter table public.donations add column if not exists campaign_id uuid references public.campaigns(id) on delete set null;
alter table public.donations add column if not exists receipt_number text unique;

create table if not exists public.assistance_documents (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.assistance_requests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  storage_path text not null unique,
  original_name text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 5242880),
  created_at timestamptz not null default now()
);
create index if not exists assistance_documents_request_idx on public.assistance_documents(request_id);
alter table public.assistance_documents enable row level security;
drop policy if exists "Users can read their own assistance document metadata" on public.assistance_documents;
create policy "Users can read their own assistance document metadata" on public.assistance_documents for select to authenticated using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('eveora-assistance-private','eveora-assistance-private',false,5242880,array['application/pdf','image/jpeg','image/png'])
on conflict (id) do nothing;

-- Impact Points are non-cash recognition. Rules can be drafted but remain disabled.
create table if not exists public.impact_point_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  title text not null check (char_length(title) between 4 and 100),
  description text not null check (char_length(description) between 12 and 500),
  points integer not null check (points > 0 and points <= 100000),
  enabled boolean not null default false,
  requires_verification boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.impact_point_rules enable row level security;
-- No client policies: draft rules are admin/server-only.

-- Impact Points awards are manual, admin-only, and auditable.
create table if not exists public.impact_points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  points integer not null check (points > 0 and points <= 5000),
  reason text not null check (char_length(reason) between 8 and 500),
  source_key text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists impact_points_user_created_idx on public.impact_points_ledger(user_id, created_at desc);
alter table public.impact_points_ledger enable row level security;
drop policy if exists "Users can read their own impact points" on public.impact_points_ledger;
create policy "Users can read their own impact points" on public.impact_points_ledger for select to authenticated using (auth.uid() = user_id);

-- Credits are intentionally not activated: earning, spending, transfer and expiry rules
-- must be confirmed by the product owner before any credit balance can be created.
