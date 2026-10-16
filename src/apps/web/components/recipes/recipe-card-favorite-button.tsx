'use client';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { Heart, Loader2 } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { toast } from '@kit/ui/sonner';
import { cn } from '@kit/ui/utils';

import { toggleFavoriteAction } from '~/lib/recipes/social-actions';

type RecipeCardFavoriteButtonProps = {
  recipeId: number;
  initialFavorited?: boolean;
  className?: string;
};

/**
 * Lỗi redirect của Next.js (digest bắt đầu bằng `NEXT_REDIRECT`).
 * Server action gọi `redirect()` (VD: khách chưa đăng nhập → /auth/sign-in)
 * thì framework tự điều hướng ở phía client, đồng thời reject promise của
 * action — đây KHÔNG phải lỗi, nên bỏ qua lặng lẽ, không hiện toast.
 */
function isRedirectError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as { digest?: unknown }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}

/**
 * Nút trái tim gọn nằm trên thẻ công thức.
 * Dùng chung server action `toggleFavoriteAction` trong social-actions.ts:
 * khách chưa đăng nhập được server chuyển hướng về /auth/sign-in
 * (framework tự điều hướng, không hiện toast lỗi),
 * đã đăng nhập thì toggle và trái tim đổi màu đồng bộ theo trạng thái.
 */
export function RecipeCardFavoriteButton({
  recipeId,
  initialFavorited = false,
  className,
}: RecipeCardFavoriteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [favorited, setFavorited] = useState(initialFavorited);

  function handleClick() {
    startTransition(async () => {
      try {
        const result = await toggleFavoriteAction({ recipeId });

        setFavorited(result.favorited);

        toast.success(
          result.favorited
            ? 'Đã thêm vào món yêu thích.'
            : 'Đã bỏ khỏi món yêu thích.',
        );

        router.refresh();
      } catch (error) {
        // Khách chưa đăng nhập: server đã redirect về /auth/sign-in,
        // framework tự điều hướng — không hiện toast lỗi.
        if (isRedirectError(error)) {
          return;
        }

        toast.error('Có lỗi xảy ra, vui lòng thử lại.');
      }
    });
  }

  return (
    <Button
      type={'button'}
      variant={'secondary'}
      size={'icon-sm'}
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      data-test={'recipe-card-favorite-button'}
      className={cn(
        'rounded-full shadow-sm',
        favorited && 'text-red-500',
        className,
      )}
    >
      {isPending ? (
        <Loader2 className={'h-4 w-4 animate-spin'} aria-hidden={true} />
      ) : (
        <Heart
          className={cn('h-4 w-4', favorited && 'fill-current')}
          aria-hidden={true}
        />
      )}
    </Button>
  );
}
