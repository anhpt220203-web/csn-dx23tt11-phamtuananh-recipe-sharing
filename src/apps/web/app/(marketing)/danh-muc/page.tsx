import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';

import { ArrowRight, ChevronRight, Sparkles, UtensilsCrossed } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';

import {
  getCategories,
  getPublishedRecipes,
  getRecipeRatingSummaries,
  getTags,
} from '~/lib/recipes/queries';
import {
  getFavoriteRecipeIds,
  getRecipeFavoriteCounts,
} from '~/lib/recipes/favorites';
import type { RecipeWithCategory } from '~/lib/recipes/database';

import { RecipeCard } from '~/components/recipes/recipe-card';
import { SitePageHeader } from '../_components/site-page-header';

export const metadata: Metadata = {
  title: 'Danh mục món ăn',
  description:
    'Khám phá công thức nấu ăn ngon theo từng nhóm món đặc trưng của ẩm thực Việt: món chính, món canh, salad, món chay và tráng miệng.',
};

export const instant = false;

const MAX_RECIPES_PER_ROW = 4;

export default async function CategoriesPage() {
  await connection();

  const [categories, allRecipes, tags] = await Promise.all([
    getCategories(),
    getPublishedRecipes(),
    getTags(),
  ]);

  // Gom nhóm công thức theo category_id
  const recipesByCategoryId = new Map<number, RecipeWithCategory[]>();
  for (const recipe of allRecipes) {
    const list = recipesByCategoryId.get(recipe.category_id) ?? [];
    list.push(recipe);
    recipesByCategoryId.set(recipe.category_id, list);
  }

  // Thu thập ID các công thức hiển thị (mỗi nhóm tối đa 4 món) để query favorites và ratings
  const displayedRecipeIds: number[] = [];
  for (const cat of categories) {
    const catRecipes = recipesByCategoryId.get(cat.id) ?? [];
    const sliced = catRecipes.slice(0, MAX_RECIPES_PER_ROW);
    for (const r of sliced) {
      displayedRecipeIds.push(r.id);
    }
  }

  const [favoriteIds, favoriteCounts, ratingSummaries] = await Promise.all([
    getFavoriteRecipeIds(displayedRecipeIds),
    getRecipeFavoriteCounts(displayedRecipeIds),
    getRecipeRatingSummaries(displayedRecipeIds),
  ]);

  // Sắp xếp danh mục: danh mục có nhiều món lên trước
  const sortedCategories = [...categories].sort((a, b) => {
    const countA = recipesByCategoryId.get(a.id)?.length ?? 0;
    const countB = recipesByCategoryId.get(b.id)?.length ?? 0;
    return countB - countA;
  });

  return (
    <div className={'min-h-screen pb-16'}>
      <SitePageHeader
        title={'Danh mục món ăn'}
        subtitle={
          'Khám phá phong phú món ngon theo từng nhóm thực đơn: từ món chính đậm đà, món canh thanh mát đến các món gỏi, tráng miệng hấp dẫn.'
        }
      />

      <div className={'container mx-auto px-4 py-8'}>
        {/* Thanh chuyển nhanh giữa các danh mục */}
        <div className={'mb-10 flex flex-wrap items-center gap-2'}>
          <span className={'mr-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider'}>
            Nhóm món:
          </span>
          {sortedCategories.map((cat) => {
            const count = recipesByCategoryId.get(cat.id)?.length ?? 0;
            return (
              <a
                key={cat.slug}
                href={`#nhom-${cat.slug}`}
                className={
                  'inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3.5 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary'
                }
              >
                <span>{cat.name}</span>
                <span className={'rounded-full bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground'}>
                  {count}
                </span>
              </a>
            );
          })}
        </div>

        {/* Các hàng danh mục món ăn (Mỗi danh mục 1 hàng ngang) */}
        <div className={'flex flex-col gap-12'}>
          {sortedCategories.map((cat) => {
            const catRecipes = recipesByCategoryId.get(cat.id) ?? [];
            const displayRecipes = catRecipes.slice(0, MAX_RECIPES_PER_ROW);
            const totalCount = catRecipes.length;

            return (
              <section
                key={cat.id}
                id={`nhom-${cat.slug}`}
                aria-label={`Danh mục ${cat.name}`}
                className={'scroll-mt-24 border-b border-border/40 pb-12 last:border-b-0 last:pb-0'}
              >
                {/* Header danh mục + Nút Xem thêm */}
                <div className={'mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'}>
                  <div>
                    <div className={'flex items-center gap-2.5'}>
                      <h2 className={'text-xl font-bold tracking-tight text-foreground md:text-2xl'}>
                        {cat.name}
                      </h2>
                      <Badge variant={'secondary'} className={'text-xs font-semibold'}>
                        {totalCount} món
                      </Badge>
                    </div>

                    {cat.description && (
                      <p className={'text-muted-foreground mt-1 text-sm'}>
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <Button
                    nativeButton={false}
                    variant={'outline'}
                    size={'sm'}
                    className={'group self-start gap-1 font-medium text-primary border-primary/30 hover:bg-primary/10 sm:self-auto shrink-0'}
                    render={<Link href={`/danh-muc/${cat.slug}`} />}
                  >
                    <span>Xem thêm ({totalCount})</span>
                    <ChevronRight className={'h-4 w-4 transition-transform group-hover:translate-x-0.5'} />
                  </Button>
                </div>

                {/* Hàng ngang dạng lưới 4 item món ăn */}
                {displayRecipes.length === 0 ? (
                  <Card className={'bg-muted/30 border-dashed'}>
                    <CardContent className={'py-10 text-center'}>
                      <UtensilsCrossed className={'mx-auto h-8 w-8 text-muted-foreground/60 mb-2'} />
                      <p className={'text-sm text-muted-foreground'}>
                        Chưa có công thức nào trong nhóm “{cat.name}”. Các công thức mới sẽ sớm được cập nhật!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div
                    className={
                      'grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    }
                  >
                    {displayRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.slug}
                        recipe={recipe}
                        rating={ratingSummaries.get(recipe.id)}
                        initialFavorited={favoriteIds.has(recipe.id)}
                        initialFavoriteCount={favoriteCounts.get(recipe.id) ?? 0}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Chủ đề tags liên quan */}
        {tags.length > 0 && (
          <div className={'mt-16 rounded-2xl border border-border/50 bg-muted/20 p-6'}>
            <div className={'flex items-center gap-2 mb-3'}>
              <Sparkles className={'h-4 w-4 text-primary'} />
              <h3 className={'text-sm font-semibold uppercase tracking-wider text-foreground'}>
                Tìm món theo chủ đề ẩm thực
              </h3>
            </div>

            <div className={'flex flex-wrap gap-2'}>
              {tags.map((tag) => (
                <Link key={tag.slug} href={`/tag/${tag.slug}`}>
                  <Badge
                    variant={'outline'}
                    className={
                      'cursor-pointer px-3.5 py-1.5 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors'
                    }
                  >
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
