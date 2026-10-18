import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';

import { Heart } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@kit/ui/empty';

import { RecipeCard } from '~/components/recipes/recipe-card';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { getFavoriteRecipes } from '~/lib/recipes/queries';
import { getRecipeFavoriteCounts } from '~/lib/recipes/favorites';

import { SitePageHeader } from '../_components/site-page-header';

export const metadata: Metadata = {
  title: 'Món yêu thích của tôi',
  description: 'Danh sách công thức bạn đã đánh dấu yêu thích.',
};

// Trang riêng tư theo từng người dùng: cho phép "blocking" thay vì lỗi
// prerender với cacheComponents (dùng kèm `await connection()` bên dưới).
export const instant = false;

/**
 * Trang liệt kê công thức yêu thích của người dùng hiện tại.
 * Nằm trong route group (marketing) để kế thừa toàn bộ layout (Header, Footer, Navigation) như trang chủ.
 * Yêu cầu đăng nhập — chưa đăng nhập sẽ được chuyển tới trang đăng nhập.
 */
export default async function FavoritesPage() {
  await connection();

  const user = await requireUserInServerComponent();
  const userId = user.sub ?? user.id;

  const recipes = await getFavoriteRecipes(userId);
  const favoriteCounts = await getRecipeFavoriteCounts(recipes.map((r) => r.id));

  return (
    <div className={'flex flex-1 flex-col'}>
      <SitePageHeader
        title={'Món yêu thích của tôi'}
        subtitle={
          recipes.length > 0
            ? `Bạn đã lưu ${recipes.length} công thức yêu thích.`
            : 'Những công thức bạn đã đánh dấu yêu thích sẽ được lưu giữ tại đây.'
        }
      />

      <div className={'container mx-auto px-4 py-8'}>
        {recipes.length === 0 ? (
          <Empty className={'py-16'}>
            <EmptyHeader>
              <EmptyMedia variant={'icon'}>
                <Heart className={'h-8 w-8 text-rose-500'} aria-hidden={true} />
              </EmptyMedia>

              <EmptyTitle>Chưa có món yêu thích nào</EmptyTitle>

              <EmptyDescription>
                Khám phá các công thức và bấm nút tim “Yêu thích” để lưu lại những món
                bạn muốn nấu nhé!
              </EmptyDescription>
            </EmptyHeader>

            <EmptyContent>
              <Button
                nativeButton={false}
                render={<Link href={'/tim-kiem'} />}
              >
                Khám phá món ăn ngay
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className={'grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                initialFavorited={true}
                initialFavoriteCount={favoriteCounts.get(recipe.id) ?? 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
