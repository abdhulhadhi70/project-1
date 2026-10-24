-- Row-level security checks. Each block switches role the way PostgREST does.
\set ON_ERROR_STOP on
\set QUIET on
\pset tuples_only on
\pset format unaligned

insert into auth.users (id, email) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'admin@test.local'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'souk@test.local'),
  ('aaaaaaaa-0000-4000-8000-000000000003', 'karama@test.local');
update public.profiles set role = 'admin' where id = 'aaaaaaaa-0000-4000-8000-000000000001';
update public.shops set owner_user_id = 'aaaaaaaa-0000-4000-8000-000000000002' where slug = 'demo-souk-lane-jewellers';
update public.shops set owner_user_id = 'aaaaaaaa-0000-4000-8000-000000000003' where slug = 'demo-karama-gold-house';
-- A pending shop with a product the public must never see.
insert into public.shops (id, name, slug, emirate, area, is_approved)
  values ('44444444-4444-4444-8444-444444444444', 'Pending Shop', 'pending-shop', 'Sharjah', 'Rolla', false);
insert into public.products (shop_id, code, title, slug, category, karat, weight_grams,
  making_charge_type, making_charge_value, images)
  values ('44444444-4444-4444-8444-444444444444', 'PEN-0001', 'Hidden ring', 'hidden-ring', 'ring', 22, 3, 'fixed', 50, array['x']);

create function pg_temp.check(label text, ok boolean) returns void language plpgsql as $$
begin
  if not ok then raise exception 'FAIL: %', label; end if;
  raise notice 'ok  %', label;
end $$;

-- ---------- anon ----------
set role anon;
select pg_temp.check('anon sees 3 live shops', (select count(*) from public.shops) = 3);
select pg_temp.check('anon sees only available/reserved, confirmed <30d products',
  (select count(*) from public.products) = 26);
select pg_temp.check('anon never sees sold or stale products',
  not exists (select 1 from public.products where status = 'sold' or last_confirmed_at < now() - interval '30 days'));
select pg_temp.check('anon reads 4 current rates', (select count(*) from public.current_gold_rates) = 4);
select pg_temp.check('anon reads no events', (select count(*) from public.events) = 0);
do $$ begin
  insert into public.events (shop_id, type) values ('11111111-1111-4111-8111-111111111111', 'shop_view');
  raise exception 'FAIL: anon inserted an event';
exception when insufficient_privilege then raise notice 'ok  anon cannot insert events';
end $$;
do $$ begin
  insert into public.gold_rates (karat, rate_per_gram_aed) values (24, 1);
  raise exception 'FAIL: anon inserted a rate';
exception when insufficient_privilege then raise notice 'ok  anon cannot write rates';
end $$;
reset role;

-- ---------- jeweller (Souk Lane) ----------
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000002';
select pg_temp.check('jeweller sees all 10 own products incl. sold/stale',
  (select count(*) from public.products where shop_id = '11111111-1111-4111-8111-111111111111') = 10);
select pg_temp.check('jeweller cannot see other shops'' sold/hidden stock',
  (select count(*) from public.products where shop_id = '22222222-2222-4222-8222-222222222222') = 9);
update public.products set status = 'hidden' where shop_id = '22222222-2222-4222-8222-222222222222';
select pg_temp.check('jeweller update on another shop touches nothing',
  (select count(*) from public.products where shop_id = '22222222-2222-4222-8222-222222222222' and status = 'hidden') = 0);
do $$ begin
  insert into public.products (shop_id, code, title, slug, category, karat, weight_grams,
    making_charge_type, making_charge_value, images)
  values ('22222222-2222-4222-8222-222222222222', 'KGH-9999', 'Sneaky', 'sneaky', 'ring', 22, 2, 'fixed', 1, array['x']);
  raise exception 'FAIL: jeweller inserted into another shop';
exception when insufficient_privilege then raise notice 'ok  jeweller cannot add to another shop';
end $$;
insert into public.products (shop_id, code, title, slug, category, karat, weight_grams,
  making_charge_type, making_charge_value, images)
values ('11111111-1111-4111-8111-111111111111', 'DSL-0999', 'New ring', 'new-ring', 'ring', 22, 2.5, 'per_gram', 20, array['a']);
select pg_temp.check('confirm_stock revives own stale stock', public.confirm_stock('11111111-1111-4111-8111-111111111111') = 10);
select pg_temp.check('confirm_stock on another shop does nothing', public.confirm_stock('22222222-2222-4222-8222-222222222222') = 0);
update public.shops set about = 'Updated', show_prices = false where slug = 'demo-souk-lane-jewellers';
do $$ begin
  update public.shops set plan = 'featured' where slug = 'demo-souk-lane-jewellers' and plan <> 'featured';
  update public.shops set is_approved = false where slug = 'demo-souk-lane-jewellers';
  raise exception 'FAIL: jeweller changed approval';
exception when insufficient_privilege then raise notice 'ok  jeweller cannot change approval/plan';
end $$;
do $$ begin
  update public.profiles set role = 'admin';
  if exists (select 1 from public.profiles where role = 'admin') then
    raise exception 'FAIL: jeweller promoted self';
  end if;
  raise notice 'ok  jeweller cannot promote self';
end $$;
select pg_temp.check('jeweller cannot see pending shop', (select count(*) from public.shops where slug = 'pending-shop') = 0);
reset role;

-- ---------- service role (server routes) ----------
set role service_role;
insert into public.events (shop_id, type) values ('11111111-1111-4111-8111-111111111111', 'whatsapp_click');
insert into public.visit_intents (shop_id, customer_name, customer_phone) values
  ('11111111-1111-4111-8111-111111111111', 'Test Customer', '+971 50 123 4567');
reset role;

-- ---------- jeweller sees own results only ----------
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000003';
select pg_temp.check('other jeweller sees none of Souk Lane''s events/intents',
  (select count(*) from public.events) + (select count(*) from public.visit_intents) = 0);
set request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000002';
select pg_temp.check('owner sees own event and intent',
  (select count(*) from public.events) = 1 and (select count(*) from public.visit_intents) = 1);
update public.visit_intents set status = 'contacted';
reset role;

-- ---------- admin ----------
set role authenticated;
set request.jwt.claim.sub = 'aaaaaaaa-0000-4000-8000-000000000001';
select pg_temp.check('admin sees pending shop', (select count(*) from public.shops) = 4);
insert into public.gold_rates (karat, rate_per_gram_aed, set_by)
  values (24, 441.10, 'aaaaaaaa-0000-4000-8000-000000000001');
select pg_temp.check('new rate becomes current',
  (select rate_per_gram_aed from public.current_gold_rates where karat = 24) = 441.10);
update public.shops set is_approved = true where slug = 'pending-shop';
reset role;

\echo 'All RLS checks passed.'
