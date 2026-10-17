import Link from 'next/link';

import { ChefHat, Clock, Star, Users } from 'lucide-react';

import {
  Card,
  CardContent,
  CardTitle,
} from '@kit/ui/card';
import { cn } from '@kit/ui/utils';

import { RecipeCardFavoriteButton } from './recipe-card-favorite-button';

import type { RatingSummary, RecipeWithCategory } from '~/lib/recipes/database';

function formatCookTime(minutes: number | null): string {
  if (minutes === null || minutes === undefined) {
    return 'Chưa rõ';
  }

  if (minutes < 60) {
    return `${minutes} phút`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest > 0 ? `${hours} giờ ${rest} phút` : `${hours} giờ`;
}

type RecipeCardProps = {
  recipe: RecipeWithCategory;
  rating?: RatingSummary;
  /** Trạng thái yêu thích ban đầu của người dùng hiện tại. */
  initialFavorited?: boolean;
};

/**
 * Thẻ công thức kiểu "tạp chí ẩm thực": ảnh 4:3 nổi bật, badge nhóm món
 * đè trên ảnh, tiêu đề và hàng thông số (khẩu phần · độ khó · thời gian ·
 * điểm đánh giá) ở phần thân. Dùng cho trang chủ, danh mục, tìm kiếm…
 */
export function RecipeCard({
  recipe,
  rating,
  initialFavorited = false,
}: RecipeCardProps) {
  const detailHref = `/cong-thuc/${recipe.slug}`;
  const hasRating =
    rating && rating.count > 0 && rating.average !== null
      ? { average: rating.average, count: rating.count }
      : null;

  return (
    <Card
      className={
        'group flex h-full flex-col pt-0 transition-shadow hover:shadow-lg'
      }
    >
      <div className={'relative'}>
        <Link
          href={detailHref}
          className={'block overflow-hidden'}
          aria-label={`Xem công thức ${recipe.title}`}
        >
          {recipe.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.image_url}
              alt={recipe.title}
              loading={'lazy'}
              className={
                'aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]'
              }
            />
          ) : (
            <div
              className={cn(
                'flex aspect-[4/3] w-full items-center justify-center',
                'bg-gradient-to-br from-orange-100 to-amber-200',
                'dark:from-orange-950 dark:to-amber-950',
              )}
              aria-hidden={true}
            >
              <ChefHat className={'h-12 w-12 text-orange-400'} />
            </div>
          )}
        </Link>

        {recipe.category_name ? (
          <Link
            href={`/danh-muc/${recipe.category_slug}`}
            className={
              'bg-secondary/95 text-secondary-foreground absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-medium shadow-sm backdrop-blur transition-colors hover:bg-accent'
            }
          >
            {recipe.category_name}
          </Link>
        ) : null}

        <RecipeCardFavoriteButton
          recipeId={recipe.id}
          initialFavorited={initialFavorited}
          className={'absolute top-2.5 right-2.5'}
        />
      </div>

      <CardContent className={'flex flex-1 flex-col gap-2'}>
        <CardTitle className={'line-clamp-2 text-base font-semibold'}>
          <Link href={detailHref} className={'hover:text-primary'}>
            {recipe.title}
          </Link>
        </CardTitle>

        {recipe.description ? (
          <p className={'text-muted-foreground line-clamp-2 text-sm'}>
            {recipe.description}
          </p>
        ) : null}

        <div
          className={
            'text-muted-foreground mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs'
          }
        >
          {recipe.servings ? (
            <span className={'inline-flex items-center gap-1'}>
              <Users className={'h-3.5 w-3.5'} aria-hidden={true} />
              {recipe.servings} người
            </span>
          ) : null}

          {recipe.difficulty ? (
            <span className={'inline-flex items-center gap-1'}>
              <ChefHat className={'h-3.5 w-3.5'} aria-hidden={true} />
              {recipe.difficulty}
            </span>
          ) : null}

          <span className={'inline-flex items-center gap-1'}>
            <Clock className={'h-3.5 w-3.5'} aria-hidden={true} />
            {formatCookTime(recipe.cook_time)}
          </span>

          {hasRating ? (
            <span className={'text-primary inline-flex items-center gap-1 font-medium'}>
              <Star
                className={'fill-primary h-3.5 w-3.5'}
                aria-hidden={true}
              />
              <span className={'tabular-nums'}>
                {hasRating.average.toFixed(1)}
              </span>
              <span className={'text-muted-foreground'}>
                ({hasRating.count})
              </span>
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
