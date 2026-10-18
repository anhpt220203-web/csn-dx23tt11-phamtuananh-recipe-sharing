import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { RecipeSchema } from '~/lib/recipes/database';
import { getRecipesByTagSlug } from '~/lib/recipes/queries';

import { RecipeCard } from '~/components/recipes/recipe-card';
import {
  getFavoriteRecipeIds,
  getRecipeFavoriteCounts,
} from '~/lib/recipes/favorites';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';

type TagPageProps = {
  params: Promise<{ slug: string }>;
};

async function getTagBySlug(slug: string) {
  const client = getSupabaseServerClient<RecipeSchema>();

  const { data, error } = await client
    .from('tags')
    .select('id,name,slug')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Không tải được tag: ${error.message}`);
  }

  return data as { id: number; name: string; slug: string } | null;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) {
    return { title: 'Không tìm thấy chủ đề' };
  }

  return {
    title: tag.name,
    description: `Các công thức nấu ăn thuộc chủ đề ${tag.name}.`,
  };
}

// Trang đọc dữ liệu mới mỗi request (DB Supabase) — cho phép route "blocking"
// thay vì lỗi/diagnostic prerender với cacheComponents của Next 16.
export const instant = false;

export default async function TagPage({ params }: TagPageProps) {
  await connection();

  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) {
    notFound();
  }

  const recipes = await getRecipesByTagSlug(slug);
  const recipeIds = recipes.map((recipe) => recipe.id);
  const [favoriteIds, favoriteCounts] = await Promise.all([
    getFavoriteRecipeIds(recipeIds),
    getRecipeFavoriteCounts(recipeIds),
  ]);

  return (
    <div>
      <SitePageHeader
        title={tag.name}
        subtitle={`Các công thức nấu ăn thuộc chủ đề “${tag.name}”.`}
      />

      <div className={'container mx-auto py-8'}>
        {recipes.length === 0 ? (
          <p className={'text-muted-foreground'}>
            Chưa có công thức nào trong chủ đề này. Vui lòng quay lại sau.
          </p>
        ) : (
          <>
            <p className={'text-muted-foreground mb-6 text-sm'}>
              Có {recipes.length} công thức trong chủ đề “{tag.name}”.
            </p>

            <div
              className={'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'}
            >
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.slug}
                  recipe={recipe}
                  initialFavorited={favoriteIds.has(recipe.id)}
                  initialFavoriteCount={favoriteCounts.get(recipe.id) ?? 0}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
