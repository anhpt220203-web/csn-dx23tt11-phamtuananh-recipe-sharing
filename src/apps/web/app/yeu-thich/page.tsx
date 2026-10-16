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

export const metadata: Metadata = {
  title: 'Món yêu thích của tôi',
  description: 'Danh sách công thức bạn đã đánh dấu yêu thích.',
};

// Trang riêng tư theo từng người dùng: cho phép "blocking" thay vì lỗi
// prerender với cacheComponents (dùng kèm `await connection()` bên dưới).
export const instant = false;

/**
 * Trang liệt kê công thức yêu thích của người dùng hiện tại.
 * Yêu cầu đăng nhập — chưa đăng nhập sẽ được chuyển tới trang đăng nhập.
 */
export default async function FavoritesPage() {
  // Trang riêng tư theo từng người dùng — luôn render động theo request
  // (thay cho `dynamic = 'force-dynamic'`, vốn không tương thích cacheComponents).
  await connection();

  const user = await requireUserInServerComponent();
  const userId = user.sub ?? user.id;

  const recipes = await getFavoriteRecipes(userId);

  return (
    <div className={'mx-auto w-full max-w-6xl px-4 py-6 sm:py-8'}>
      <header className={'mb-6 flex flex-col gap-1'}>
        <h1
          className={
            'inline-flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl'
          }
        >
          <Heart
            className={'fill-primary text-primary h-6 w-6'}
            aria-hidden={true}
          />
          Món yêu thích của tôi
        </h1>

        <p className={'text-muted-foreground text-sm'}>
          {recipes.length > 0
            ? `Bạn đã lưu ${recipes.length} công thức.`
            : 'Những công thức bạn đánh dấu yêu thích sẽ hiện ở đây.'}
        </p>
      </header>

      {recipes.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant={'icon'}>
              <Heart aria-hidden={true} />
            </EmptyMedia>

            <EmptyTitle>Chưa có món yêu thích nào</EmptyTitle>

            <EmptyDescription>
              Khám phá các công thức và bấm nút “Yêu thích” để lưu lại những món
              bạn thích nhất.
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent>
            <Button render={<Link href={'/cong-thuc'} />}>
              Khám phá công thức
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className={'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} initialFavorited />
          ))}
        </div>
      )}
    </div>
  );
}
