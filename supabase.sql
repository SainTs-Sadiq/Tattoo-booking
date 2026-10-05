create extension if not exists pgcrypto;

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  preferred_date date,
  preferred_time text,
  service_type text not null default 'in-studio' check (service_type in ('in-studio','home-service')),
  size text,
  placement text,
  style text not null,
  reference_links text,
  status text not null default 'pending' check (status in ('pending','confirmed','declined','cancelled')),
  notes text
);

alter table public.booking_requests add column if not exists service_type text not null default 'in-studio';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.booking_requests'::regclass
      and conname = 'booking_requests_service_type_check'
  ) then
    alter table public.booking_requests
      add constraint booking_requests_service_type_check
      check (service_type in ('in-studio','home-service'));
  end if;
end $$;

create index if not exists booking_requests_preferred_date_idx on public.booking_requests(preferred_date);
create index if not exists booking_requests_status_idx on public.booking_requests(status);
create index if not exists booking_requests_service_type_idx on public.booking_requests(service_type);

alter table public.booking_requests enable row level security;
