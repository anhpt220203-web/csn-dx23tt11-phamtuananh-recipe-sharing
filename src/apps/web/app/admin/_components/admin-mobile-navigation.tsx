'use client';

import Link from 'next/link';

import { Home, Menu } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Trans } from '@kit/ui/trans';

import { adminNavigationConfig } from '~/config/admin-navigation.config';

/**
 * Điều hướng mobile cho khu vực quản trị (dropdown menu),
 * theo đúng pattern của HomeMobileNavigation.
 */
export function AdminMobileNavigation() {
  const links = adminNavigationConfig.routes.flatMap((item, index) => {
    if ('children' in item) {
      return item.children.map((child) => (
        <DropdownLink
          key={child.path}
          Icon={child.Icon}
          path={child.path}
          label={child.label}
        />
      ));
    }

    if ('divider' in item) {
      return [<DropdownMenuSeparator key={`divider-${index}`} />];
    }

    return [];
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger data-test={'admin-mobile-menu-trigger'}>
        <Menu className={'h-9'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent sideOffset={10} className={'w-screen rounded-none'}>
        <DropdownMenuGroup>{links}</DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          data-test={'admin-mobile-back-home'}
          render={
            <Link href={'/'} className={'flex h-12 w-full items-center gap-4'} />
          }
        >
          <Home className={'h-6'} />

          <span>
            <Trans i18nKey={'Về trang chủ'} defaults={'Về trang chủ'} />
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DropdownLink(
  props: React.PropsWithChildren<{
    path: string;
    label: string;
    Icon: React.ReactNode;
  }>,
) {
  return (
    <DropdownMenuItem
      key={props.path}
      render={
        <Link
          href={props.path}
          className={'flex h-12 w-full items-center space-x-4'}
        />
      }
    >
      {props.Icon}

      <span>
        <Trans i18nKey={props.label} defaults={props.label} />
      </span>
    </DropdownMenuItem>
  );
}
