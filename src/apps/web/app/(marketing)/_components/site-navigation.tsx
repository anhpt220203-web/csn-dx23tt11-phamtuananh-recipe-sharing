import { Suspense } from 'react';

import Link from 'next/link';

import {
  Heart,
  Home,
  Menu,
  Search,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';

import { SiteNavigationItem } from './site-navigation-item';

export const NAVIGATION_LINKS = [
  {
    key: 'TrangChu',
    label: 'Trang chủ',
    path: '/',
    icon: Home,
  },
  {
    key: 'DanhMuc',
    label: 'Danh mục',
    path: '/danh-muc',
    icon: UtensilsCrossed,
  },
  {
    key: 'MeoVat',
    label: 'Mẹo vặt',
    path: '/meo-vat',
    icon: Sparkles,
  },
  {
    key: 'TimKiem',
    label: 'Tìm kiếm',
    path: '/tim-kiem',
    icon: Search,
  },
];

/**
 * Menu điều hướng desktop dạng segmented pill hiện đại
 */
export function SiteNavigation() {
  return (
    <nav
      aria-label={'Menu chính'}
      className={
        'flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 p-1 backdrop-blur-xs'
      }
    >
      <Suspense fallback={<StaticNavItems />}>
        <DynamicNavItems />
      </Suspense>
    </nav>
  );
}

/**
 * Menu điều hướng mobile (Dropdown menu dạng popover gọn gàng)
 */
export function MobileNavigation() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={'Mở menu điều hướng'}
        className={
          'flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 text-foreground transition-colors hover:bg-muted/80'
        }
      >
        <Menu className={'h-5 w-5'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={'w-56 p-1.5'}
        align={'start'}
        sideOffset={8}
      >
        <div
          className={
            'px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground'
          }
        >
          Menu điều hướng
        </div>

        {NAVIGATION_LINKS.map((item) => {
          const Icon = item.icon;

          return (
            <DropdownMenuItem
              key={item.path}
              className={'cursor-pointer rounded-md py-2'}
              render={
                <Link
                  className={'flex w-full items-center gap-2.5 font-medium'}
                  href={item.path}
                />
              }
            >
              <Icon className={'h-4 w-4 text-muted-foreground'} />
              <span>{item.label}</span>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className={'cursor-pointer rounded-md py-2'}
          render={
            <Link
              className={
                'flex w-full items-center gap-2.5 font-medium text-red-600 dark:text-red-400'
              }
              href={'/yeu-thich'}
            />
          }
        >
          <Heart className={'h-4 w-4 fill-red-500 text-red-500'} />
          <span>Món yêu thích</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Fallback tĩnh cho SEO và trước khi JS hydrate
 */
function StaticNavItems() {
  return (
    <>
      {NAVIGATION_LINKS.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={
            'inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground'
          }
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

/**
 * Item động có active state
 */
function DynamicNavItems() {
  return (
    <>
      {NAVIGATION_LINKS.map((item) => (
        <SiteNavigationItem key={item.path} path={item.path}>
          {item.label}
        </SiteNavigationItem>
      ))}
    </>
  );
}
