'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@kit/ui/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Tổng quan' },
  { href: '/admin/tai-khoan', label: 'Tài khoản' },
  { href: '/admin/cong-thuc', label: 'Công thức' },
  { href: '/admin/danh-muc', label: 'Danh mục' },
  { href: '/admin/danh-gia', label: 'Đánh giá' },
  { href: '/admin/hoi-dap', label: 'Hỏi đáp' },
  { href: '/admin/banner', label: 'Banner' },
  { href: '/admin/meo-vat', label: 'Mẹo vặt' },
];

function isActive(pathname: string, href: string) {
  if (href === '/admin') {
    return pathname === '/admin';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label={'Điều hướng quản trị'}
      className={'-mx-1 flex gap-1 overflow-x-auto px-1 py-1'}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
