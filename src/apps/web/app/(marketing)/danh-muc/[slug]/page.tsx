import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import {
  getCategoryBySlug,
  getRecipesByCategorySlug,
} from '~/lib/recipes/queries';
import { getFavoriteRecipeIds } from '~/lib/recipes/favorites';

import { RecipeCard } from '~/components/recipes/recipe-card';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

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

  const recipes = await getRecipesByCategorySlug(slug);

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
        {recipes.length === 0 ? (
          <p className={'text-muted-foreground'}>
            Chưa có công thức nào trong nhóm này. Vui lòng quay lại sau.
          </p>
        ) : (
          <>
            <p className={'text-muted-foreground mb-6 text-sm'}>
              Có {recipes.length} công thức trong nhóm “{category.name}”.
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
