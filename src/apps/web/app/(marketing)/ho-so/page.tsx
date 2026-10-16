import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';

import { ChevronRight, Heart, KeyRound, Star, UserRound } from 'lucide-react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { cn } from '@kit/ui/utils';

import { RecipeCard } from '~/components/recipes/recipe-card';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import {
  type MyRatingWithRecipe,
  getFavoriteRecipes,
  getMyRatingsWithRecipes,
} from '~/lib/recipes/queries';

import { ProfileNameForm } from './_components/profile-name-form';
import { ProfilePasswordForm } from './_components/profile-password-form';

export const metadata: Metadata = {
  title: 'Hồ sơ cá nhân',
  description:
    'Quản lý thông tin cá nhân, đổi mật khẩu, xem món yêu thích và đánh giá của bạn.',
};

// Trang riêng tư theo từng người dùng: cho phép "blocking" thay vì lỗi
// prerender với cacheComponents (dùng kèm `await connection()` bên dưới).
export const instant = false;

const PREVIEW_FAVORITE_COUNT = 3;

/**
 * Đọc họ tên hiển thị từ `user_metadata`, cùng thứ tự ưu tiên với
 * trang quản trị tài khoản (`app/admin/user/page.tsx`).
 */
function getDisplayName(userMetadata: Record<string, unknown>): string {
  const name =
    userMetadata['name'] ??
    userMetadata['full_name'] ??
    userMetadata['display_name'] ??
    userMetadata['ten'];

  return typeof name === 'string' ? name.trim() : '';
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Trang hồ sơ cá nhân (SRS FR4). Yêu cầu đăng nhập — chưa đăng nhập sẽ
 * được chuyển tới trang đăng nhập.
 */
export default async function ProfilePage() {
  // Trang riêng tư theo từng người dùng — luôn render động theo request
  // (thay cho `dynamic = 'force-dynamic'`, vốn không tương thích cacheComponents).
  await connection();

  const sessionUser = await requireUserInServerComponent();
  const userId = sessionUser.sub ?? sessionUser.id;

  const client = getSupabaseServerClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  const displayName = getDisplayName(
    (user?.user_metadata ?? {}) as Record<string, unknown>,
  );
  const email = user?.email ?? sessionUser.email ?? '';

  const [favorites, myRatings] = await Promise.all([
    getFavoriteRecipes(userId),
    getMyRatingsWithRecipes(userId),
  ]);

  const favoritePreview = favorites.slice(0, PREVIEW_FAVORITE_COUNT);

  return (
    <div className={'mx-auto w-full max-w-6xl px-4 py-6 sm:py-8'}>
      <header className={'mb-6 flex items-center gap-4'}>
        <div
          className={
            'bg-primary/10 text-primary flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold'
          }
          aria-hidden={true}
        >
          {(displayName || email || '?').charAt(0).toUpperCase()}
        </div>

        <div className={'min-w-0'}>
          <h1
            className={
              'truncate text-2xl font-bold tracking-tight sm:text-3xl'
            }
          >
            {displayName || 'Hồ sơ cá nhân'}
          </h1>

          {email ? (
            <p className={'text-muted-foreground truncate text-sm'}>{email}</p>
          ) : null}
        </div>
      </header>

      <div className={'grid grid-cols-1 gap-4 md:grid-cols-2'}>
        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2 text-lg'}>
              <UserRound className={'h-5 w-5'} aria-hidden={true} />
              Thông tin cá nhân
            </CardTitle>

            <CardDescription>
              Họ tên được lưu vào tài khoản của bạn.
            </CardDescription>
          </CardHeader>

          <CardContent className={'flex flex-col gap-4'}>
            <div>
              <p className={'text-muted-foreground mb-1 text-sm'}>
                Địa chỉ email
              </p>

              <p className={'truncate text-sm font-medium'}>{email}</p>
            </div>

            <ProfileNameForm initialName={displayName} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2 text-lg'}>
              <KeyRound className={'h-5 w-5'} aria-hidden={true} />
              Đổi mật khẩu
            </CardTitle>

            <CardDescription>
              Nhập mật khẩu mới rồi xác nhận lại để thay đổi.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ProfilePasswordForm />
          </CardContent>
        </Card>
      </div>

      <Card className={'mt-4'}>
        <CardHeader className={'flex flex-row items-center justify-between'}>
          <div>
            <CardTitle className={'flex items-center gap-2 text-lg'}>
              <Heart
                className={'fill-primary text-primary h-5 w-5'}
                aria-hidden={true}
              />
              Món yêu thích
            </CardTitle>

            <CardDescription>
              {favorites.length > 0
                ? `Bạn đã lưu ${favorites.length} công thức.`
                : 'Những công thức bạn đánh dấu yêu thích sẽ hiện ở đây.'}
            </CardDescription>
          </div>

          {favorites.length > PREVIEW_FAVORITE_COUNT ? (
            <Button
              nativeButton={false}
              variant={'ghost'}
              size={'sm'}
              render={<Link href={'/yeu-thich'} />}
            >
              Xem tất cả
              <ChevronRight className={'h-4 w-4'} aria-hidden={true} />
            </Button>
          ) : null}
        </CardHeader>

        <CardContent>
          {favoritePreview.length === 0 ? (
            <p className={'text-muted-foreground text-sm'}>
              Chưa có món yêu thích nào. Khám phá các công thức và bấm nút
              “Yêu thích” để lưu lại những món bạn thích nhất.{' '}
              <Link
                href={'/yeu-thich'}
                className={'text-primary font-medium underline'}
              >
                Xem trang yêu thích
              </Link>
              .
            </p>
          ) : (
            <>
              <div
                className={
                  'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
                }
              >
                {favoritePreview.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>

              {favorites.length > PREVIEW_FAVORITE_COUNT ? (
                <div className={'mt-4 text-center'}>
                  <Button
                    nativeButton={false}
                    variant={'outline'}
                    render={<Link href={'/yeu-thich'} />}
                  >
                    Xem tất cả {favorites.length} món yêu thích
                    <ChevronRight
                      className={'h-4 w-4'}
                      aria-hidden={true}
                    />
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card className={'mt-4'}>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2 text-lg'}>
            <Star
              className={'fill-amber-400 text-amber-400 h-5 w-5'}
              aria-hidden={true}
            />
            Đánh giá của tôi
          </CardTitle>

          <CardDescription>
            {myRatings.length > 0
              ? `Bạn đã đánh giá ${myRatings.length} công thức.`
              : 'Những công thức bạn chấm sao sẽ hiện ở đây.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {myRatings.length === 0 ? (
            <p className={'text-muted-foreground text-sm'}>
              Bạn chưa đánh giá công thức nào. Mở một công thức bất kỳ và
              chấm sao để chia sẻ cảm nhận của bạn.
            </p>
          ) : (
            <ul className={'flex flex-col divide-y'}>
              {myRatings.map((item) => (
                <MyRatingRow key={item.recipe_id} item={item} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MyRatingRow({ item }: { item: MyRatingWithRecipe }) {
  return (
    <li className={'flex items-center justify-between gap-3 py-3'}>
      <div className={'min-w-0'}>
        <Link
          href={`/cong-thuc/${item.slug}`}
          className={'hover:text-primary truncate font-medium'}
        >
          {item.title}
        </Link>

        <div className={'mt-1 flex items-center gap-2'}>
          <span
            className={'flex items-center gap-0.5'}
            aria-label={`Bạn đã đánh giá ${item.rating} trên 5 sao`}
          >
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={cn(
                  'h-4 w-4',
                  index < item.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground',
                )}
                aria-hidden={true}
              />
            ))}
          </span>

          <span className={'text-muted-foreground text-xs'}>
            {formatDate(item.created_at)}
          </span>
        </div>
      </div>

      <Button
        nativeButton={false}
        variant={'ghost'}
        size={'sm'}
        className={'shrink-0'}
        render={<Link href={`/cong-thuc/${item.slug}`} />}
      >
        Xem món
        <ChevronRight className={'h-4 w-4'} aria-hidden={true} />
      </Button>
    </li>
  );
}
