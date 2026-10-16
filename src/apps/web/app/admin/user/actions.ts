'use server';

import { revalidatePath } from 'next/cache';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { RecipeSchema } from '~/lib/recipes/database';
import { requireAdminUser } from '~/lib/server/require-admin-action';

export type AccountActionResult =
  | { ok: true }
  | { ok: false; message: string };

const INITIAL: AccountActionResult = { ok: true };

function getUserId(formData: FormData): string | null {
  const value = formData.get('userId');

  return typeof value === 'string' && value.length > 0 ? value : null;
}

function isActive(user: {
  banned_until?: string | null;
}): boolean {
  return (
    !user.banned_until || new Date(user.banned_until).getTime() <= Date.now()
  );
}

/**
 * Đếm số quản trị viên còn hoạt động (app_metadata.role === 'admin' và
 * không bị ban/khóa). Dùng Auth Admin API phân trang vì `listUsers`
 * giới hạn số bản ghi mỗi lần gọi.
 */
async function countActiveAdmins(
  adminClient: SupabaseClient<RecipeSchema>,
): Promise<number> {
  const perPage = 1000;
  let page = 1;
  let count = 0;

  for (;;) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(
        `Không liệt kê được danh sách tài khoản: ${error.message}`,
      );
    }

    for (const user of data.users) {
      if (user.app_metadata?.['role'] !== 'admin') {
        continue;
      }

      if (isActive(user)) {
        count += 1;
      }
    }

    if (data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return count;
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

    // SRS FR7: không cho khóa quản trị viên hoạt động cuối cùng.
    const { data: targetData, error: targetError } =
      await adminClient.auth.admin.getUserById(userId);

    if (targetError || !targetData.user) {
      return {
        ok: false,
        message: 'Không tìm thấy tài khoản cần khóa.',
      };
    }

    if (targetData.user.app_metadata?.['role'] === 'admin') {
      const activeAdminCount = await countActiveAdmins(adminClient);

      if (activeAdminCount <= 1) {
        return {
          ok: false,
          message: 'Không thể khóa quản trị viên cuối cùng.',
        };
      }
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

    revalidatePath('/admin/user');

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

    revalidatePath('/admin/user');

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

/**
 * Cấp quyền admin: đặt `app_metadata.role = 'admin'` qua Auth Admin API.
 * Quyền admin được kiểm tra ở đầu action (server-side).
 */
export async function grantAdminAction(
  _prev: AccountActionResult,
  formData: FormData,
): Promise<AccountActionResult> {
  try {
    const { adminClient } = await requireAdminUser();

    const userId = getUserId(formData);

    if (!userId) {
      return { ok: false, message: 'Thiếu mã tài khoản.' };
    }

    const { data: targetData, error: targetError } =
      await adminClient.auth.admin.getUserById(userId);

    if (targetError || !targetData.user) {
      return {
        ok: false,
        message: 'Không tìm thấy tài khoản cần cấp quyền.',
      };
    }

    if (!isActive(targetData.user)) {
      return {
        ok: false,
        message: 'Không thể cấp quyền admin cho tài khoản đang bị khóa.',
      };
    }

    if (targetData.user.app_metadata?.['role'] === 'admin') {
      return { ok: false, message: 'Tài khoản này đã là quản trị viên.' };
    }

    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      app_metadata: { role: 'admin' },
    });

    if (error) {
      return {
        ok: false,
        message: `Không cấp quyền được: ${error.message}`,
      };
    }

    revalidatePath('/admin/user');

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
 * Thu hồi quyền admin: xóa `app_metadata.role` qua Auth Admin API.
 * Chặn thu hồi quyền của chính mình và của admin hoạt động cuối cùng.
 */
export async function revokeAdminAction(
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
      return {
        ok: false,
        message: 'Không thể tự thu hồi quyền quản trị của chính bạn.',
      };
    }

    const { data: targetData, error: targetError } =
      await adminClient.auth.admin.getUserById(userId);

    if (targetError || !targetData.user) {
      return {
        ok: false,
        message: 'Không tìm thấy tài khoản cần thu hồi quyền.',
      };
    }

    if (targetData.user.app_metadata?.['role'] !== 'admin') {
      return { ok: false, message: 'Tài khoản này không phải quản trị viên.' };
    }

    const activeAdminCount = await countActiveAdmins(adminClient);

    if (activeAdminCount <= 1) {
      return {
        ok: false,
        message: 'Không thể thu hồi quyền của quản trị viên cuối cùng.',
      };
    }

    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      app_metadata: { role: null },
    });

    if (error) {
      return {
        ok: false,
        message: `Không thu hồi quyền được: ${error.message}`,
      };
    }

    revalidatePath('/admin/user');

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
 * Xóa tài khoản vĩnh viễn qua Auth Admin API.
 * Chặn xóa chính mình và admin hoạt động cuối cùng.
 */
export async function deleteAccountAction(
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
      return {
        ok: false,
        message: 'Không thể xóa chính tài khoản của bạn.',
      };
    }

    const { data: targetData, error: targetError } =
      await adminClient.auth.admin.getUserById(userId);

    if (targetError || !targetData.user) {
      return {
        ok: false,
        message: 'Không tìm thấy tài khoản cần xóa.',
      };
    }

    if (
      targetData.user.app_metadata?.['role'] === 'admin' &&
      isActive(targetData.user)
    ) {
      const activeAdminCount = await countActiveAdmins(adminClient);

      if (activeAdminCount <= 1) {
        return {
          ok: false,
          message: 'Không thể xóa quản trị viên cuối cùng.',
        };
      }
    }

    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) {
      return {
        ok: false,
        message: `Không xóa được tài khoản: ${error.message}`,
      };
    }

    revalidatePath('/admin/user');

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Có lỗi xảy ra, thử lại sau.',
    };
  }
}
