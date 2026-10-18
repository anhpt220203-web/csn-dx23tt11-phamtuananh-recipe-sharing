'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn, isRouteActive } from '@kit/ui/utils';

export function SiteNavigationItem({
  path,
  children,
}: React.PropsWithChildren<{
  path: string;
}>) {
  const currentPathName = usePathname();
  const isActive = isRouteActive(path, currentPathName);

  return (
    <Link
      href={path}
      className={cn(
        'relative inline-flex items-center px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 select-none',
        isActive
          ? 'bg-background text-primary font-semibold shadow-xs ring-1 ring-border/60'
          : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
      )}
    >
      {children}
    </Link>
  );
}
