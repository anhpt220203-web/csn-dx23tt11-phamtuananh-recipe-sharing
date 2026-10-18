'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import type { MediaActionResult } from './media-constants';
import { requireAdminUser } from '~/lib/server/require-admin-action';
import { MEDIA_BUCKET } from '~/lib/server/storage-images';

/**
 * Xóa một file ảnh trong bucket `recipe-images` (trang /admin/media).
 * Chỉ chấp nhận path tương đối trong bucket — chặn path traversal.
 */
export async function deleteMediaFileAction(
  _prev: MediaActionResult,
  formData: FormData,
): Promise<MediaActionResult> {
  try {
    await requireAdminUser();

    const path = String(formData.get('path') ?? '').trim();
    const rawBucket = String(formData.get('bucket') ?? MEDIA_BUCKET).trim();
    const bucket =
      rawBucket === 'account_image' ? 'account_image' : MEDIA_BUCKET;

    if (
      path.length === 0 ||
      path.startsWith('/') ||
      path.includes('..') ||
      path.includes('\\')
    ) {
      return { ok: false, message: 'Đường dẫn file không hợp lệ.' };
    }

    const admin = getSupabaseServerAdminClient();

    const { error } = await admin.storage.from(bucket).remove([path]);

    if (error) {
      return { ok: false, message: `Không xóa được ảnh: ${error.message}` };
    }

    // Nếu xóa avatar trong bucket account_image, xóa luôn liên kết trong bảng accounts
    if (bucket === 'account_image') {
      const fileName = path.split('/').pop()?.split('?')[0];
      const userId = fileName?.split('.')[0];

      if (userId) {
        await admin
          .from('accounts')
          .update({ picture_url: null })
          .eq('id', userId);
      }
    }

    revalidatePath('/admin/media');

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra.',
    };
  }
}
