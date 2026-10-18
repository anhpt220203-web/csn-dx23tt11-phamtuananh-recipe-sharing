import 'server-only';

import { randomUUID } from 'node:crypto';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

/** Bucket Storage dùng chung cho mọi ảnh của đồ án. */
export const MEDIA_BUCKET = 'recipe-images';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

/** Thư mục đích trong bucket cho từng nguồn ảnh (dùng để lọc ở /admin/media). */
export type MediaFolder =
  | 'recipes'
  | 'tips'
  | 'categories'
  | 'banners'
  | 'uploads';

const ALLOWED_FOLDERS: readonly MediaFolder[] = [
  'recipes',
  'tips',
  'categories',
  'banners',
  'uploads',
];

/**
 * Tải ảnh lên Supabase Storage (bucket `recipe-images`, public).
 * Tên file sinh duy nhất: `<folder>/<timestamp>-<uuid>.<ext>` nên không bao
 * giờ trùng.
 * Trả về URL public để lưu vào cột `image_url` của DB.
 */
export async function uploadStorageImage(
  file: File,
  folder: MediaFolder,
): Promise<string> {
  if (!ALLOWED_FOLDERS.includes(folder)) {
    throw new Error('Thư mục ảnh không hợp lệ.');
  }

  if (!(file instanceof File) || file.size === 0) {
    throw new Error('File ảnh rỗng.');
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Chỉ chấp nhận file ảnh.');
  }

  const ext =
    EXT_BY_MIME[file.type] ??
    file.name.split('.').pop()?.toLowerCase() ??
    'jpg';

  const rawBaseName = file.name.replace(/\.[^/.]+$/, '').trim();
  const cleanBaseName =
    rawBaseName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'anh';

  // Chèn mã ngắn ngẫu nhiên 4 ký tự thay vì UUID dài ngoằn để vừa tránh trùng vừa giữ tên gốc
  const shortCode = Math.random().toString(36).substring(2, 6);
  const path = `${folder}/${cleanBaseName}-${shortCode}.${ext}`;

  const storage = getSupabaseServerAdminClient().storage.from(MEDIA_BUCKET);

  const { error: uploadError } = await storage.upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    throw new Error(`Tải ảnh thất bại: ${uploadError.message}`);
  }

  return storage.getPublicUrl(path).data.publicUrl;
}

/**
 * Tách object path trong bucket từ URL ảnh đã lưu.
 * Chấp nhận cả public URL đầy đủ của Supabase Storage và URL qua proxy
 * `/api/image/<bucket>/<path>` (cả hai đều chứa đoạn `/<bucket>/`).
 * Trả về null nếu URL không thuộc bucket — để không bao giờ xóa nhầm ảnh
 * của bên thứ ba.
 */
export function extractStoragePath(
  imageUrl: string,
  bucket: string = MEDIA_BUCKET,
): string | null {
  const marker = `/${bucket}/`;
  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  const path = imageUrl.slice(index + marker.length).split('?')[0];

  if (!path || path.includes('..')) {
    return null;
  }

  return path;
}

/**
 * Xóa file ảnh trong bucket theo URL đã lưu (best-effort, không ném lỗi).
 * Chỉ xóa khi URL thuộc bucket `recipe-images`; ảnh URL ngoài được bỏ qua.
 */
export async function removeStorageImage(
  imageUrl: string | null | undefined,
): Promise<void> {
  const path = typeof imageUrl === 'string' ? extractStoragePath(imageUrl) : null;

  if (!path) {
    return;
  }

  try {
    await getSupabaseServerAdminClient().storage.from(MEDIA_BUCKET).remove([path]);
  } catch {
    // Best-effort: xóa file cũ thất bại không được chặn flow chính.
  }
}

/**
 * Chuẩn hoá URL ảnh do admin dán trực tiếp: chỉ chấp nhận http/https.
 * Trả về null khi chuỗi rỗng hoặc không phải URL hợp lệ.
 */
export function normalizeDirectImageUrl(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }

    return trimmed;
  } catch {
    return null;
  }
}
