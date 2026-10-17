import { Suspense } from 'react';

import Link from 'next/link';

import { Menu } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@kit/ui/navigation-menu';

import { SiteNavigationItem } from './site-navigation-item';

/**
 * Add your navigation links here
 *
 * @example
 *
 * {
 *   FAQ: {
 *     label: 'marketing.faq',
 *     path: '/faq',
 *   },
 *   Pricing: {
 *     label: 'marketing.pricing',
 *     path: '/pricing',
 *   },
 * }
 */

const links: Record<
  string,
  {
    label: string;
    path: string;
  }
> = {
  DanhMuc: {
    label: 'Danh mục',
    path: '/danh-muc',
  },
  TimKiem: {
    label: 'Tìm kiếm',
    path: '/tim-kiem',
  },
  /*
    FAQ: {
      label: 'marketing.faq',
      path: '/faq',
    },
     */
};

export function SiteNavigation() {
  return (
    <>
      <div className={'hidden items-center justify-center md:flex'}>
        <NavigationMenu className={'px-4 py-2'}>
          <NavigationMenuList className={'space-x-5'}>
            {/*
              SiteNavigationItem dùng `usePathname()` nên không thể prerender
              tĩnh: bọc trong Suspense để phần active-state stream sau, layout
              (marketing) vẫn được cache dùng chung cho mọi trang.
            */}
            <Suspense fallback={<StaticNavItems />}>
              <DynamicNavItems />
            </Suspense>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className={'flex justify-start sm:items-center md:hidden'}>
        <MobileDropdown />
      </div>
    </>
  );
}

/**
 * Link điều hướng tĩnh (không active-state) — fallback lúc prerender,
 * vẫn đầy đủ link cho SEO và khi chưa có JS.
 */
function StaticNavItems() {
  return (
    <>
      {Object.values(links).map((item) => (
        <NavigationMenuItem key={item.path}>
          <Link
            className={
              'inline-flex w-max text-sm font-medium transition-colors duration-300'
            }
            href={item.path}
          >
            {item.label}
          </Link>
        </NavigationMenuItem>
      ))}
    </>
  );
}

/** Link điều hướng có active-state theo pathname hiện tại (client hook). */
function DynamicNavItems() {
  return (
    <>
      {Object.values(links).map((item) => (
        <SiteNavigationItem key={item.path} path={item.path}>
          {item.label}
        </SiteNavigationItem>
      ))}
    </>
  );
}

function MobileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={'Mở menu'}>
        <Menu className={'h-8 w-8'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent className={'w-full'}>
        {Object.values(links).map((item) => {
          const className = 'flex w-full h-full items-center';

          return (
            <DropdownMenuItem
              key={item.path}
              render={<Link className={className} href={item.path} />}
            >
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
