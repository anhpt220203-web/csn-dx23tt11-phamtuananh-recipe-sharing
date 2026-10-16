-- ─── Tìm kiếm công thức theo SRS FR3 ───
-- Hàm RPC gom logic tìm kiếm để supabase-js gọi qua PostgREST.
--
-- Khớp từ khóa (không phân biệt hoa thường, KHÔNG phân biệt dấu tiếng Việt
-- nhờ kit.unaccent — "pho bo" vẫn khớp "Phở bò") với:
--   1. tên món (recipes.title)
--   2. mô tả (recipes.description)
--   3. tên nguyên liệu (recipe_ingredients.name)
--   4. tên nhóm món (categories.name)
-- Chỉ trả về công thức đã xuất bản (status = 'published').
--
-- Sắp xếp (p_sort):
--   'moi-nhat'     — công thức mới nhất trước (mặc định)
--   'danh-gia-cao' — điểm đánh giá trung bình cao nhất trước,
--                     chưa có đánh giá xếp cuối, hoà điểm giữ thứ tự mới nhất.

create or replace function public.search_recipes(
    p_query text,
    p_category_slug text default null,
    p_sort text default 'moi-nhat'
)
returns table (
    id             bigint,
    category_id    bigint,
    title          text,
    slug           text,
    description    text,
    image_url      text,
    status         text,
    source_name    text,
    source_url     text,
    servings       integer,
    cook_time      integer,
    difficulty     text,
    created_by     uuid,
    created_at     timestamptz,
    category_name  text,
    category_slug  text,
    rating_average numeric,
    rating_count   bigint
)
    language sql
    stable
    set search_path = ''
as
$$
    with needle as (
        -- Chuẩn hoá từ khoá: thường hoá chữ hoa + bỏ dấu.
        -- Dùng strpos thay vì LIKE để khỏi escape ký tự %, _ trong từ khoá.
        select kit.unaccent(lower(trim(p_query))) as value
    ),
    matched as (
        select r.*
        from public.recipes r
        cross join needle n
        where r.status = 'published'
          and n.value <> ''
          and (
                strpos(kit.unaccent(lower(r.title)), n.value) > 0
             or strpos(kit.unaccent(lower(coalesce(r.description, ''))), n.value) > 0
             or exists (
                    select 1
                    from public.recipe_ingredients ri
                    where ri.recipe_id = r.id
                      and strpos(kit.unaccent(lower(ri.name)), n.value) > 0
                )
             or exists (
                    select 1
                    from public.categories c
                    where c.id = r.category_id
                      and strpos(kit.unaccent(lower(c.name)), n.value) > 0
                )
          )
          and (
                p_category_slug is null
             or exists (
                    select 1
                    from public.categories c
                    where c.id = r.category_id
                      and c.slug = p_category_slug
                )
          )
    ),
    rated as (
        select
            m.*,
            (
                select avg(ra.rating)::numeric
                from public.ratings ra
                where ra.recipe_id = m.id
            ) as avg_rating,
            (
                select count(*)
                from public.ratings ra
                where ra.recipe_id = m.id
            ) as rating_ct
        from matched m
    )
    select
        rated.id,
        rated.category_id,
        rated.title,
        rated.slug,
        rated.description,
        rated.image_url,
        rated.status,
        rated.source_name,
        rated.source_url,
        rated.servings,
        rated.cook_time,
        rated.difficulty,
        rated.created_by,
        rated.created_at,
        c.name as category_name,
        c.slug as category_slug,
        rated.avg_rating as rating_average,
        rated.rating_ct as rating_count
    from rated
    join public.categories c on c.id = rated.category_id
    order by
        -- 'danh-gia-cao': điểm TB giảm dần, chưa đánh giá xếp cuối;
        -- 'moi-nhat' (hoặc giá trị lạ): biểu thức CASE ra NULL hết,
        -- chỉ còn sắp theo created_at giảm dần.
        case when p_sort = 'danh-gia-cao' then rated.avg_rating end desc nulls last,
        rated.created_at desc;
$$;

comment on function public.search_recipes(text, text, text)
    is 'Tìm kiếm công thức theo FR3: tên món, mô tả, tên nguyên liệu, tên nhóm món (không dấu); chỉ published; sắp xếp moi-nhat | danh-gia-cao.';

-- Dữ liệu đọc được công khai theo RLS nên hàm chạy SECURITY INVOKER
-- (mặc định), không cần definer — chỉ cần quyền execute.
grant execute on function public.search_recipes(text, text, text)
    to anon, authenticated, service_role;
