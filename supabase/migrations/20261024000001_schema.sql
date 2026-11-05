-- Schema for the jewellery discovery site, its jeweller portal and its
-- admin portal. There is deliberately nothing here for payments, deposits,
-- bookings or instalments: every sale happens in the shop.
--
-- The shapes follow data/catalogue.ts, so the public pages read the same
-- fields whether they come from the demo file or from here.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role          as enum ('admin', 'jeweller');
create type public.member_role        as enum ('owner', 'staff');
create type public.shop_plan          as enum ('pilot', 'basic', 'featured');
create type public.piece_category     as enum ('chains', 'necklaces', 'sets', 'rings', 'earrings', 'pendants',
                                               'bangles', 'bracelets', 'anklets', 'coins', 'bars');
create type public.purity             as enum ('24K', '22K', '21K', '18K');
create type public.making_charge_type as enum ('per_gram', 'percent', 'fixed');
create type public.price_mode         as enum ('listed', 'indicative', 'on_request');
create type public.piece_status       as enum ('available', 'reserved_in_store', 'sold', 'hidden');
create type public.wearer             as enum ('women', 'men', 'kids', 'unisex');
create type public.piece_style        as enum ('arabic', 'indian', 'italian', 'turkish', 'contemporary');
create type public.occasion           as enum ('bridal', 'daily', 'gift', 'festive', 'engagement', 'investment');
create type public.event_type         as enum ('shop_view', 'piece_view', 'whatsapp_click', 'call_click',
                                               'directions_click', 'visit_request');
create type public.request_status     as enum ('new', 'contacted', 'visited', 'no_show');
create type public.application_status as enum ('pending', 'approved', 'rejected');

create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       public.user_role not null default 'jeweller',
  full_name  text check (length(full_name) <= 100),
  email      text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Places: the gold districts. Admin-managed; an area with no shop is hidden
-- on the public site.
-- ---------------------------------------------------------------------------
create table public.areas (
  slug       text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name       text not null check (length(name) between 2 and 80),
  emirate    text not null check (emirate in ('Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman',
                                             'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah')),
  note       text check (length(note) <= 300),
  lat        double precision not null check (lat between 22 and 27),
  lng        double precision not null check (lng between 51 and 57),
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Shops
-- ---------------------------------------------------------------------------
create table public.shops (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name             text not null check (length(name) between 2 and 120),
  area             text not null references public.areas (slug),
  address          text check (length(address) <= 200),
  lat              double precision check (lat between 22 and 27),
  lng              double precision check (lng between 51 and 57),
  about            text check (length(about) <= 1000),
  speciality       text check (length(speciality) <= 80),
  hours            text check (length(hours) <= 120),
  languages        text[] not null default '{}',
  phone            text check (phone is null or phone ~ '^\+?[0-9 ]{7,20}$'),
  whatsapp         text check (whatsapp is null or whatsapp ~ '^[0-9]{8,15}$'),
  logo_url         text,
  cover_url        text,
  -- false: every price shows as "Price on request", weight and purity only.
  show_prices      boolean not null default true,
  plan             public.shop_plan not null default 'pilot',
  featured_order   integer,
  is_approved      boolean not null default false,
  is_active        boolean not null default true,
  -- Demo shops are labelled as such and never receive messages.
  is_demo          boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index shops_public_idx on public.shops (area) where is_approved and is_active;
create trigger shops_updated_at before update on public.shops for each row execute function public.set_updated_at();

-- Who may manage a shop: its owner and any staff the owner invites.
create table public.shop_members (
  shop_id    uuid not null references public.shops (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       public.member_role not null default 'staff',
  created_at timestamptz not null default now(),
  primary key (shop_id, user_id)
);
create index shop_members_user_idx on public.shop_members (user_id);

-- Invitations by email. When the invited person signs up with that address,
-- the trigger below makes them a member. No server code is needed for it.
create table public.shop_invites (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references public.shops (id) on delete cascade,
  email       text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role        public.member_role not null default 'staff',
  invited_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  accepted_at timestamptz,
  unique (shop_id, email)
);
create index shop_invites_email_idx on public.shop_invites (lower(email)) where accepted_at is null;

-- ---------------------------------------------------------------------------
-- Pieces
-- ---------------------------------------------------------------------------
create table public.pieces (
  id                  uuid primary key default gen_random_uuid(),
  shop_id             uuid not null references public.shops (id) on delete cascade,
  -- The reference customers quote at the counter, e.g. "SA-0142".
  code                text not null unique check (code ~ '^[A-Z]{2,4}-[0-9]{3,6}$'),
  slug                text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name                text not null check (length(name) between 2 and 120),
  category            public.piece_category not null,
  purity              public.purity,
  fineness            text check (fineness is null or fineness ~ '^[0-9]{3}(\.[0-9])?$'),
  weight_grams        numeric(9, 3) check (weight_grams > 0 and weight_grams < 5000),
  making_charge_type  public.making_charge_type,
  making_charge_value numeric(10, 2) check (making_charge_value >= 0),
  stones              text check (length(stones) <= 200),
  stones_aed          numeric(12, 2) not null default 0 check (stones_aed >= 0),
  occasions           public.occasion[] not null default '{}',
  wearer              public.wearer not null default 'women',
  style               public.piece_style,
  price_mode          public.price_mode not null default 'indicative',
  -- Only for price_mode = 'listed'. Indicative prices are worked out from
  -- the current rate when they are read (see piece_prices).
  price_aed           numeric(12, 2) check (price_aed > 0),
  description         text check (length(description) <= 1000),
  -- Cloudinary public ids, first is the cover. 1 to 6.
  images              text[] not null check (cardinality(images) between 1 and 6),
  status              public.piece_status not null default 'available',
  featured_order      integer,
  listed_at           timestamptz not null default now(),
  stock_confirmed_at  timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (making_charge_type <> 'percent' or making_charge_value <= 100),
  check (price_mode <> 'listed' or price_aed is not null),
  -- A price can only be worked out if there is gold, weight and making.
  check (price_mode = 'on_request' or (purity is not null and weight_grams is not null and making_charge_type is not null and making_charge_value is not null))
);
create index pieces_shop_idx on public.pieces (shop_id, status);
create index pieces_browse_idx on public.pieces (category, listed_at desc) where status in ('available', 'reserved_in_store');
create trigger pieces_updated_at before update on public.pieces for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Gold rates: entered by the admin each day, history kept.
-- ---------------------------------------------------------------------------
create table public.gold_rates (
  id                bigint generated always as identity primary key,
  purity            public.purity not null,
  rate_per_gram_aed numeric(10, 2) not null check (rate_per_gram_aed > 0 and rate_per_gram_aed < 10000),
  effective_at      timestamptz not null default now(),
  set_by            uuid references auth.users (id) on delete set null,
  created_at        timestamptz not null default now()
);
create index gold_rates_latest_idx on public.gold_rates (purity, effective_at desc);

create view public.current_gold_rates with (security_invoker = true) as
select distinct on (purity) purity, rate_per_gram_aed, effective_at
from public.gold_rates
where effective_at <= now()
order by purity, effective_at desc;

-- ---------------------------------------------------------------------------
-- Site settings: one row, edited in the admin portal.
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id               boolean primary key default true check (id),
  site_name        text not null default 'Tibr' check (length(site_name) between 1 and 40),
  contact_email    text check (contact_email is null or contact_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  contact_whatsapp text check (contact_whatsapp is null or contact_whatsapp ~ '^[0-9]{8,15}$'),
  notice_text      text check (length(notice_text) <= 200),
  show_notice      boolean not null default true,
  hero_image       text,
  -- Homepage sections that can be switched off, e.g. {"bridal": false}.
  sections         jsonb not null default '{}'::jsonb,
  updated_at       timestamptz not null default now()
);
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
insert into public.site_settings (id) values (true);

-- ---------------------------------------------------------------------------
-- Customer activity. No personal data in events: a random per-browser id.
-- ---------------------------------------------------------------------------
create table public.events (
  id         bigint generated always as identity primary key,
  shop_id    uuid not null references public.shops (id) on delete cascade,
  piece_id   uuid references public.pieces (id) on delete set null,
  type       public.event_type not null,
  session_id text check (length(session_id) <= 64),
  created_at timestamptz not null default now()
);
create index events_shop_time_idx on public.events (shop_id, created_at desc);

-- "I'll visit to see this"
create table public.visit_requests (
  id             uuid primary key default gen_random_uuid(),
  shop_id        uuid not null references public.shops (id) on delete cascade,
  piece_id       uuid references public.pieces (id) on delete set null,
  customer_name  text not null check (length(customer_name) between 1 and 100),
  customer_phone text not null check (customer_phone ~ '^\+?[0-9 ]{7,20}$'),
  preferred_date date,
  note           text check (length(note) <= 500),
  status         public.request_status not null default 'new',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index visit_requests_shop_idx on public.visit_requests (shop_id, created_at desc);
create trigger visit_requests_updated_at before update on public.visit_requests for each row execute function public.set_updated_at();

-- "List your shop" applications, kept apart from shops so nothing pending
-- can reach a public page.
create table public.shop_applications (
  id           uuid primary key default gen_random_uuid(),
  shop_name    text not null check (length(shop_name) between 2 and 120),
  contact_name text not null check (length(contact_name) between 1 and 100),
  email        text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone        text not null check (phone ~ '^\+?[0-9 ]{7,20}$'),
  emirate      text not null,
  area         text check (length(area) <= 80),
  message      text check (length(message) <= 1000),
  status       public.application_status not null default 'pending',
  shop_id      uuid references public.shops (id) on delete set null,
  created_at   timestamptz not null default now(),
  reviewed_at  timestamptz
);

-- ---------------------------------------------------------------------------
-- New users get a jeweller profile. Admins are promoted by hand (README), so
-- nobody can sign up as one.
--
-- Shop invitations are accepted only once the email address is confirmed:
-- signing up with someone else's address must not join their shop.
-- ---------------------------------------------------------------------------
create function public.accept_invites(p_user uuid, p_email text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.shop_members (shop_id, user_id, role)
  select i.shop_id, p_user, i.role
  from public.shop_invites i
  where lower(i.email) = lower(p_email) and i.accepted_at is null
  on conflict do nothing;
  update public.shop_invites set accepted_at = now()
  where lower(email) = lower(p_email) and accepted_at is null;
end $$;
revoke execute on function public.accept_invites(uuid, text) from public, anon, authenticated;

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;
  if new.email_confirmed_at is not null then
    perform public.accept_invites(new.id, new.email);
  end if;
  return new;
end $$;

create function public.handle_email_confirmed() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform public.accept_invites(new.id, new.email);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.handle_email_confirmed();
