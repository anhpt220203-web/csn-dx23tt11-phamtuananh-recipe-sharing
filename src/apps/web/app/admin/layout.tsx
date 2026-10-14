import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@kit/ui/button';

import { requireAdminInServerComponent } from '~/lib/server/require-admin';

import { AdminNav } from './_components/admin-nav';

export const metadata: Metadata = {
  title: 'Quản trị',
  description: 'Khu vực quản trị: tài khoản, công thức và danh mục.',
};

/**
 * Khu vực admin yêu cầu xác thực + phân quyền ở phía server cho MỌI request
 * (`requireAdminInServerComponent` gọi `connection()`), nên không thể render
 * "instant". `instant = false` cho phép segment này block để render tại thời
 * điểm request (thay cho `dynamic = 'force-dynamic'` ở Next cũ).
 */
export const instant = false;

/**
 * Layout của khu vực /admin.
 *
 * Kiểm tra quyền admin ở phía server NGAY TẠI LAYOUT: người dùng thường
 * (không phải admin) không bao giờ thấy được nội dung bên trong —
 * `requireAdminInServerComponent` chuyển hướng về trang đăng nhập nếu chưa
 * đăng nhập, và trả về 404 nếu đã đăng nhập nhưng không phải admin.
 */
export default async function AdminLayout({
  children,
}: React.PropsWithChildren) {
  await requireAdminInServerComponent();

  return (
    <div className={'flex min-h-screen flex-col bg-muted/40'}>
      <header className={'sticky top-0 z-10 border-b bg-background'}>
        <div className={'container mx-auto px-4'}>
          <div className={'flex items-center justify-between gap-2 py-3'}>
            <div className={'flex min-w-0 items-center gap-2'}>
              <span
                className={
                  'bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs font-bold tracking-wide uppercase'
                }
              >
                Admin
              </span>

              <span className={'truncate text-sm font-semibold'}>
                Quản trị website
              </span>
            </div>

            <Button
              nativeButton={false}
              variant={'ghost'}
              size={'sm'}
              render={
                <Link href={'/'} className={'shrink-0'}>
                  Về trang chủ
                </Link>
              }
            />
          </div>

          <AdminNav />
        </div>
      </header>

      <main className={'container mx-auto flex-1 px-4 py-6'}>{children}</main>
    </div>
  );
}
