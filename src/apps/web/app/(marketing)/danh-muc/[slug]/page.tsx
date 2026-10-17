import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { SearchX } from 'lucide-react';

import {
  getCategories,
  getCategoryBySlug,
  getRecipesByCategorySlug,
} from '~/lib/recipes/queries';
import { getFavoriteRecipeIds } from '~/lib/recipes/favorites';

import { RecipeCard } from '~/components/recipes/recipe-card';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { CategoryChipNav } from '../../_components/category-chip-nav';

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

// Trang đọc dữ liệu mới mỗi request (DB Supabase) — cho phép route "blocking"
// thay vì lỗi/diagnostic prerender với cacheComponents của Next 16.
export const instant = false;

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: 'Không tìm thấy danh mục' };
  }

  return {
    title: category.name,
    description:
      category.description ||
      `Các công thức nấu ăn thuộc nhóm ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Trang đọc dữ liệu mới mỗi request (DB Supabase), không prerender lúc build.
  // (Dùng `connection()` thay cho `dynamic = 'force-dynamic'`, vốn không
  // tương thích với `cacheComponents` của Next 16.)
  await connection();

  const { slug } = await params;

  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [recipes, categories] = await Promise.all([
    getRecipesByCategorySlug(slug),
    getCategories(),
  ]);

  const favoriteIds = await getFavoriteRecipeIds(
    recipes.map((recipe) => recipe.id),
  );

  return (
    <div>
      <SitePageHeader
        title={category.name}
        subtitle={
          category.description ||
          `Các công thức nấu ăn thuộc nhóm ${category.name}.`
        }
      />

      <div className={'container mx-auto py-8'}>
        <CategoryChipNav categories={categories} activeSlug={slug} />

        {recipes.length === 0 ? (
          <div
            className={
              'text-muted-foreground flex flex-col items-center gap-3 py-16 text-center'
            }
          >
            <SearchX className={'h-10 w-10'} aria-hidden={true} />
            <p>
              Chưa có công thức nào trong nhóm này. Vui lòng quay lại sau hoặc
              chọn nhóm khác phía trên.
            </p>
          </div>
        ) : (
          <>
            <p className={'text-muted-foreground mb-6 text-sm'}>
              Có{' '}
              <span className={'text-primary font-semibold'}>
                {recipes.length}
              </span>{' '}
              công thức trong nhóm “{category.name}”.
            </p>

            <div
              className={'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'}
            >
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.slug}
                  recipe={recipe}
                  initialFavorited={favoriteIds.has(recipe.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
