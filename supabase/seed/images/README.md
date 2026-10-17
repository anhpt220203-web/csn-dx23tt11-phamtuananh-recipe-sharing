# Thư mục ảnh demo — `supabase/seed/images/`

Đặt ảnh minh hoạ công thức demo vào thư mục này, đặt tên theo **slug công thức**:

```
<slug-cong-thuc>.jpg   (hoặc .png / .webp)
```

Ví dụ: `pho-bo-ha-noi.jpg`, `ga-chien-vi-bo-toi.png`.

Khi chạy seed (docker `db-migrate` hoặc `pnpm --filter web seed:images`), mọi file
trong thư mục sẽ được:

1. **Upload lên Supabase Storage** bucket `recipe-images` (upsert — chạy lại an toàn).
2. **Gắn `image_url = 'recipe-images/<tên-file>'`** cho công thức có slug trùng tên file.

Trình duyệt không bao giờ thấy link storage thật — app phục vụ ảnh qua
route proxy `/api/image/<bucket>/<đường-dẫn>` (xem
`src/apps/web/app/api/image/[...path]/route.ts`).

Thư mục này chỉ phục vụ **demo**: file không cần commit hết lên git nếu nặng —
chỉ cần ném ảnh vào trước khi chạy seed.
