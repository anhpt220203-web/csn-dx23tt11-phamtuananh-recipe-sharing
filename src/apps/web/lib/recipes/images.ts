/**
 * Chuyển `image_url` trong DB thành src an toàn cho trình duyệt:
 *
 * - `'recipe-images/<file>'` (object path trong Storage) → `/api/image/<path>`
 * - URL storage đầy đủ của hệ thống → tách path, trả về `/api/image/<path>`
 * - Đường dẫn nội bộ (`/images/...`) → giữ nguyên
 * - URL ngoài (không thuộc storage của hệ thống) → giữ nguyên
 *
 * Nhờ vậy trình duyệt chỉ thấy cùng-origin `/api/image/...`, không lộ link
 * gốc của Supabase Storage (route handler phía server mới fetch thật).
 */
export function resolveRecipeImageSrc(
  imageUrl: string | null | undefined,
): string | null {
  if (!imageUrl) {
    return null;
  }

  // Đường dẫn nội bộ trong /public — dùng thẳng.
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  const STORAGE_MARKER = '/storage/v1/object/public/';

  if (/^https?:\/\//i.test(imageUrl)) {
    const markerIndex = imageUrl.indexOf(STORAGE_MARKER);

    if (markerIndex !== -1) {
      return `/api/image/${imageUrl.slice(markerIndex + STORAGE_MARKER.length)}`;
    }

    // URL ngoài không thuộc storage của hệ thống — dùng nguyên gốc.
    return imageUrl;
  }

  // Object path dạng 'bucket/duong/dan/file.ext'.
  return `/api/image/${imageUrl.replace(/^\/+/, '')}`;
}
