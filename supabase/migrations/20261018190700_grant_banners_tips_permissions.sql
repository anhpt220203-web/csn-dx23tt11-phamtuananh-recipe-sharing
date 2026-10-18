-- Cấp quyền bảng và sequence cho banners, tips, tags, recipe_tags
-- để service_role và authenticated có thể thực hiện các thao tác quản trị

grant all on table public.banners to authenticated, service_role;
grant all on sequence public.banners_id_seq to authenticated, service_role;

grant all on table public.tips to authenticated, service_role;
grant all on sequence public.tips_id_seq to authenticated, service_role;

grant all on table public.tags to authenticated, service_role;
grant all on sequence public.tags_id_seq to authenticated, service_role;

grant all on table public.recipe_tags to authenticated, service_role;

drop policy if exists "banners_admin_all" on public.banners;
create policy "banners_admin_all"
    on public.banners for all
    to authenticated
    using (kit.is_admin())
    with check (kit.is_admin());

drop policy if exists "tips_admin_all" on public.tips;
create policy "tips_admin_all"
    on public.tips for all
    to authenticated
    using (kit.is_admin())
    with check (kit.is_admin());
