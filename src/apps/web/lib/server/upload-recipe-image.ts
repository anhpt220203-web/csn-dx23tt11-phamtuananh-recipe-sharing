import 'server-only';

import { randomUUID } from 'node:crypto';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

const BUCKET = 'recipe-images';
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

/**
 * Tải ảnh công thức lên Supabase Storage (bucket `recipe-images`, public).
 * Tên file được sinh lại duy nhất để tránh trùng:
 *   `<timestamp>-<uuid>.<ext>`
 * Trả về URL public để lưu vào cột `recipes.image_url`.
 */
export async function uploadRecipeImage(file: File): Promise<string> {
  if (file.size === 0) {
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

  const fileName = `${Date.now()}-${randomUUID()}.${ext}`;
  const path = `recipes/${fileName}`;

  const client = getSupabaseServerAdminClient();

  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Tải ảnh thất bại: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = client.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}
