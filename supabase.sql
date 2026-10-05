create extension if not exists pgcrypto;

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  preferred_date date,
  preferred_time text,
  size text,
  placement text,
  style text not null,
  reference_links text,
  status text not null default 'pending' check (status in ('pending','confirmed','declined','cancelled')),
  notes text
);

create index if not exists booking_requests_preferred_date_idx on public.booking_requests(preferred_date);
create index if not exists booking_requests_status_idx on public.booking_requests(status);

alter table public.booking_requests enable row level security;
