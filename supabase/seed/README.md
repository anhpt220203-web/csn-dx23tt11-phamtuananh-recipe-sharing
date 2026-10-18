# Seed dữ liệu mẫu

Thư mục này chứa dữ liệu mẫu nạp vào database Supabase.

## Các file

| File | Nội dung |
|---|---|
| `01_demo_recipe.sql` | 1 danh mục + 1 công thức mẫu (Gà chiên vị bơ tỏi) để kiểm tra giao diện |
| `02_demo_users.sql` | 2 tài khoản demo (admin `phamtuananh@example.com` + member `member@example.com`) |
| `02_recipes_batch1.sql` | 12 công thức batch 1 (trang 1 monngonmoingay.com, nội dung viết lại) |
| `03_recipes_batch2.sql` | 24 công thức batch 2 (trang 2+3 monngonmoingay.com) — ⚠️ **DỰ THẢO**, chờ đối chiếu bản gốc qua browser |
| `images/` | Ảnh các món ăn, đặt tên theo slug (vd: `sup-tom-gyoza.png`) |

## Cách upload ảnh lên Supabase Storage

1. Vào Supabase Dashboard → Storage → bucket `recipe-images`
2. Upload từng file trong `images/` (giữ nguyên tên file)
3. Đảm bảo bucket ở chế độ **public** để `image_url` truy cập được

Đường dẫn ảnh trong seed có dạng:
```
https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/<slug>.png
```

## Cách chạy seed

**Trên Supabase cloud (SQL Editor):**
1. Mở SQL Editor trong Dashboard
2. Copy nội dung file `.sql` và chạy theo thứ tự:
   `01_demo_recipe.sql` → `02_demo_users.sql` → `02_recipes_batch1.sql` → `03_recipes_batch2.sql`

**Lưu ý:**
- Tất cả seed đều idempotent (dùng `ON CONFLICT`), chạy lại nhiều lần an toàn
- Nội dung công thức được **viết lại bằng lời của mình**, không sao chép nguyên văn từ nguồn
- Nguồn ghi trong cột `source_name`: `'Tóm tắt từ monngonmoingay.com'`
- Batch 2 đang ở trạng thái **DỰ THẢO**: cần browser task trích xuất chính xác nội dung gốc rồi cập nhật trước khi merge
