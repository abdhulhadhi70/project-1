-- Row-level security.
--
--   public (anon)  read approved + active shops, and their available or
--                  reserved products confirmed in the last 30 days; read rates.
--   jeweller       read and write only the shops they are a member of.
--   admin          everything.
--
-- events, visit_intents and shop_applications have no insert policy for
-- anon or authenticated users: the browser cannot write them directly. Our
-- server routes validate and rate-limit, then write with the service role.

-- ---------------------------------------------------------------------------
-- Helpers. security definer so they can read profiles / shop_members without
-- recursing through those tables' own policies.
-- ---------------------------------------------------------------------------
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create function public.is_shop_member(p_shop_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.shop_members
    where shop_id = p_shop_id and user_id = (select auth.uid())
  );
$$;

create function public.is_public_shop(p_shop_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.shops
    where id = p_shop_id and is_approved and is_active
  );
$$;

-- True for the service role and for migrations/seed run as postgres.
create function public.is_backend() returns boolean
language sql stable as $$
  select current_user in ('service_role', 'postgres', 'supabase_admin');
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.shops             enable row level security;
alter table public.shop_members      enable row level security;
alter table public.products          enable row level security;
alter table public.gold_rates        enable row level security;
alter table public.events            enable row level security;
alter table public.visit_intents     enable row level security;
alter table public.shop_applications enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy "admin manages profiles" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- shops
-- ---------------------------------------------------------------------------
create policy "public reads live shops" on public.shops
  for select to anon, authenticated using (is_approved and is_active);
create policy "members read own shop" on public.shops
  for select to authenticated using (public.is_shop_member(id));
create policy "members update own shop" on public.shops
  for update to authenticated
  using (public.is_shop_member(id)) with check (public.is_shop_member(id));
create policy "admin manages shops" on public.shops
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Jewellers edit their profile, never their own approval, plan or ranking.
create function public.guard_shop_admin_columns() returns trigger
language plpgsql as $$
begin
  if public.is_backend() or public.is_admin() then
    return new;
  end if;
  if new.is_approved     is distinct from old.is_approved
  or new.is_active       is distinct from old.is_active
  or new.plan            is distinct from old.plan
  or new.featured_order  is distinct from old.featured_order
  or new.owner_user_id   is distinct from old.owner_user_id
  or new.slug            is distinct from old.slug then
    raise exception 'Only an admin can change approval, plan, featuring, owner or slug'
      using errcode = '42501';
  end if;
  return new;
end $$;

create trigger shops_guard_admin_columns
  before update on public.shops
  for each row execute function public.guard_shop_admin_columns();

-- ---------------------------------------------------------------------------
-- shop_members
-- ---------------------------------------------------------------------------
create policy "read own memberships" on public.shop_members
  for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy "admin manages members" on public.shop_members
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
-- Stock not confirmed for 30 days drops out of public view on its own, with
-- no scheduled job needed. The jeweller still sees it and can re-confirm.
create policy "public reads live products" on public.products
  for select to anon, authenticated using (
    status in ('available', 'reserved_in_store')
    and last_confirmed_at > now() - interval '30 days'
    and public.is_public_shop(shop_id)
  );
create policy "members read own products" on public.products
  for select to authenticated using (public.is_shop_member(shop_id));
create policy "members insert own products" on public.products
  for insert to authenticated with check (public.is_shop_member(shop_id));
create policy "members update own products" on public.products
  for update to authenticated
  using (public.is_shop_member(shop_id)) with check (public.is_shop_member(shop_id));
create policy "members delete own products" on public.products
  for delete to authenticated using (public.is_shop_member(shop_id));
create policy "admin manages products" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- One tap: "everything I still show is still in the shop".
create function public.confirm_stock(p_shop_id uuid) returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  n integer;
begin
  update public.products
     set last_confirmed_at = now()
   where shop_id = p_shop_id
     and status in ('available', 'reserved_in_store');
  get diagnostics n = row_count;
  return n;
end $$;

-- ---------------------------------------------------------------------------
-- gold_rates
-- ---------------------------------------------------------------------------
create policy "public reads rates" on public.gold_rates
  for select to anon, authenticated using (true);
create policy "admin writes rates" on public.gold_rates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- events (insert via service role only)
-- ---------------------------------------------------------------------------
create policy "members read own events" on public.events
  for select to authenticated using (public.is_shop_member(shop_id) or public.is_admin());

-- ---------------------------------------------------------------------------
-- visit_intents (insert via service role only)
-- ---------------------------------------------------------------------------
create policy "members read own intents" on public.visit_intents
  for select to authenticated using (public.is_shop_member(shop_id) or public.is_admin());
create policy "members update own intents" on public.visit_intents
  for update to authenticated
  using (public.is_shop_member(shop_id) or public.is_admin())
  with check (public.is_shop_member(shop_id) or public.is_admin());

-- ---------------------------------------------------------------------------
-- shop_applications (insert via service role only)
-- ---------------------------------------------------------------------------
create policy "admin manages applications" on public.shop_applications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants. Supabase grants table privileges to anon/authenticated by default;
-- tighten the ones the public never needs.
-- ---------------------------------------------------------------------------
revoke insert, update, delete on public.events, public.visit_intents, public.shop_applications from anon;
revoke insert, delete on public.events from authenticated;
revoke execute on function public.confirm_stock(uuid) from public, anon;
grant execute on function public.confirm_stock(uuid) to authenticated;
grant select on public.current_gold_rates to anon, authenticated;
