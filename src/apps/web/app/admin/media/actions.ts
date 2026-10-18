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

    if (
      path.length === 0 ||
      path.startsWith('/') ||
      path.includes('..') ||
      path.includes('\\')
    ) {
      return { ok: false, message: 'Đường dẫn file không hợp lệ.' };
    }

    const { error } = await getSupabaseServerAdminClient()
      .storage.from(MEDIA_BUCKET)
      .remove([path]);

    if (error) {
      return { ok: false, message: `Không xóa được ảnh: ${error.message}` };
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
