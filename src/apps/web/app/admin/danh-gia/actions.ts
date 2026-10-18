'use server';

import type { RatingActionResult } from './danh-gia-constants';
import { revalidatePath } from 'next/cache';

import { requireAdminUser } from '~/lib/server/require-admin-action';

/**
 * Xóa một đánh giá theo `id`.
 *
 * Quyền admin được kiểm tra ở đầu action (server-side). Xóa đánh giá không
 * ảnh hưởng đến công thức hay tài khoản của người đánh giá.
 */
export async function deleteRatingAction(
  _prev: RatingActionResult,
  formData: FormData,
): Promise<RatingActionResult> {
  try {
    const { adminClient } = await requireAdminUser();

    const rawId = formData.get('id');
    const id = typeof rawId === 'string' ? Number(rawId) : Number.NaN;

    if (!Number.isInteger(id) || id <= 0) {
      return { ok: false, message: 'Thiếu mã đánh giá hợp lệ.' };
    }

    const { error } = await adminClient.from('ratings').delete().eq('id', id);

    if (error) {
      return {
        ok: false,
        message: `Không xóa được đánh giá: ${error.message}`,
      };
    }

    revalidatePath('/admin/danh-gia');

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Có lỗi xảy ra, thử lại sau.',
    };
  }
}

