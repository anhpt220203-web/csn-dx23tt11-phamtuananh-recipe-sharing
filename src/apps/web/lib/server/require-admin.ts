import 'server-only';

import { cache } from 'react';

import { redirect } from 'next/navigation';
import { connection } from 'next/server';

import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';

/**
 * Kiểm tra quyền admin phía server.
 *
 * Luồng:
 *  1. Yêu cầu đăng nhập (chưa đăng nhập -> chuyển về trang đăng nhập).
 *  2. Lấy user mới nhất qua Auth Admin API (service_role) và đọc
 *     `app_metadata.role` — không tin hoàn toàn vào JWT (có thể cũ).
 *  3. Không phải admin -> `redirect('/')` chuyển hướng về trang chủ.
 */
async function loadAdmin() {
  await connection();

  const client = getSupabaseServerClient();
  const result = await requireUser(client);

  if (result.error) {
    redirect(result.redirectTo);
  }

  const userId = result.data.id as string;

  const adminClient = getSupabaseServerAdminClient();
  const { data, error } = await adminClient.auth.admin.getUserById(userId);

  const role = data?.user?.app_metadata?.['role'];

  if (error || role !== 'admin') {
    redirect('/');
  }

  return {
    user: data.user,
    userId,
  };
}

export const requireAdminInServerComponent = cache(loadAdmin);

export const ADMIN_SIGN_IN_PATH = pathsConfig.auth.signIn;
