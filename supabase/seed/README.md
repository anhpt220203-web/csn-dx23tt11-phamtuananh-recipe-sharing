# Seed dữ liệu mẫu

Thư mục này chứa dữ liệu mẫu nạp vào database Supabase.

## Các file

| File | Nội dung |
|---|---|
| `01_demo.sql` | 1 danh mục + 1 công thức mẫu (Gà chiên vị bơ tỏi) để kiểm tra giao diện |
| `02_recipes_batch1.sql` | 12 công thức batch 1 (từ monngonmoingay.com, nội dung viết lại) |
| `images/` | Ảnh các món ăn, đặt tên theo slug (vd: `salad-bong-cai-tron-tom-bap.png`) |

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
2. Copy nội dung file `.sql` và chạy (theo thứ tự: `01_demo.sql` trước, `02_recipes_batch1.sql` sau)

**Lưu ý:**
- Tất cả seed đều idempotent (dùng `ON CONFLICT`), chạy lại nhiều lần an toàn
- Nội dung công thức được **viết lại bằng lời của mình**, không sao chép nguyên văn từ nguồn
- Nguồn ghi trong cột `source_name`: `'Tóm tắt từ monngonmoingay.com'`
