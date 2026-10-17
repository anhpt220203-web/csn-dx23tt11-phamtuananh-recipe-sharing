'use client';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { Heart, Loader2 } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { toast } from '@kit/ui/sonner';
import { cn } from '@kit/ui/utils';

import { toggleFavoriteAction } from '~/lib/recipes/favorite-actions';

type FavoriteButtonProps = {
  recipeId: number;
  slug: string;
  initialFavorited: boolean;
  className?: string;
};

/**
 * Nút đánh dấu / bỏ đánh dấu yêu thích.
 * Chưa đăng nhập → chuyển tới trang đăng nhập.
 */
export function FavoriteButton({
  recipeId,
  slug,
  initialFavorited,
  className,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [favorited, setFavorited] = useState(initialFavorited);

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFavoriteAction(recipeId, slug);

      if (!result.ok) {
        if (result.reason === 'unauthenticated') {
          toast.info('Bạn cần đăng nhập để lưu món yêu thích.');
          router.push('/auth/sign-in');
          return;
        }

        toast.error('Có lỗi xảy ra, vui lòng thử lại.');
        return;
      }

      setFavorited(result.favorited);

      toast.success(
        result.favorited
          ? 'Đã thêm vào món yêu thích.'
          : 'Đã bỏ khỏi món yêu thích.',
      );

      router.refresh();
    });
  }

  return (
    <Button
      type={'button'}
      variant={favorited ? 'default' : 'outline'}
      size={'sm'}
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      data-test={'favorite-button'}
      className={cn('gap-2', className)}
    >
      {isPending ? (
        <Loader2 className={'h-4 w-4 animate-spin'} aria-hidden={true} />
      ) : (
        <Heart
          className={cn('h-4 w-4', favorited && 'fill-current')}
          aria-hidden={true}
        />
      )}
      {favorited ? 'Đã yêu thích' : 'Yêu thích'}
    </Button>
  );
}
