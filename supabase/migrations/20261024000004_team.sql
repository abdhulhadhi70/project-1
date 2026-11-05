-- Team management for the jeweller and admin portals.
--
-- A shop may not read other people's profiles, so these two functions do
-- the one thing the team screen needs, and check who is asking.

-- Who belongs to a shop, with their email. Members of that shop and admins only.
create function public.shop_team(p_shop uuid)
returns table (user_id uuid, email text, full_name text, role public.member_role, joined_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select m.user_id, p.email, p.full_name, m.role, m.created_at
  from public.shop_members m
  join public.profiles p on p.id = m.user_id
  where m.shop_id = p_shop and (public.is_member(p_shop) or public.is_admin())
  order by m.role, m.created_at;
$$;

-- Add someone to a shop by email. If they already have an account they join
-- at once; otherwise an invitation waits until they sign up and confirm.
-- Owners may add staff to their own shop; admins may add anyone as anything.
-- Returns 'added' or 'invited'.
create function public.add_member_by_email(p_shop uuid, p_email text, p_role public.member_role default 'staff')
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid;
  v_email text := lower(trim(p_email));
begin
  if not (public.is_admin() or (public.is_owner(p_shop) and p_role = 'staff')) then
    raise exception 'Only the shop owner can add staff' using errcode = '42501';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'That email address does not look right' using errcode = '22023';
  end if;
  select id into v_user from public.profiles where lower(email) = v_email;
  if v_user is not null then
    insert into public.shop_members (shop_id, user_id, role) values (p_shop, v_user, p_role)
    on conflict (shop_id, user_id) do update set role = excluded.role;
    return 'added';
  end if;
  insert into public.shop_invites (shop_id, email, role, invited_by) values (p_shop, v_email, p_role, (select auth.uid()))
  on conflict (shop_id, email) do update set role = excluded.role, accepted_at = null;
  return 'invited';
end $$;

revoke execute on function public.shop_team(uuid) from public, anon;
revoke execute on function public.add_member_by_email(uuid, text, public.member_role) from public, anon;
grant execute on function public.shop_team(uuid) to authenticated;
grant execute on function public.add_member_by_email(uuid, text, public.member_role) to authenticated;

-- Also in the storage file; repeated here (safely) for projects that ran an
-- earlier version of it. Storage needs it to replace or remove a photo.
drop policy if exists "shop members list photos" on storage.objects;
create policy "shop members list photos" on storage.objects for select to authenticated
  using (
    bucket_id = 'pieces' and (
      public.is_admin()
      or (storage.foldername(name))[1] in (select shop_id::text from public.shop_members where user_id = (select auth.uid()))
    )
  );
