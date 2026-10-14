'use server';

import { revalidatePath } from 'next/cache';

import { requireAdminUser } from '~/lib/server/require-admin-action';

export type AccountActionResult =
  | { ok: true }
  | { ok: false; message: string };

const INITIAL: AccountActionResult = { ok: true };

function getUserId(formData: FormData): string | null {
  const value = formData.get('userId');

  return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Khóa tài khoản: cấm đăng nhập bằng `ban_duration` (10 năm) qua
 * Supabase Auth Admin API, đồng thời thu hồi NGAY các session đang mở
 * bằng hàm SQL `public.revoke_user_sessions` (xóa `auth.sessions`).
 *
 * Quyền admin được kiểm tra ở đầu action (server-side).
 */
export async function lockAccountAction(
  _prev: AccountActionResult,
  formData: FormData,
): Promise<AccountActionResult> {
  try {
    const { adminClient, userId: adminId } = await requireAdminUser();

    const userId = getUserId(formData);

    if (!userId) {
      return { ok: false, message: 'Thiếu mã tài khoản.' };
    }

    if (userId === adminId) {
      return { ok: false, message: 'Không thể khóa chính tài khoản của bạn.' };
    }

    const { error: banError } = await adminClient.auth.admin.updateUserById(
      userId,
      { ban_duration: '876000h' },
    );

    if (banError) {
      return {
        ok: false,
        message: `Không khóa được tài khoản: ${banError.message}`,
      };
    }

    // Thu hồi các phiên đăng nhập đang mở ngay lập tức.
    const { error: rpcError } = await adminClient.rpc(
      'revoke_user_sessions',
      { p_user_id: userId },
    );

    if (rpcError) {
      return {
        ok: false,
        message: `Đã khóa tài khoản nhưng chưa thu hồi hết phiên đăng nhập: ${rpcError.message}`,
      };
    }

    revalidatePath('/admin/tai-khoan');

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Có lỗi xảy ra, thử lại sau.',
    };
  }
}

/**
 * Mở khóa tài khoản: gỡ `ban_duration` (`'none'`) qua Auth Admin API.
 * Người dùng có thể đăng nhập lại bình thường.
 */
export async function unlockAccountAction(
  _prev: AccountActionResult,
  formData: FormData,
): Promise<AccountActionResult> {
  try {
    const { adminClient } = await requireAdminUser();

    const userId = getUserId(formData);

    if (!userId) {
      return { ok: false, message: 'Thiếu mã tài khoản.' };
    }

    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration: 'none',
    });

    if (error) {
      return {
        ok: false,
        message: `Không mở khóa được tài khoản: ${error.message}`,
      };
    }

    revalidatePath('/admin/tai-khoan');

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Có lỗi xảy ra, thử lại sau.',
    };
  }
}

export { INITIAL as ACCOUNT_ACTION_INITIAL };
