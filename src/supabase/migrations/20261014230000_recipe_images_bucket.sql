/*
 * ---------------------------------------------------------------------------
 * Recipe Sharing — Bucket Storage cho ảnh công thức (TASK 5)
 *
 * Bucket "recipe-images" (public): ảnh đại diện của công thức, do admin tải lên
 * qua server action (dùng service_role key nên bypass RLS khi ghi).
 *
 * Chính sách RLS:
 *   - SELECT: public (mọi người đều xem được ảnh).
 *   - INSERT/UPDATE/DELETE: không cho phép qua RLS — chỉ service_role
 *     (bypass RLS) được ghi, đảm bảo chỉ admin (kiểm tra ở server action)
 *     mới tải lên/xóa ảnh.
 * ---------------------------------------------------------------------------
 */

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

-- Mọi người đều đọc được ảnh công thức
create policy "recipe-images: public read"
    on storage.objects for select
    using (bucket_id = 'recipe-images');

-- Không cho phép ghi qua RLS: chỉ service_role (bypass RLS) được upload.
-- Không tạo policy INSERT/UPDATE/DELETE nào cho bucket này.
