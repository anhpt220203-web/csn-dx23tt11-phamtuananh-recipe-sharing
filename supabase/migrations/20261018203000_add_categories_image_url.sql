-- Thêm cột ảnh đại diện cho bảng categories (tính năng Quản lý media).
-- Idempotent: chạy lại nhiều lần vẫn an toàn (merge vào dev là Supabase tự chạy).

alter table public.categories
    add column if not exists image_url text;
