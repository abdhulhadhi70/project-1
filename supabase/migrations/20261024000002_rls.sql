-- Who can see and change what.
--
--   public     approved, active shops; their available or reserved pieces
--              whose stock was confirmed in the last 30 days; areas, rates,
--              site settings. Customer actions go through the functions at
--              the bottom, never straight into a table.
--   jeweller   everything for the shops they belong to, nothing else.
--              Owners also manage their shop's staff.
--   admin      everything.

-- ---------------------------------------------------------------------------
-- Helpers. security definer so they can read memberships without recursing
-- through those tables' own policies.
-- ---------------------------------------------------------------------------
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

create function public.is_member(p_shop uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.shop_members where shop_id = p_shop and user_id = (select auth.uid()));
$$;

create function public.is_owner(p_shop uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.shop_members where shop_id = p_shop and user_id = (select auth.uid()) and role = 'owner');
$$;

create function public.is_public_shop(p_shop uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.shops where id = p_shop and is_approved and is_active);
$$;

-- True for the service role and for migrations or seeds run as postgres.
create function public.is_backend() returns boolean
language sql stable as $$
  select current_user in ('service_role', 'postgres', 'supabase_admin');
$$;

alter table public.profiles          enable row level security;
alter table public.areas             enable row level security;
alter table public.shops             enable row level security;
alter table public.shop_members      enable row level security;
alter table public.shop_invites      enable row level security;
alter table public.pieces            enable row level security;
alter table public.gold_rates        enable row level security;
alter table public.site_settings     enable row level security;
alter table public.events            enable row level security;
alter table public.visit_requests    enable row level security;
alter table public.shop_applications enable row level security;

-- ---------------------------------------------------------------------------
-- profiles, areas, rates, settings
-- ---------------------------------------------------------------------------
create policy "read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy "update own name" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "admin manages profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Nobody but an admin changes a role, even on their own row.
create function public.guard_profile_role() returns trigger
language plpgsql as $$
begin
  if new.role is distinct from old.role and not (public.is_backend() or public.is_admin()) then
    raise exception 'Only an admin can change a role' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger profiles_guard_role before update on public.profiles for each row execute function public.guard_profile_role();

create policy "public reads areas" on public.areas for select to anon, authenticated using (true);
create policy "admin manages areas" on public.areas for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public reads rates" on public.gold_rates for select to anon, authenticated using (true);
create policy "admin writes rates" on public.gold_rates for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public reads settings" on public.site_settings for select to anon, authenticated using (true);
create policy "admin edits settings" on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- shops
-- ---------------------------------------------------------------------------
create policy "public reads live shops" on public.shops for select to anon, authenticated using (is_approved and is_active);
create policy "members read own shop" on public.shops for select to authenticated using (public.is_member(id));
create policy "members edit own shop" on public.shops for update to authenticated using (public.is_member(id)) with check (public.is_member(id));
create policy "admin manages shops" on public.shops for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- A jeweller edits their profile, never their approval, plan, featuring,
-- slug or demo flag.
create function public.guard_shop_columns() returns trigger
language plpgsql as $$
begin
  if public.is_backend() or public.is_admin() then return new; end if;
  if new.is_approved is distinct from old.is_approved or new.is_active is distinct from old.is_active
  or new.plan is distinct from old.plan or new.featured_order is distinct from old.featured_order
  or new.slug is distinct from old.slug or new.is_demo is distinct from old.is_demo then
    raise exception 'Only an admin can change approval, plan, featuring, slug or demo status' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger shops_guard_columns before update on public.shops for each row execute function public.guard_shop_columns();

-- ---------------------------------------------------------------------------
-- shop_members and invites: owners manage staff, admins manage everyone.
-- ---------------------------------------------------------------------------
create policy "read memberships of my shops" on public.shop_members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_member(shop_id) or public.is_admin());
create policy "owner removes staff" on public.shop_members for delete to authenticated
  using (public.is_owner(shop_id) and role = 'staff');
create policy "admin manages members" on public.shop_members for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "owner reads invites" on public.shop_invites for select to authenticated using (public.is_owner(shop_id) or public.is_admin());
create policy "owner invites staff" on public.shop_invites for insert to authenticated
  with check (public.is_owner(shop_id) and role = 'staff' and invited_by = (select auth.uid()));
create policy "owner cancels invites" on public.shop_invites for delete to authenticated using (public.is_owner(shop_id) and accepted_at is null);
create policy "admin manages invites" on public.shop_invites for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- pieces
-- ---------------------------------------------------------------------------
-- Stock nobody has confirmed for 30 days drops out of public view on its
-- own, with no scheduled job. The jeweller still sees it and can re-confirm.
create policy "public reads live pieces" on public.pieces for select to anon, authenticated using (
  status in ('available', 'reserved_in_store')
  and stock_confirmed_at > now() - interval '30 days'
  and public.is_public_shop(shop_id)
);
create policy "members read own pieces" on public.pieces for select to authenticated using (public.is_member(shop_id));
create policy "members add pieces" on public.pieces for insert to authenticated with check (public.is_member(shop_id));
create policy "members edit pieces" on public.pieces for update to authenticated using (public.is_member(shop_id)) with check (public.is_member(shop_id));
create policy "members delete pieces" on public.pieces for delete to authenticated using (public.is_member(shop_id));
create policy "admin manages pieces" on public.pieces for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Featuring on the homepage is the admin's call.
create function public.guard_piece_columns() returns trigger
language plpgsql as $$
begin
  if public.is_backend() or public.is_admin() then return new; end if;
  if (tg_op = 'INSERT' and new.featured_order is not null)
  or (tg_op = 'UPDATE' and new.featured_order is distinct from old.featured_order) then
    raise exception 'Only an admin can feature a piece' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger pieces_guard_columns before insert or update on public.pieces for each row execute function public.guard_piece_columns();

-- The price a customer sees. Listed prices as set; indicative ones from the
-- current rate: gold x weight + making, + VAT (0% for 24K bullion of 990 or
-- finer, which UAE law zero-rates; 5% otherwise), + stones.
create view public.piece_prices with (security_invoker = true) as
select
  p.id as piece_id,
  case
    when p.price_mode = 'on_request' or not s.show_prices then null
    when p.price_mode = 'listed' then p.price_aed
    else round(
      (r.rate_per_gram_aed * p.weight_grams
        + case p.making_charge_type
            when 'per_gram' then p.making_charge_value * p.weight_grams
            when 'percent' then r.rate_per_gram_aed * p.weight_grams * p.making_charge_value / 100
            else p.making_charge_value end)
      * (1 + case when p.purity = '24K' and coalesce(p.fineness::numeric, 0) >= 990 then 0 else 0.05 end)
      + p.stones_aed * 1.05)
  end as price_aed,
  case when p.price_mode = 'on_request' or not s.show_prices then 'on_request'::public.price_mode else p.price_mode end as price_mode,
  r.effective_at as rate_as_of
from public.pieces p
join public.shops s on s.id = p.shop_id
left join public.current_gold_rates r on r.purity = p.purity;

-- One tap: "everything I still show is still in the shop".
create function public.confirm_stock(p_shop uuid) returns integer
language plpgsql security invoker set search_path = '' as $$
declare n integer;
begin
  update public.pieces set stock_confirmed_at = now()
  where shop_id = p_shop and status in ('available', 'reserved_in_store');
  get diagnostics n = row_count;
  return n;
end $$;

-- ---------------------------------------------------------------------------
-- Customer activity: read by the shop and the admin only.
-- ---------------------------------------------------------------------------
create policy "members read own events" on public.events for select to authenticated using (public.is_member(shop_id) or public.is_admin());
create policy "members read own requests" on public.visit_requests for select to authenticated using (public.is_member(shop_id) or public.is_admin());
create policy "members update request status" on public.visit_requests for update to authenticated
  using (public.is_member(shop_id) or public.is_admin()) with check (public.is_member(shop_id) or public.is_admin());
create policy "admin deletes requests" on public.visit_requests for delete to authenticated using (public.is_admin());
create policy "admin manages applications" on public.shop_applications for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- A shop may change a request's status, not what the customer wrote.
create function public.guard_request_columns() returns trigger
language plpgsql as $$
begin
  if public.is_backend() or public.is_admin() then return new; end if;
  if new.customer_name is distinct from old.customer_name or new.customer_phone is distinct from old.customer_phone
  or new.note is distinct from old.note or new.preferred_date is distinct from old.preferred_date
  or new.shop_id is distinct from old.shop_id or new.piece_id is distinct from old.piece_id then
    raise exception 'Only the status of a visit request can be changed' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger visit_requests_guard before update on public.visit_requests for each row execute function public.guard_request_columns();

-- ---------------------------------------------------------------------------
-- The only ways the public writes anything. Each checks its input and keeps
-- a light limit so a script cannot flood a shop.
-- ---------------------------------------------------------------------------
create function public.log_event(p_shop uuid, p_type public.event_type, p_piece uuid default null, p_session text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_public_shop(p_shop) then return; end if;
  if p_piece is not null and not exists (select 1 from public.pieces where id = p_piece and shop_id = p_shop) then return; end if;
  if p_session is not null and (
    select count(*) from public.events where session_id = left(p_session, 64) and created_at > now() - interval '1 minute'
  ) >= 30 then return; end if;
  insert into public.events (shop_id, piece_id, type, session_id) values (p_shop, p_piece, p_type, left(p_session, 64));
end $$;

create function public.request_visit(p_shop uuid, p_piece uuid, p_name text, p_phone text, p_date date default null, p_note text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not public.is_public_shop(p_shop) then raise exception 'Shop not found' using errcode = 'P0002'; end if;
  if exists (select 1 from public.shops where id = p_shop and is_demo) then
    raise exception 'Demonstration shops do not take requests' using errcode = 'P0001';
  end if;
  if p_piece is not null and not exists (select 1 from public.pieces where id = p_piece and shop_id = p_shop) then
    raise exception 'Piece not found' using errcode = 'P0002';
  end if;
  if p_date is not null and p_date < current_date then raise exception 'Pick today or a later day' using errcode = '22023'; end if;
  if (select count(*) from public.visit_requests where customer_phone = p_phone and created_at > now() - interval '1 day') >= 5 then
    raise exception 'Too many requests from this number today' using errcode = 'P0001';
  end if;
  insert into public.visit_requests (shop_id, piece_id, customer_name, customer_phone, preferred_date, note)
  values (p_shop, p_piece, trim(p_name), trim(p_phone), p_date, nullif(trim(p_note), ''))
  returning id into v_id;
  perform public.log_event(p_shop, 'visit_request', p_piece, null);
  return v_id;
end $$;

create function public.apply_for_listing(p_shop_name text, p_contact text, p_email text, p_phone text, p_emirate text, p_area text default null, p_message text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if (select count(*) from public.shop_applications where lower(email) = lower(p_email) and created_at > now() - interval '1 day') >= 3 then
    raise exception 'An application from this email is already in' using errcode = 'P0001';
  end if;
  insert into public.shop_applications (shop_name, contact_name, email, phone, emirate, area, message)
  values (trim(p_shop_name), trim(p_contact), trim(p_email), trim(p_phone), p_emirate, nullif(trim(p_area), ''), nullif(trim(p_message), ''))
  returning id into v_id;
  return v_id;
end $$;

-- ---------------------------------------------------------------------------
-- Grants. Supabase grants table privileges to anon and authenticated by
-- default; take back what the public never needs.
-- ---------------------------------------------------------------------------
revoke insert, update, delete on public.events, public.visit_requests, public.shop_applications from anon, authenticated;
grant update (status) on public.visit_requests to authenticated;
grant delete on public.visit_requests to authenticated;
grant insert, update, delete on public.shop_applications to authenticated; -- admins, via policy
revoke execute on function public.confirm_stock(uuid) from public, anon;
grant execute on function public.confirm_stock(uuid) to authenticated;
grant execute on function public.log_event(uuid, public.event_type, uuid, text) to anon, authenticated;
grant execute on function public.request_visit(uuid, uuid, text, text, date, text) to anon, authenticated;
grant execute on function public.apply_for_listing(text, text, text, text, text, text, text) to anon, authenticated;
grant select on public.current_gold_rates, public.piece_prices to anon, authenticated;
