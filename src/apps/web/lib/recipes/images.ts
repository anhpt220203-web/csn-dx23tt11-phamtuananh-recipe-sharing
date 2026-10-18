const STORAGE_MARKER = '/storage/v1/object/public/';
const RECIPE_BUCKET = 'recipe-images';

/**
 * Chuyển `image_url` (được lưu trong DB hoặc nhập từ admin/seed) thành URL an toàn cho trình duyệt:
 *
 * Lưu ý quan trọng: Tất cả ảnh đại diện món ăn đều được seed / lưu trữ trong Supabase Storage
 * (bucket `recipe-images`), không nằm trong thư mục `/public` của Next.js app.
 *
 * Các định dạng được chuẩn hoá:
 * - `blob:...` hoặc `data:...`: URL preview tạm thời từ phía client → dùng nguyên gốc.
 * - `/api/image/...`: đã là URL proxy qua server → dùng nguyên gốc.
 * - `https?://.../storage/v1/object/public/<path>`: URL Supabase Storage đầy đủ → chuyển thành `/api/image/<path>`.
 * - URL bên ngoài (Unsplash, CDN khác không thuộc Supabase): giữ nguyên.
 * - `recipe-images/<file>` hoặc `/recipe-images/<file>`: chuyển thành `/api/image/recipe-images/<file>`.
 * - `/storage/v1/object/public/<path>`: chuyển thành `/api/image/<path>`.
 * - `/images/recipes/<file>` (dạng seed cũ trước khi chuyển sang Storage): chuyển thành `/api/image/recipe-images/<file>`.
 * - Tên file hoặc path con (`recipes/<uuid>.jpg`): chuyển thành `/api/image/recipe-images/<cleanPath>`.
 * - Các file tĩnh hệ thống khác trong `/public` (vd `/images/logo.webp`): giữ nguyên.
 */
export function resolveRecipeImageSrc(
  imageUrl: string | null | undefined,
): string | null {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null;
  }

  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return null;
  }

  // 1. Preview client-side (blob/data)
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // 2. Đã được resolve thành proxy API
  if (trimmed.startsWith('/api/image/')) {
    return trimmed;
  }

  // 3. URL tuyệt đối qua HTTP(S)
  if (/^https?:\/\//i.test(trimmed)) {
    const markerIndex = trimmed.indexOf(STORAGE_MARKER);

    if (markerIndex !== -1) {
      const storagePath = trimmed
        .slice(markerIndex + STORAGE_MARKER.length)
        .replace(/^\/+/, '');
      return `/api/image/${storagePath}`;
    }

    // URL ngoài không thuộc storage Supabase — dùng nguyên gốc
    return trimmed;
  }

  // Bỏ dấu gạch chéo ở đầu để chuẩn hoá xử lý đường dẫn
  const cleanPath = trimmed.replace(/^\/+/, '');

  // 4. Đường dẫn chứa marker Supabase Storage relative: /storage/v1/object/public/...
  if (cleanPath.startsWith('storage/v1/object/public/')) {
    const sub = cleanPath.slice('storage/v1/object/public/'.length);
    return `/api/image/${sub}`;
  }

  // 5. Đường dẫn bắt đầu bằng bucket 'recipe-images/'
  if (cleanPath.startsWith(`${RECIPE_BUCKET}/`)) {
    return `/api/image/${cleanPath}`;
  }

  // 6. Đường dẫn legacy seed cũ: 'images/recipes/<file>' -> chuyển vào bucket recipe-images
  if (cleanPath.startsWith('images/recipes/')) {
    const file = cleanPath.slice('images/recipes/'.length);
    return `/api/image/${RECIPE_BUCKET}/${file}`;
  }

  // 7. Các asset tĩnh khác trong /public (vd /images/logo.png, /placeholder.png...)
  // Không bao gồm recipe-images hay images/recipes đã được xử lý ở trên
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // 8. Tên file hoặc relative path không có tiền tố bucket (vd 'recipes/uuid.png' hoặc 'anh-mon.png')
  return `/api/image/${RECIPE_BUCKET}/${cleanPath}`;
}
