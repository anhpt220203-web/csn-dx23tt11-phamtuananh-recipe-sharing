import { Suspense } from 'react';

import Link from 'next/link';

import { Home } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@kit/ui/sidebar';
import { SidebarNavigation } from '@kit/ui/sidebar-navigation';
import { Skeleton } from '@kit/ui/skeleton';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { adminNavigationConfig } from '~/config/admin-navigation.config';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

/**
 * Sidebar của khu vực quản trị, theo đúng pattern của trang /home
 * (SidebarProvider + Page style="sidebar" ở layout).
 *
 * Phần điều hướng không phụ thuộc user nên prerender được; chỉ dropdown
 * tài khoản ở footer cần session nên nằm sau Suspense boundary.
 */
export function AdminSidebar() {
  return (
    <Sidebar collapsible={'icon'} data-test={'admin-sidebar'}>
      <SidebarHeader className={'h-16 justify-center'}>
        <div className={'flex items-center gap-2'}>
          <AppLogo className={'max-w-full'} />

          <span
            className={
              'bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs font-bold tracking-wide uppercase group-data-[collapsible=icon]:hidden'
            }
          >
            Quản trị
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavigation config={adminNavigationConfig} />
      </SidebarContent>

      <SidebarFooter className={'gap-2'}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              data-test={'admin-back-to-home'}
              tooltip={'Về trang chủ'}
              render={<Link href={'/'} />}
            >
              <Home className={'w-4'} />

              <span>{'Về trang chủ'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Suspense fallback={<AccountDropdownFallback />}>
          <AccountDropdown />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}

async function AccountDropdown() {
  const user = await requireUserInServerComponent();

  return <ProfileAccountDropdownContainer user={user} />;
}

function AccountDropdownFallback() {
  return (
    <div className={'flex items-center gap-x-2 p-2'}>
      <Skeleton className={'size-8 shrink-0 rounded-full'} />
      <Skeleton className={'h-4 w-full'} />
    </div>
  );
}
