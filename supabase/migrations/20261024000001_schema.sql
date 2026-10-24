-- Core schema for the UAE gold jewellers discovery platform.
-- There is deliberately nothing here for payments, deposits, bookings or
-- instalments: every sale happens in the shop.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role         as enum ('admin', 'jeweller');
create type public.shop_plan         as enum ('pilot', 'basic', 'featured');
create type public.product_category  as enum ('necklace', 'bangle', 'ring', 'earrings', 'chain',
                                              'pendant', 'bracelet', 'anklet', 'set', 'kids', 'other');
create type public.making_charge_type as enum ('per_gram', 'percent', 'fixed');
create type public.product_status    as enum ('available', 'reserved_in_store', 'sold', 'hidden');
create type public.event_type        as enum ('shop_view', 'product_view', 'whatsapp_click',
                                              'call_click', 'directions_click', 'visit_intent');
create type public.intent_status     as enum ('new', 'contacted', 'visited', 'no_show');
create type public.application_status as enum ('pending', 'approved', 'rejected');

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user, holds the role.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       public.user_role not null default 'jeweller',
  full_name  text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Shops
-- ---------------------------------------------------------------------------
create table public.shops (
  id               uuid primary key default gen_random_uuid(),
  name             text not null check (length(name) between 2 and 120),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  owner_user_id    uuid references auth.users (id) on delete set null,
  emirate          text not null check (emirate in ('Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman',
                                                    'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah')),
  area             text not null,
  address          text,
  google_maps_url  text,
  lat              double precision check (lat between -90 and 90),
  lng              double precision check (lng between -180 and 180),
  phone            text,
  whatsapp_number  text check (whatsapp_number is null or whatsapp_number ~ '^[0-9]{8,15}$'),
  -- {"mon":[["10:00","22:00"]], "fri":[["10:00","12:00"],["16:00","22:00"]], ...}
  opening_hours    jsonb not null default '{}'::jsonb,
  logo_url         text,
  cover_url        text,
  about            text,
  show_prices      boolean not null default true,
  plan             public.shop_plan not null default 'pilot',
  featured_order   integer,
  is_approved      boolean not null default false,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index shops_public_idx on public.shops (emirate, area) where is_approved and is_active;
create index shops_featured_idx on public.shops (featured_order) where featured_order is not null;

-- Staff who may manage a shop. The owner is added here automatically.
create table public.shop_members (
  shop_id    uuid not null references public.shops (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (shop_id, user_id)
);
create index shop_members_user_idx on public.shop_members (user_id);

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table public.products (
  id                   uuid primary key default gen_random_uuid(),
  shop_id              uuid not null references public.shops (id) on delete cascade,
  -- Short code customers quote on WhatsApp or at the counter, e.g. "DGS-0142".
  code                 text not null check (code ~ '^[A-Z0-9]{2,6}-[0-9]{3,6}$'),
  title                text not null check (length(title) between 2 and 140),
  slug                 text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category             public.product_category not null,
  karat                smallint not null check (karat in (24, 22, 21, 18)),
  weight_grams         numeric(9, 3) not null check (weight_grams > 0 and weight_grams < 5000),
  making_charge_type   public.making_charge_type not null,
  making_charge_value  numeric(10, 2) not null default 0 check (making_charge_value >= 0),
  stone_details        text,
  occasion_tags        text[] not null default '{}',
  -- Cloudinary public ids, first one is the cover image.
  images               text[] not null check (cardinality(images) between 1 and 6),
  status               public.product_status not null default 'available',
  last_confirmed_at    timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (shop_id, slug),
  unique (code),
  -- A percentage making charge above 100% of the gold value is almost
  -- certainly a typo for a per-gram figure.
  check (making_charge_type <> 'percent' or making_charge_value <= 100)
);

create index products_shop_idx     on public.products (shop_id, status);
create index products_browse_idx   on public.products (category, karat, created_at desc)
  where status in ('available', 'reserved_in_store');
create index products_confirmed_idx on public.products (last_confirmed_at);
create index products_occasion_idx on public.products using gin (occasion_tags);

-- ---------------------------------------------------------------------------
-- Gold rates: entered by hand each day, history kept.
-- ---------------------------------------------------------------------------
create table public.gold_rates (
  id                 bigint generated always as identity primary key,
  emirate            text not null default 'UAE',
  karat              smallint not null check (karat in (24, 22, 21, 18)),
  rate_per_gram_aed  numeric(10, 2) not null check (rate_per_gram_aed > 0),
  effective_at       timestamptz not null default now(),
  set_by             uuid references auth.users (id) on delete set null,
  created_at         timestamptz not null default now()
);
create index gold_rates_latest_idx on public.gold_rates (emirate, karat, effective_at desc);

-- The latest rate per emirate and karat, ignoring rates scheduled for later.
create view public.current_gold_rates
with (security_invoker = true) as
select distinct on (emirate, karat)
  emirate, karat, rate_per_gram_aed, effective_at
from public.gold_rates
where effective_at <= now()
order by emirate, karat, effective_at desc;

-- ---------------------------------------------------------------------------
-- Analytics events. No personal data: a random per-browser session id only.
-- ---------------------------------------------------------------------------
create table public.events (
  id                    bigint generated always as identity primary key,
  shop_id               uuid not null references public.shops (id) on delete cascade,
  product_id            uuid references public.products (id) on delete set null,
  type                  public.event_type not null,
  anonymous_session_id  text check (length(anonymous_session_id) <= 64),
  referrer              text check (length(referrer) <= 500),
  created_at            timestamptz not null default now()
);
create index events_shop_time_idx    on public.events (shop_id, created_at desc);
create index events_product_time_idx on public.events (product_id, created_at desc) where product_id is not null;

-- ---------------------------------------------------------------------------
-- "I'll visit to see this" requests
-- ---------------------------------------------------------------------------
create table public.visit_intents (
  id              uuid primary key default gen_random_uuid(),
  shop_id         uuid not null references public.shops (id) on delete cascade,
  product_id      uuid references public.products (id) on delete set null,
  customer_name   text not null check (length(customer_name) between 1 and 100),
  customer_phone  text not null check (customer_phone ~ '^\+?[0-9 ]{7,20}$'),
  preferred_date  date,
  note            text check (length(note) <= 500),
  status          public.intent_status not null default 'new',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index visit_intents_shop_idx on public.visit_intents (shop_id, created_at desc);

-- ---------------------------------------------------------------------------
-- "List your shop" applications. Kept apart from shops so nothing pending
-- can ever reach a public page.
-- ---------------------------------------------------------------------------
create table public.shop_applications (
  id             uuid primary key default gen_random_uuid(),
  shop_name      text not null check (length(shop_name) between 2 and 120),
  contact_name   text not null check (length(contact_name) between 1 and 100),
  email          text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone          text not null,
  emirate        text not null,
  area           text not null,
  message        text check (length(message) <= 1000),
  status         public.application_status not null default 'pending',
  shop_id        uuid references public.shops (id) on delete set null,
  reviewed_by    uuid references auth.users (id) on delete set null,
  created_at     timestamptz not null default now(),
  reviewed_at    timestamptz
);
create index shop_applications_status_idx on public.shop_applications (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger shops_updated_at         before update on public.shops         for each row execute function public.set_updated_at();
create trigger products_updated_at      before update on public.products      for each row execute function public.set_updated_at();
create trigger visit_intents_updated_at before update on public.visit_intents for each row execute function public.set_updated_at();

-- Every new auth user gets a jeweller profile. Admins are promoted by hand
-- (see README) so nobody can sign themselves up as an admin.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The owner of a shop is always one of its members.
create function public.add_owner_as_member() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.owner_user_id is not null then
    insert into public.shop_members (shop_id, user_id)
    values (new.id, new.owner_user_id)
    on conflict do nothing;
  end if;
  return new;
end $$;

create trigger shops_owner_member
  after insert or update of owner_user_id on public.shops
  for each row execute function public.add_owner_as_member();
