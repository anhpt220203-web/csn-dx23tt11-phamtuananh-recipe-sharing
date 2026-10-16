import type { Metadata } from 'next';

import { Page, PageMobileNavigation, PageNavigation } from '@kit/ui/page';
import { SidebarProvider } from '@kit/ui/sidebar';

import { AppLogo } from '~/components/app-logo';
import { requireAdminInServerComponent } from '~/lib/server/require-admin';

import { AdminMobileNavigation } from './_components/admin-mobile-navigation';
import { AdminSidebar } from './_components/admin-sidebar';

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
 *
 * Giao diện dùng sidebar trái theo đúng pattern của trang /home
 * (SidebarProvider + Page style="sidebar").
 */
export default async function AdminLayout({
  children,
}: React.PropsWithChildren) {
  await requireAdminInServerComponent();

  return (
    <SidebarProvider>
      <Page style={'sidebar'}>
        <PageNavigation>
          <AdminSidebar />
        </PageNavigation>

        <PageMobileNavigation className={'flex items-center justify-between'}>
          <div className={'flex items-center gap-2'}>
            <AppLogo />

            <span
              className={
                'bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs font-bold tracking-wide uppercase'
              }
            >
              Quản trị
            </span>
          </div>

          <AdminMobileNavigation />
        </PageMobileNavigation>

        <div className={'mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8'}>
          {children}
        </div>
      </Page>
    </SidebarProvider>
  );
}
