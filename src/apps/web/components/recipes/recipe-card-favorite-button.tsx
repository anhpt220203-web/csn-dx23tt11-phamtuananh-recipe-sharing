'use client';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { Heart, Loader2 } from 'lucide-react';

import { toast } from '@kit/ui/sonner';
import { cn } from '@kit/ui/utils';

import { useAuthModal } from '~/components/recipes/auth-modal';
import { toggleFavoriteAction } from '~/lib/recipes/favorite-actions';

type RecipeCardFavoriteButtonProps = {
  recipeId: number;
  slug?: string;
  initialFavorited?: boolean;
  className?: string;
  onFavoriteChange?: (favorited: boolean) => void;
};

/**
 * Nút trái tim tròn nền trắng nằm trên thẻ công thức.
 * Khi chưa đăng nhập: mở popup modal đăng nhập tại chỗ thay vì chuyển hướng.
 * Đã đăng nhập: toggle trạng thái yêu thích ngay lập tức.
 */
export function RecipeCardFavoriteButton({
  recipeId,
  slug,
  initialFavorited = false,
  className,
  onFavoriteChange,
}: RecipeCardFavoriteButtonProps) {
  const router = useRouter();
  const { openSignInModal } = useAuthModal();
  const [isPending, startTransition] = useTransition();
  const [favorited, setFavorited] = useState(initialFavorited);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const result = await toggleFavoriteAction(recipeId, slug);

      if (!result.ok) {
        if (result.reason === 'unauthenticated') {
          openSignInModal({
            title: 'Lưu món yêu thích',
            description:
              'Đăng nhập để lưu công thức này vào danh sách yêu thích của bạn.',
            onSuccess: async () => {
              const retry = await toggleFavoriteAction(recipeId, slug);
              if (retry.ok) {
                setFavorited(retry.favorited);
                onFavoriteChange?.(retry.favorited);
                toast.success(
                  retry.favorited
                    ? 'Đã thêm vào món yêu thích.'
                    : 'Đã bỏ khỏi món yêu thích.',
                );
              }
            },
          });
          return;
        }

        toast.error('Có lỗi xảy ra, vui lòng thử lại.');
        return;
      }

      setFavorited(result.favorited);
      onFavoriteChange?.(result.favorited);

      toast.success(
        result.favorited
          ? 'Đã thêm vào món yêu thích.'
          : 'Đã bỏ khỏi món yêu thích.',
      );

      router.refresh();
    });
  }

  return (
    <button
      type={'button'}
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      data-test={'recipe-card-favorite-button'}
      className={cn(
        'group/heart relative flex h-10 w-10 items-center justify-center rounded-full',
        'bg-white/95 text-muted-foreground shadow-md backdrop-blur-xs',
        'transition-all duration-200 hover:scale-110 active:scale-95',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        favorited && 'text-red-500',
        className,
      )}
    >
      {isPending ? (
        <Loader2 className={'h-4 w-4 animate-spin text-primary'} aria-hidden={true} />
      ) : (
        <Heart
          className={cn(
            'h-5 w-5 transition-transform duration-200 group-hover/heart:scale-110',
            favorited
              ? 'fill-red-500 text-red-500'
              : 'fill-black/10 text-gray-500 hover:text-red-500',
          )}
          aria-hidden={true}
        />
      )}
    </button>
  );
}

