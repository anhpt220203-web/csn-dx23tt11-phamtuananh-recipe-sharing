import 'server-only';

import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { RecipeSchema } from '~/lib/recipes/database';

/**
 * Kiểm tra quyền admin trong server action / route handler.
 *
 * Khác với `requireAdminInServerComponent` (dành cho server component, có
 * `connection()` + `cache()`), hàm này không gọi `connection()` nên an toàn
 * khi dùng trong server action.
 *
 * Ném lỗi nếu chưa đăng nhập hoặc không phải admin — mọi server action của
 * trang admin phải gọi hàm này đầu tiên (kiểm tra quyền ở phía server).
 */
export async function requireAdminUser() {
  const client = getSupabaseServerClient();
  const result = await requireUser(client);

  if (result.error || !result.data) {
    throw new Error('Bạn cần đăng nhập để thực hiện thao tác này.');
  }

  const userId = result.data.id as string;

  // Đọc role mới nhất từ Auth Admin API (service_role), không tin hoàn toàn
  // vào JWT vì token có thể cũ sau khi admin đổi role.
  // (Generic RecipeSchema để gọi được hàm RPC `revoke_user_sessions`.)
  const adminClient = getSupabaseServerAdminClient<RecipeSchema>();
  const { data, error } = await adminClient.auth.admin.getUserById(userId);

  const role = data?.user?.app_metadata?.['role'];

  if (error || role !== 'admin') {
    throw new Error('Bạn không có quyền quản trị.');
  }

  return { adminClient, user: data.user, userId };
}
