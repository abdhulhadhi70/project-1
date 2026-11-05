-- Access rules, checked the way the site will use them. Each block switches
-- role as Supabase's API does. Run with scripts/test-db.sh.
\set ON_ERROR_STOP on
\set QUIET on
\pset tuples_only on
\pset format unaligned

create function pg_temp.check(label text, ok boolean) returns void language plpgsql as $$
begin
  if ok is not true then raise exception 'FAIL: %', label; end if;
  raise notice 'ok  %', label;
end $$;

-- Expect a statement to be refused.
create function pg_temp.refused(label text, stmt text) returns void language plpgsql as $$
begin
  execute stmt;
  raise exception 'FAIL: % (was allowed)', label;
exception
  when insufficient_privilege then raise notice 'ok  %', label;
  when raise_exception then
    if sqlerrm like 'FAIL:%' then raise; end if;
    raise notice 'ok  % (%)', label, sqlerrm;
  when others then raise notice 'ok  % (%)', label, sqlerrm;
end $$;

-- People: an admin, Sidra's owner, Yasmeen's owner.
insert into auth.users (id, email, email_confirmed_at) values
  ('a0000000-0000-4000-8000-000000000001', 'admin@test.local', now()),
  ('a0000000-0000-4000-8000-000000000002', 'sidra@test.local', now()),
  ('a0000000-0000-4000-8000-000000000003', 'yasmeen@test.local', now());
update public.profiles set role = 'admin' where id = 'a0000000-0000-4000-8000-000000000001';
insert into public.shop_members (shop_id, user_id, role)
select id, 'a0000000-0000-4000-8000-000000000002', 'owner' from public.shops where slug = 'sidra-atelier';
insert into public.shop_members (shop_id, user_id, role)
select id, 'a0000000-0000-4000-8000-000000000003', 'owner' from public.shops where slug = 'yasmeen-gold';
-- A real (non-demo) shop awaiting approval, with one piece.
insert into public.shops (slug, name, area, is_approved) values ('pending-shop', 'Pending Shop', 'karama', false);
insert into public.pieces (shop_id, code, slug, name, category, purity, weight_grams, making_charge_type, making_charge_value, images)
select id, 'PS-0001', 'hidden-ring', 'Hidden ring', 'rings', '22K', 3, 'fixed', 50, array['x'] from public.shops where slug = 'pending-shop';
-- A sold and a stale piece at Sidra, which the public must not see.
update public.pieces set status = 'sold' where slug = '22k-twisted-kada';
update public.pieces set stock_confirmed_at = now() - interval '45 days' where slug = '22k-twisted-hoop-earrings';

-- =========================================================================
set role anon;
select pg_temp.check('public sees the 2 live shops', (select count(*) from public.shops) = 2);
select pg_temp.check('public sees 10 pieces: not sold, not stale, not pending', (select count(*) from public.pieces) = 10);
select pg_temp.check('public sees areas and current rates', (select count(*) from public.areas) = 8 and (select count(*) from public.current_gold_rates) = 4);
select pg_temp.check('indicative price matches the site (rope chain AED 9,374)',
  (select pp.price_aed from public.piece_prices pp join public.pieces p on p.id = pp.piece_id where p.slug = '22k-rope-chain') = 9374);
select pg_temp.check('listed price as set (layered necklace)',
  (select pp.price_aed from public.piece_prices pp join public.pieces p on p.id = pp.piece_id where p.slug = '22k-layered-necklace') = 9640);
select pg_temp.check('public reads no events, requests or applications',
  (select count(*) from public.events) + (select count(*) from public.visit_requests) + (select count(*) from public.shop_applications) = 0);
select pg_temp.refused('public cannot write events directly', $$insert into public.events (shop_id, type) select id, 'shop_view' from public.shops limit 1$$);
select pg_temp.refused('public cannot write rates', $$insert into public.gold_rates (purity, rate_per_gram_aed) values ('24K', 1)$$);
update public.site_settings set site_name = 'Hacked';
select pg_temp.check('public cannot edit settings', (select site_name from public.site_settings) = 'Tibr');
select public.log_event((select id from public.shops where slug = 'sidra-atelier'), 'whatsapp_click', null, 'sess-1');
select pg_temp.refused('demo shop takes no visit requests',
  $$select public.request_visit((select id from public.shops where slug = 'sidra-atelier'), null, 'A', '050 123 4567')$$);
select pg_temp.check('anyone can apply to list a shop', public.apply_for_listing('Real Gold LLC', 'Omar', 'omar@example.org', '050 555 0101', 'Dubai', 'Karama', null) is not null);
reset role;
select pg_temp.check('event logged through the function', (select count(*) from public.events where type = 'whatsapp_click') = 1);
select pg_temp.check('application stored', (select count(*) from public.shop_applications) = 1);

-- =========================================================================
set role authenticated;
set request.jwt.claim.sub = 'a0000000-0000-4000-8000-000000000002'; -- Sidra's owner
select pg_temp.check('owner sees all 6 own pieces, sold and stale included',
  (select count(*) from public.pieces p join public.shops s on s.id = p.shop_id where s.slug = 'sidra-atelier') = 6);
update public.pieces set name = '22K Rope Chain, 50 cm' where slug = '22k-rope-chain';
select pg_temp.check('owner edits own piece', (select name from public.pieces where slug = '22k-rope-chain') = '22K Rope Chain, 50 cm');
update public.pieces set name = 'Changed' where slug = '22k-layered-necklace';
select pg_temp.check('owner cannot edit another shop''s piece', (select name from public.pieces where slug = '22k-layered-necklace') <> 'Changed');
select pg_temp.refused('owner cannot add a piece to another shop',
  $$insert into public.pieces (shop_id, code, slug, name, category, purity, weight_grams, making_charge_type, making_charge_value, images)
    select id, 'YG-9999', 'sneaky', 'Sneaky', 'rings', '22K', 2, 'fixed', 1, array['x'] from public.shops where slug = 'yasmeen-gold'$$);
insert into public.pieces (shop_id, code, slug, name, category, purity, weight_grams, making_charge_type, making_charge_value, images)
select id, 'SA-0999', 'new-ring', 'New ring', 'rings', '22K', 2.5, 'per_gram', 20, array['a'] from public.shops where slug = 'sidra-atelier';
select pg_temp.check('owner adds own piece', exists (select 1 from public.pieces where slug = 'new-ring'));
select pg_temp.refused('owner cannot feature a piece', $$update public.pieces set featured_order = 1 where slug = 'new-ring'$$);
select pg_temp.refused('owner cannot approve or re-plan own shop', $$update public.shops set plan = 'featured' where slug = 'sidra-atelier'$$);
update public.shops set hours = 'Daily 10:00–22:00', show_prices = false where slug = 'sidra-atelier';
select pg_temp.check('owner edits own shop profile', (select hours from public.shops where slug = 'sidra-atelier') = 'Daily 10:00–22:00');
select pg_temp.check('show_prices off turns prices into "on request"',
  (select pp.price_mode from public.piece_prices pp join public.pieces p on p.id = pp.piece_id where p.slug = '22k-rope-chain') = 'on_request');
select pg_temp.check('confirm stock revives own stale stock',
  public.confirm_stock((select id from public.shops where slug = 'sidra-atelier')) = 6);
select pg_temp.check('confirm stock does nothing to another shop',
  public.confirm_stock((select id from public.shops where slug = 'yasmeen-gold')) = 0);
select pg_temp.refused('nobody promotes themselves', $$update public.profiles set role = 'admin' where id = 'a0000000-0000-4000-8000-000000000002'$$);
select pg_temp.check('owner cannot see the pending shop or applications',
  (select count(*) from public.shops where slug = 'pending-shop') + (select count(*) from public.shop_applications) = 0);
select pg_temp.check('owner sees own clicks', (select count(*) from public.events) = 1);
-- Staff invitation
insert into public.shop_invites (shop_id, email, role, invited_by)
select id, 'staff@test.local', 'staff', 'a0000000-0000-4000-8000-000000000002' from public.shops where slug = 'sidra-atelier';
select pg_temp.refused('owner cannot invite a second owner',
  $$insert into public.shop_invites (shop_id, email, role, invited_by)
    select id, 'boss@test.local', 'owner', 'a0000000-0000-4000-8000-000000000002' from public.shops where slug = 'sidra-atelier'$$);
select pg_temp.refused('owner cannot invite into another shop',
  $$insert into public.shop_invites (shop_id, email, role, invited_by)
    select id, 'x@test.local', 'staff', 'a0000000-0000-4000-8000-000000000002' from public.shops where slug = 'yasmeen-gold'$$);
reset role;

-- The invited person signs up, but has not confirmed the email yet.
insert into auth.users (id, email) values ('a0000000-0000-4000-8000-000000000004', 'staff@test.local');
select pg_temp.check('unconfirmed sign-up does not join the shop',
  not exists (select 1 from public.shop_members where user_id = 'a0000000-0000-4000-8000-000000000004'));
update auth.users set email_confirmed_at = now() where id = 'a0000000-0000-4000-8000-000000000004';
select pg_temp.check('confirming the email joins the shop as staff',
  (select role from public.shop_members where user_id = 'a0000000-0000-4000-8000-000000000004') = 'staff');

set role authenticated;
set request.jwt.claim.sub = 'a0000000-0000-4000-8000-000000000004'; -- staff
select pg_temp.check('staff sees the shop''s pieces', (select count(*) from public.pieces p join public.shops s on s.id = p.shop_id where s.slug = 'sidra-atelier') = 7);
delete from public.shop_members where role = 'owner';
reset role;
select pg_temp.check('staff cannot remove the owner', (select count(*) from public.shop_members where role = 'owner') = 2);
set role authenticated;
set request.jwt.claim.sub = 'a0000000-0000-4000-8000-000000000002'; -- owner
delete from public.shop_members where user_id = 'a0000000-0000-4000-8000-000000000004';
select pg_temp.check('owner removes staff', not exists (select 1 from public.shop_members where user_id = 'a0000000-0000-4000-8000-000000000004'));
reset role;

-- =========================================================================
-- Visit requests need a real shop: approve the pending one.
update public.shops set is_approved = true where slug = 'pending-shop';
insert into auth.users (id, email, email_confirmed_at) values ('a0000000-0000-4000-8000-000000000005', 'real@test.local', now());
insert into public.shop_members (shop_id, user_id, role) select id, 'a0000000-0000-4000-8000-000000000005', 'owner' from public.shops where slug = 'pending-shop';
set role anon;
select pg_temp.check('a customer can ask to visit a real shop', public.request_visit((select id from public.shops where slug = 'pending-shop'),
  (select id from public.pieces where slug = 'hidden-ring'), 'Test Customer', '050 123 4567', current_date + 1, 'After 6pm') is not null);
select pg_temp.refused('visit request cannot be in the past',
  $$select public.request_visit((select id from public.shops where slug = 'pending-shop'), null, 'A', '050 123 4568', current_date - 1)$$);
reset role;
set role authenticated;
set request.jwt.claim.sub = 'a0000000-0000-4000-8000-000000000005';
select pg_temp.check('shop sees its visit request', (select count(*) from public.visit_requests) = 1);
update public.visit_requests set status = 'contacted';
select pg_temp.check('shop updates the status', (select status from public.visit_requests) = 'contacted');
select pg_temp.refused('shop cannot rewrite what the customer wrote', $$update public.visit_requests set customer_phone = '000 000 0000'$$);
set request.jwt.claim.sub = 'a0000000-0000-4000-8000-000000000003'; -- Yasmeen
select pg_temp.check('another shop sees none of it', (select count(*) from public.visit_requests) + (select count(*) from public.events) = 0);
reset role;

-- =========================================================================
set role authenticated;
set request.jwt.claim.sub = 'a0000000-0000-4000-8000-000000000001'; -- admin
select pg_temp.check('admin sees every shop and application', (select count(*) from public.shops) = 3 and (select count(*) from public.shop_applications) = 1);
insert into public.gold_rates (purity, rate_per_gram_aed, set_by) values ('22K', 460, 'a0000000-0000-4000-8000-000000000001');
select pg_temp.check('new rate becomes current', (select rate_per_gram_aed from public.current_gold_rates where purity = '22K') = 460);
update public.shops set show_prices = true where slug = 'sidra-atelier';
select pg_temp.check('indicative prices follow the new rate',
  (select pp.price_aed from public.piece_prices pp join public.pieces p on p.id = pp.piece_id where p.slug = '22k-rope-chain') = round((460 * 18.6 + 24 * 18.6) * 1.05));
update public.pieces set featured_order = 1 where slug = '22k-coin-collar-necklace';
update public.site_settings set notice_text = 'Pilot', show_notice = false;
select pg_temp.check('admin features pieces and edits settings',
  (select featured_order from public.pieces where slug = '22k-coin-collar-necklace') = 1 and (select notice_text from public.site_settings) = 'Pilot');
update public.shops set is_active = false where slug = 'pending-shop';
reset role;
set role anon;
select pg_temp.check('a suspended shop and its pieces disappear', (select count(*) from public.shops where slug = 'pending-shop') + (select count(*) from public.pieces where slug = 'hidden-ring') = 0);
reset role;

-- =========================================================================
-- Photo storage: a shop writes only in its own folder.
set role authenticated;
set request.jwt.claim.sub = 'a0000000-0000-4000-8000-000000000002'; -- Sidra's owner
insert into storage.objects (bucket_id, name) select 'pieces', id::text || '/photo-1.webp' from public.shops where slug = 'sidra-atelier';
select pg_temp.check('owner uploads into own shop folder', (select count(*) from storage.objects) = 1);
select pg_temp.refused('owner cannot upload into another shop''s folder',
  $$insert into storage.objects (bucket_id, name) select 'pieces', id::text || '/x.webp' from public.shops where slug = 'yasmeen-gold'$$);
reset role;

-- =========================================================================
-- Team functions
set role authenticated;
set request.jwt.claim.sub = 'a0000000-0000-4000-8000-000000000002'; -- Sidra's owner
select pg_temp.check('owner sees the team with emails',
  (select count(*) from public.shop_team((select id from public.shops where slug = 'sidra-atelier')) where email = 'sidra@test.local') = 1);
select pg_temp.check('owner adds an existing account as staff at once',
  public.add_member_by_email((select id from public.shops where slug = 'sidra-atelier'), 'staff@test.local') = 'added');
select pg_temp.check('owner invites a new email',
  public.add_member_by_email((select id from public.shops where slug = 'sidra-atelier'), 'New.Person@Test.local') = 'invited');
select pg_temp.refused('owner cannot add another owner',
  $$select public.add_member_by_email((select id from public.shops where slug = 'sidra-atelier'), 'x@test.local', 'owner')$$);
select pg_temp.refused('owner cannot add to another shop',
  $$select public.add_member_by_email((select id from public.shops where slug = 'yasmeen-gold'), 'x@test.local')$$);
select pg_temp.check('another shop''s team is invisible',
  (select count(*) from public.shop_team((select id from public.shops where slug = 'yasmeen-gold'))) = 0);
set request.jwt.claim.sub = 'a0000000-0000-4000-8000-000000000001'; -- admin
select pg_temp.check('admin makes someone an owner',
  public.add_member_by_email((select id from public.shops where slug = 'yasmeen-gold'), 'real@test.local', 'owner') = 'added');
reset role;
set role anon;
select pg_temp.refused('the public cannot list a team', $$select * from public.shop_team((select id from public.shops where slug = 'sidra-atelier'))$$);
reset role;

\echo 'All access checks passed.'
