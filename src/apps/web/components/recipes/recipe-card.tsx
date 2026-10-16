import Link from 'next/link';

import { ChefHat, Clock, Star, Timer, Users } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { cn } from '@kit/ui/utils';

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
};

/**
 * Thẻ công thức dùng cho danh sách (trang chủ, danh mục, yêu thích…).
 */
export function RecipeCard({ recipe, rating }: RecipeCardProps) {
  const detailHref = `/cong-thuc/${recipe.slug}`;

  return (
    <Card className={'flex h-full flex-col transition-shadow hover:shadow-md'}>
      <CardHeader className={'p-0'}>
        <Link
          href={detailHref}
          className={'block overflow-hidden rounded-t-xl'}
          aria-label={`Xem công thức ${recipe.title}`}
        >
          {recipe.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.image_url}
              alt={recipe.title}
              loading={'lazy'}
              className={'aspect-[16/9] w-full object-cover'}
            />
          ) : (
            <div
              className={cn(
                'bg-muted flex aspect-[16/9] w-full items-center justify-center',
              )}
              aria-hidden={true}
            >
              <ChefHat className={'text-muted-foreground h-12 w-12'} />
            </div>
          )}
        </Link>
      </CardHeader>

      <CardContent className={'flex flex-1 flex-col gap-2 pt-4'}>
        <div className={'flex flex-wrap items-center gap-2'}>
          <Badge variant={'secondary'}>
            <Link href={`/danh-muc/${recipe.category_slug}`}>
              {recipe.category_name}
            </Link>
          </Badge>

          {recipe.difficulty ? (
            <Badge variant={'outline'}>{recipe.difficulty}</Badge>
          ) : null}
        </div>

        <CardTitle className={'text-lg leading-snug'}>
          <Link href={detailHref} className={'hover:underline'}>
            {recipe.title}
          </Link>
        </CardTitle>

        {recipe.description ? (
          <p className={'text-muted-foreground line-clamp-2 text-sm'}>
            {recipe.description}
          </p>
        ) : null}
      </CardContent>

      <CardFooter className={'text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm'}>
        <span className={'inline-flex items-center gap-1'}>
          <Clock className={'h-4 w-4'} aria-hidden={true} />
          {formatCookTime(recipe.cook_time)}
        </span>

        {recipe.prep_time ? (
          <span className={'inline-flex items-center gap-1'}>
            <Timer className={'h-4 w-4'} aria-hidden={true} />
            {formatCookTime(recipe.prep_time)} chuẩn bị
          </span>
        ) : null}

        {recipe.servings ? (
          <span className={'inline-flex items-center gap-1'}>
            <Users className={'h-4 w-4'} aria-hidden={true} />
            {recipe.servings} khẩu phần
          </span>
        ) : null}

        {rating && rating.count > 0 && rating.average !== null ? (
          <span className={'inline-flex items-center gap-1'}>
            <Star
              className={'fill-primary text-primary h-4 w-4'}
              aria-hidden={true}
            />
            {rating.average.toFixed(1)} ({rating.count})
          </span>
        ) : null}
      </CardFooter>
    </Card>
  );
}
