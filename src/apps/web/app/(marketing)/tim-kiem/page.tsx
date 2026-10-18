import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

import { SearchX } from 'lucide-react';

import {
  getCategories,
  listPublishedRecipes,
  parseSearchSort,
  searchRecipes,
} from '~/lib/recipes/queries';
import {
  getFavoriteRecipeIds,
  getRecipeFavoriteCounts,
} from '~/lib/recipes/favorites';

import { RecipeCard } from '~/components/recipes/recipe-card';
import { SearchForm } from '~/components/recipes/search-form';

import { SitePageHeader } from '../_components/site-page-header';
import { CategoryChipNav } from '../_components/category-chip-nav';
import { PaginationNav } from '../_components/pagination-nav';

export const metadata: Metadata = {
  title: 'Danh sách món ăn',
  description:
    'Duyệt toàn bộ công thức nấu ăn: tìm kiếm theo tên món, nguyên liệu, lọc theo nhóm món và sắp xếp.',
};

export const instant = false;

const PER_PAGE = 12;

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  await connection();
  const params = await searchParams;
  const q = (params.q ?? '').trim();
  const categorySlug = params.category || undefined;
  const sort = parseSearchSort(params.sort);
  const page = parsePage(params.page);

  const categories = await getCategories();

  // Có từ khoá → tìm kiếm (RPC trả hết kết quả khớp, phân trang phía ứng
  // dụng); không có → duyệt toàn bộ catalog có phân trang phía PostgREST
  // (kiểu /tim-kiem-mon-ngon của trang tham chiếu).
  const searchResults = q
    ? await searchRecipes({ q, categorySlug, sort })
    : [];

  const { recipes: catalogRecipes, total } = q
    ? { recipes: [], total: searchResults.length }
    : await listPublishedRecipes({ categorySlug, sort, page, perPage: PER_PAGE });

  const results = q
    ? searchResults.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    : catalogRecipes;

  const resultIds = results.map((recipe) => recipe.id);
  const [favoriteIds, favoriteCounts] = await Promise.all([
    getFavoriteRecipeIds(resultIds),
    getRecipeFavoriteCounts(resultIds),
  ]);

  const activeCategory = categories.find(
    (category) => category.slug === categorySlug,
  );

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);

  const buildHref = (targetPage: number) => {
    const search = new URLSearchParams();

    if (q) {
      search.set('q', q);
    }

    if (categorySlug) {
      search.set('category', categorySlug);
    }

    if (sort !== 'moi-nhat') {
      search.set('sort', sort);
    }

    if (targetPage > 1) {
      search.set('page', String(targetPage));
    }

    const query = search.toString();
    return `/tim-kiem${query ? `?${query}` : ''}`;
  };

  // URL đưa trang vượt quá số trang (PostgREST trả 416 với offset ngoài
  // range) — redirect về trang cuối hợp lệ thay vì render trang rỗng.
  if (page > totalPages && total > 0) {
    redirect(buildHref(totalPages));
  }

  return (
    <div>
      <SitePageHeader
        title={q ? 'Tìm kiếm công thức' : 'Danh sách món ăn'}
        subtitle={
          q
            ? 'Nhập tên món ăn hoặc nguyên liệu, có thể lọc theo nhóm món.'
            : 'Duyệt toàn bộ công thức: tìm theo tên món, nguyên liệu, lọc theo nhóm món và sắp xếp.'
        }
      />

      <div className={'container mx-auto py-8'}>
        <SearchForm
          categories={categories}
          defaultQuery={q}
          defaultCategory={categorySlug ?? 'all'}
          defaultSort={sort}
        />

        {/* Lọc nhanh theo nhóm món — giữ nguyên từ khóa đang tìm */}
        <div className={'mt-6'}>
          <CategoryChipNav
            categories={categories}
            activeSlug={categorySlug}
            basePath={'/tim-kiem'}
            query={q || undefined}
          />
        </div>

        <div className={'mt-2'}>
          {results.length === 0 ? (
            <div
              className={
                'text-muted-foreground flex flex-col items-center gap-3 py-16 text-center'
              }
            >
              <SearchX className={'h-10 w-10'} aria-hidden={true} />
              <p>
                {q
                  ? `Không tìm thấy công thức nào cho “${q}”${
                      activeCategory ? ` trong nhóm “${activeCategory.name}”` : ''
                    }. Hãy thử từ khóa khác hoặc bỏ bộ lọc nhóm món.`
                  : 'Chưa có công thức nào được xuất bản. Vui lòng quay lại sau.'}
              </p>
            </div>
          ) : (
            <>
              <p className={'text-muted-foreground mb-6 text-sm'}>
                {q ? (
                  <>
                    Tìm thấy{' '}
                    <span className={'text-primary font-semibold'}>
                      {total}
                    </span>{' '}
                    kết quả cho “{q}”
                    {activeCategory
                      ? ` trong nhóm “${activeCategory.name}”`
                      : ''}
                    .
                  </>
                ) : (
                  <>
                    <span className={'text-primary font-semibold'}>
                      {total}
                    </span>{' '}
                    món ăn được hiển thị
                    {activeCategory ? ` trong nhóm “${activeCategory.name}”` : ''}
                    .
                  </>
                )}
              </p>

              <div
                className={'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'}
              >
                {results.map((recipe) => (
                  <RecipeCard
                    key={recipe.slug}
                    recipe={recipe}
                    rating={recipe.rating}
                    initialFavorited={favoriteIds.has(recipe.id)}
                    initialFavoriteCount={favoriteCounts.get(recipe.id) ?? 0}
                  />
                ))}
              </div>

              <PaginationNav
                currentPage={safePage}
                totalPages={totalPages}
                buildHref={buildHref}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
