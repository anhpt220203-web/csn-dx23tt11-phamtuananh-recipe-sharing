import type { Metadata } from 'next';

import { getCategories, parseSearchSort, searchRecipes } from '~/lib/recipes/queries';

import { RecipeCard } from '~/components/recipes/recipe-card';
import { SearchForm } from '~/components/recipes/search-form';

import { SitePageHeader } from '../_components/site-page-header';

export const metadata: Metadata = {
  title: 'Tìm kiếm công thức',
  description:
    'Tìm kiếm công thức nấu ăn theo tên món, nguyên liệu hoặc nhóm món.',
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = (params.q ?? '').trim();
  const categorySlug = params.category || undefined;
  const sort = parseSearchSort(params.sort);

  const categories = await getCategories();

  const results = q ? await searchRecipes({ q, categorySlug, sort }) : [];

  const activeCategory = categories.find(
    (category) => category.slug === categorySlug,
  );

  return (
    <div>
      <SitePageHeader
        title={'Tìm kiếm công thức'}
        subtitle={'Nhập tên món ăn hoặc nguyên liệu, có thể lọc theo nhóm món.'}
      />

      <div className={'container mx-auto py-8'}>
        <SearchForm
          categories={categories}
          defaultQuery={q}
          defaultCategory={categorySlug ?? 'all'}
          defaultSort={sort}
        />

        <div className={'mt-8'}>
          {!q ? (
            <p className={'text-muted-foreground'}>
              Nhập từ khóa vào ô tìm kiếm để bắt đầu.
            </p>
          ) : results.length === 0 ? (
            <p className={'text-muted-foreground'}>
              Không tìm thấy công thức nào cho “{q}”
              {activeCategory ? ` trong nhóm “${activeCategory.name}”` : ''}.
              Hãy thử từ khóa khác.
            </p>
          ) : (
            <>
              <p className={'text-muted-foreground mb-6 text-sm'}>
                Tìm thấy {results.length} kết quả cho “{q}”
                {activeCategory ? ` trong nhóm “${activeCategory.name}”` : ''}.
              </p>

              <div
                className={'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'}
              >
                {results.map((recipe) => (
                  <RecipeCard
                    key={recipe.slug}
                    recipe={recipe}
                    rating={recipe.rating}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
