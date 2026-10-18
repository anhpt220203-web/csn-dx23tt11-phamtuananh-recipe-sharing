import Link from 'next/link';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@kit/ui/utils';

/**
 * Phân trang kiểu trang tham chiếu: « Trước · 1 2 3 … · Sau ».
 * `buildHref(page)` trả về URL cho từng trang (giữ nguyên q/category/sort).
 * Render phía server — chuyển trang là link thường, không cần JS.
 */
export function PaginationNav({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  // Danh sách số trang hiển thị: quanh trang hiện tại, co cụm về đầu/cuối.
  const pages: number[] = [];

  for (let p = 1; p <= totalPages; p += 1) {
    if (
      p === 1 ||
      p === totalPages ||
      Math.abs(p - currentPage) <= 1
    ) {
      pages.push(p);
    }
  }

  const itemClass = (active: boolean) =>
    cn(
      'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition-colors',
      active
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'bg-card text-card-foreground ring-foreground/10 ring-1 hover:bg-accent hover:text-accent-foreground',
    );

  return (
    <nav
      aria-label={'Phân trang'}
      className={'mt-10 flex items-center justify-center gap-1.5'}
    >
      {currentPage > 1 ? (
        <Link href={buildHref(currentPage - 1)} className={itemClass(false)}>
          <ChevronLeft className={'h-4 w-4'} aria-hidden={true} />
          <span className={'hidden sm:inline'}>Trước</span>
        </Link>
      ) : null}

      {pages.map((page, index) => {
        const prev = pages[index - 1];
        const gap = prev && page - prev > 1;

        return (
          <span key={page} className={'inline-flex items-center gap-1.5'}>
            {gap ? (
              <span className={'text-muted-foreground px-1'} aria-hidden={true}>
                …
              </span>
            ) : null}
            <Link
              href={buildHref(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={itemClass(page === currentPage)}
            >
              {page}
            </Link>
          </span>
        );
      })}

      {currentPage < totalPages ? (
        <Link href={buildHref(currentPage + 1)} className={itemClass(false)}>
          <span className={'hidden sm:inline'}>Sau</span>
          <ChevronRight className={'h-4 w-4'} aria-hidden={true} />
        </Link>
      ) : null}
    </nav>
  );
}
