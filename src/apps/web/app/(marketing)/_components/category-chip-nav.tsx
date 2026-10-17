import Link from 'next/link';

import { cn } from '@kit/ui/utils';

import type { CategoryRow } from '~/lib/recipes/database';

/**
 * Hàng chip chuyển nhanh giữa các nhóm món — dùng cho trang danh mục
 * và trang tìm kiếm. Chip đang chọn có nền primary.
 */
export function CategoryChipNav({
  categories,
  activeSlug,
  basePath = '/danh-muc',
  query,
}: {
  categories: CategoryRow[];
  activeSlug?: string;
  /** `/danh-muc` → href là `/danh-muc/{slug}`; `/tim-kiem` → query param `category`. */
  basePath?: string;
  /** Từ khóa tìm kiếm hiện tại (giữ nguyên khi bấm chip trên /tim-kiem). */
  query?: string;
}) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={'Lọc theo nhóm món'}
      className={'mb-6 flex flex-wrap items-center gap-2'}
    >
      {categories.map((category) => {
        const active = category.slug === activeSlug;
        const params = new URLSearchParams();

        if (basePath === '/tim-kiem') {
          params.set('category', category.slug);

          if (query) {
            params.set('q', query);
          }
        }

        const href =
          basePath === '/tim-kiem'
            ? `/tim-kiem?${params.toString()}`
            : `/danh-muc/${category.slug}`;

        return (
          <Link
            key={category.slug}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card text-card-foreground ring-foreground/10 ring-1 hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}
