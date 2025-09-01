-- ── Extension (for gen_random_uuid) ──────────────────────────────────────────
create extension if not exists pgcrypto;

-- ── Core tables ──────────────────────────────────────────────────────────────
create table if not exists public.kits (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  description text,
  price_cents int not null check (price_cents >= 0),
  active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.airports (
  id uuid primary key default gen_random_uuid(),
  icao text not null,
  iata text,
  city text,
  state text,
  name text,
  created_at timestamptz default now(),
  constraint airports_icao_unique unique (icao),
  constraint airports_iata_unique unique (iata)
);

create table if not exists public.fbos (
  id uuid primary key default gen_random_uuid(),
  airport_id uuid not null references public.airports(id) on delete cascade,
  name text not null,
  phone text,
  address text,
  created_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_fbos_airport_id on public.fbos(airport_id);
create index if not exists idx_airports_iata  on public.airports(iata);
create index if not exists idx_airports_icao  on public.airports(icao);

-- ★ NEW: make FBO name unique per airport so ON CONFLICT works
create unique index if not exists uniq_fbos_airport_name
  on public.fbos(airport_id, name);

-- ── Seed data (idempotent) ───────────────────────────────────────────────────
insert into public.airports (icao, iata, city, state, name)
values
 ('KPBI','PBI','West Palm Beach','FL','Palm Beach International'),
 ('KSUA','SUA','Stuart','FL','Witham Field'),
 ('KFLL','FLL','Fort Lauderdale','FL','Fort Lauderdale-Hollywood Intl')
on conflict (icao) do update
set iata = excluded.iata,
    city = excluded.city,
    state = excluded.state,
    name = excluded.name;

-- Use the unique index for conflict target
insert into public.fbos (airport_id, name, phone)
select a.id, 'Signature Flight Support', '(555) 000-0000'
from public.airports a
on conflict (airport_id, name) do nothing;

insert into public.kits (sku, name, description, price_cents)
values
 ('KIT-BEV',   'Beverage Kit',    'Ice, water, soda, cups, napkins', 20000),
 ('KIT-CLEAN', 'Cabin Clean Kit', 'Wipes, trash bags, gloves, freshener', 15000),
 ('KIT-SNACK', 'Snack Pack',      'Chips, trail mix, protein bars', 18000)
on conflict (sku) do update
set name = excluded.name,
    description = excluded.description,
    price_cents = excluded.price_cents;

-- ── View to match frontend shape ─────────────────────────────────────────────
create or replace view public.fbos_with_airport as
select
  f.id,
  f.name,
  a.iata as airport_iata,
  a.icao as airport_icao
from public.fbos f
join public.airports a on a.id = f.airport_id;

-- Ensure security barrier on the view
alter view public.fbos_with_airport set (security_barrier = on);

-- ── Enable RLS on public tables ──────────────────────────────────────────────
alter table public.kits     enable row level security;
alter table public.airports enable row level security;
alter table public.fbos     enable row level security;

-- Read-only public (anon) select policies for demo
drop policy if exists "kits select anon" on public.kits;
create policy "kits select anon" on public.kits for select using (true);

drop policy if exists "airports select anon" on public.airports;
create policy "airports select anon" on public.airports for select using (true);

drop policy if exists "fbos select anon" on public.fbos;
create policy "fbos select anon" on public.fbos for select using (true);

-- ── ORDERS: create or migrate to the expected shape ──────────────────────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending',
  fbo_id uuid references public.fbos(id) on delete set null,
  subtotal_cents int not null default 0,
  total_cents int not null default 0,
  window_start timestamptz not null,
  window_end   timestamptz not null,

  created_at timestamptz default now()
);

-- Ensure required columns exist (idempotent patch)
alter table public.orders
  add column if not exists subtotal_cents int not null default 0,
  add column if not exists total_cents    int not null default 0,
  add column if not exists window_start   timestamptz,
  add column if not exists window_end     timestamptz,
  add column if not exists created_at     timestamptz default now();

-- Convert legacy BIGINT fbo_id to UUID if needed (null out old values)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='orders'
      and column_name='fbo_id' and data_type='bigint'
  ) then
    alter table public.orders
      alter column fbo_id type uuid using null::uuid;
  end if;
end$$;

-- Backfill window times for existing rows so we can enforce NOT NULL
update public.orders
set window_start = coalesce(window_start, now()),
    window_end   = coalesce(window_end,   now() + interval '1 hour')
where window_start is null or window_end is null;

-- Enforce NOT NULL window columns
alter table public.orders
  alter column window_start set not null,
  alter column window_end   set not null;

-- Recreate the FK (UUID -> UUID)
alter table public.orders drop constraint if exists orders_fbo_id_fkey;
alter table public.orders
  add constraint orders_fbo_id_fkey
  foreign key (fbo_id) references public.fbos(id) on delete set null;

-- Index + RLS + demo policies
create index if not exists idx_orders_created_at on public.orders(created_at desc);
alter table public.orders enable row level security;

drop policy if exists "orders select anon" on public.orders;
create policy "orders select anon" on public.orders for select using (true);

drop policy if exists "orders insert anon" on public.orders;
create policy "orders insert anon" on public.orders for insert with check (true);
