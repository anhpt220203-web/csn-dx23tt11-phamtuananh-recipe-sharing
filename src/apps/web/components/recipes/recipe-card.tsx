import Link from 'next/link';

import {
  ChefHat,
  ChevronRight,
  Flame,
  Heart,
  Star,
  Users,
} from 'lucide-react';

import { cn } from '@kit/ui/utils';

import { RecipeCardFavoriteButton } from './recipe-card-favorite-button';

import type { RatingSummary, RecipeWithCategory } from '~/lib/recipes/database';
import { resolveRecipeImageSrc } from '~/lib/recipes/images';

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
 * Thẻ công thức nấu ăn hiện đại chuẩn mẫu:
 * - Ảnh bo góc mượt mà kèm nút tim tròn nền trắng nổi bật ở góc phải.
 * - Tiêu đề món + huy hiệu số lượt tim (like count).
 * - 3 thẻ thông số có icon đỏ: [Khẩu phần] [Độ khó] [Thời gian nấu].
 * - Nút "XEM CHI TIẾT >" nổi bật màu hồng cam.
 */
export function RecipeCard({
  recipe,
  rating,
  initialFavorited = false,
}: RecipeCardProps) {
  const detailHref = `/cong-thuc/${recipe.slug}`;
  const imageSrc = resolveRecipeImageSrc(recipe.image_url);
  const hasRating =
    rating && rating.count > 0 && rating.average !== null
      ? { average: rating.average, count: rating.count }
      : null;

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-3 shadow-xs',
        'transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl',
      )}
    >
      {/* ── Khối hình ảnh bo góc + Nút yêu thích + Badge danh mục ── */}
      <div className={'relative aspect-[16/11] w-full overflow-hidden rounded-xl bg-muted'}>
        <Link
          href={detailHref}
          className={'block h-full w-full overflow-hidden'}
          aria-label={`Xem công thức ${recipe.title}`}
        >
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={recipe.title}
              loading={'lazy'}
              className={
                'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
              }
            />
          ) : (
            <div
              className={cn(
                'flex h-full w-full items-center justify-center',
                'bg-gradient-to-br from-orange-100 to-amber-200',
                'dark:from-orange-950 dark:to-amber-950',
              )}
              aria-hidden={true}
            >
              <ChefHat className={'h-12 w-12 text-orange-400'} />
            </div>
          )}
        </Link>

        {/* Huy hiệu nhóm món góc trên bên trái */}
        {recipe.category_name ? (
          <Link
            href={`/danh-muc/${recipe.category_slug}`}
            className={
              'absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-md transition-colors hover:bg-black/80'
            }
          >
            <span className={'flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px]'}>
              🍲
            </span>
            <span>{recipe.category_name}</span>
          </Link>
        ) : (
          <div
            className={
              'absolute top-2.5 left-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-sm'
            }
          >
            <ChefHat className={'h-3.5 w-3.5'} aria-hidden={true} />
          </div>
        )}

        {/* Nút yêu thích tròn nền trắng góc trên bên phải */}
        <RecipeCardFavoriteButton
          recipeId={recipe.id}
          slug={recipe.slug}
          initialFavorited={initialFavorited}
          className={'absolute top-2.5 right-2.5'}
        />
      </div>

      {/* ── Phần thân thẻ: Tiêu đề + Huy hiệu tim ── */}
      <div className={'mt-3 flex items-start justify-between gap-2'}>
        <h3 className={'line-clamp-1 text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg'}>
          <Link href={detailHref} className={'hover:underline'}>
            {recipe.title}
          </Link>
        </h3>

        <div
          className={
            'inline-flex shrink-0 items-center gap-1 rounded-lg border border-border/60 bg-muted/20 px-2 py-0.5 text-xs font-semibold text-muted-foreground'
          }
          title={`${rating?.count ?? 0} lượt thích / đánh giá`}
        >
          <span>{rating?.count ?? 0}</span>
          <Heart className={'h-3.5 w-3.5 fill-red-500 text-red-500'} aria-hidden={true} />
        </div>
      </div>

      {/* Đánh giá sao nếu có */}
      {hasRating ? (
        <div className={'mt-1 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400'}>
          <Star className={'h-3.5 w-3.5 fill-amber-500 text-amber-500'} aria-hidden={true} />
          <span className={'tabular-nums font-bold'}>{hasRating.average.toFixed(1)}</span>
          <span className={'text-muted-foreground'}>({hasRating.count})</span>
        </div>
      ) : null}

      {/* ── Hàng 3 thông số (Khẩu phần, Độ khó, Thời gian) với Icon màu đỏ ── */}
      <div className={'mt-2.5 flex flex-wrap items-center gap-2'}>
        <div
          className={
            'inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground'
          }
        >
          <Users className={'h-3.5 w-3.5 text-red-500'} aria-hidden={true} />
          <span className={'capitalize'}>
            {recipe.servings ? `${recipe.servings} người` : '4 người'}
          </span>
        </div>

        <div
          className={
            'inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground'
          }
        >
          <ChefHat className={'h-3.5 w-3.5 text-red-500'} aria-hidden={true} />
          <span>{recipe.difficulty ?? 'Dễ'}</span>
        </div>

        <div
          className={
            'inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground'
          }
        >
          <Flame className={'h-3.5 w-3.5 text-red-500'} aria-hidden={true} />
          <span className={'capitalize'}>
            {formatCookTime(recipe.cook_time)}
          </span>
        </div>
      </div>

      {/* ── Nút XEM CHI TIẾT > màu hồng cam chuẩn thiết kế ── */}
      <div className={'mt-auto pt-3.5'}>
        <Link
          href={detailHref}
          className={
            'inline-flex items-center gap-1 rounded-xl bg-rose-100 px-3.5 py-1.5 text-xs font-bold tracking-wider text-rose-600 transition-colors hover:bg-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40'
          }
        >
          <span>XEM CHI TIẾT</span>
          <ChevronRight className={'h-3.5 w-3.5 stroke-[2.5] text-rose-600 dark:text-rose-300'} aria-hidden={true} />
        </Link>
      </div>
    </div>
  );
}
