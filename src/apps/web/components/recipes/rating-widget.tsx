'use client';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { Loader2, Star } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { toast } from '@kit/ui/sonner';
import { cn } from '@kit/ui/utils';

import type { RatingSummary } from '~/lib/recipes/database';
import { useAuthModal } from '~/components/recipes/auth-modal';
import {
  removeRatingAction,
  setRatingAction,
} from '~/lib/recipes/rating-actions';

function formatAverage(average: number | null): string {
  if (average === null) {
    return 'Chưa có đánh giá';
  }

  return `${average.toFixed(1)}/5`;
}

type RatingStarsProps = {
  value: number;
  onSelect?: (score: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
};

export function RatingStars({
  value,
  onSelect,
  disabled = false,
  size = 'md',
}: RatingStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value;
  const starClass = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';

  return (
    <div
      className={'flex items-center gap-1'}
      role={onSelect ? 'radiogroup' : undefined}
      aria-label={'Đánh giá sao'}
    >
      {[1, 2, 3, 4, 5].map((score) => {
        const filled = score <= active;

        const star = (
          <Star
            className={cn(
              starClass,
              filled
                ? 'fill-primary text-primary'
                : 'text-muted-foreground',
            )}
            aria-hidden={true}
          />
        );

        if (!onSelect) {
          return <span key={score}>{star}</span>;
        }

        return (
          <button
            key={score}
            type={'button'}
            disabled={disabled}
            onClick={() => onSelect(score)}
            onMouseEnter={() => setHovered(score)}
            onMouseLeave={() => setHovered(null)}
            role={'radio'}
            aria-checked={value === score}
            aria-label={`${score} sao`}
            data-test={`rating-star-${score}`}
            className={cn(
              'rounded-sm transition-transform hover:scale-110',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}

type RatingWidgetProps = {
  recipeId: number;
  slug: string;
  summary: RatingSummary;
  /** Điểm người dùng hiện tại đã đánh giá (null nếu chưa). */
  userRating: number | null;
  /** Người dùng đã đăng nhập hay chưa. */
  isAuthenticated: boolean;
};

/**
 * Khối đánh giá: hiển thị điểm trung bình + cho phép chấm sao 1–5.
 * Chưa đăng nhập → bấm sao sẽ chuyển tới trang đăng nhập.
 */
export function RatingWidget({
  recipeId,
  slug,
  summary,
  userRating,
  isAuthenticated,
}: RatingWidgetProps) {
  const router = useRouter();
  const { openSignInModal } = useAuthModal();
  const [isPending, startTransition] = useTransition();
  const [currentSummary, setCurrentSummary] = useState(summary);
  const [currentUserRating, setCurrentUserRating] = useState(userRating);

  function handleSelect(score: number) {
    if (!isAuthenticated) {
      openSignInModal({
        title: 'Đánh giá món ăn',
        description: 'Đăng nhập để gửi đánh giá sao cho công thức này.',
        onSuccess: async () => {
          const result = await setRatingAction(recipeId, slug, score);
          if (result.ok) {
            setCurrentUserRating(result.userRating);
            setCurrentSummary(result.summary);
            toast.success('Cảm ơn bạn đã đánh giá!');
          }
        },
      });
      return;
    }

    startTransition(async () => {
      const result = await setRatingAction(recipeId, slug, score);

      if (!result.ok) {
        if (result.reason === 'unauthenticated') {
          openSignInModal({
            title: 'Đánh giá món ăn',
            description: 'Đăng nhập để gửi đánh giá sao cho công thức này.',
            onSuccess: async () => {
              const retry = await setRatingAction(recipeId, slug, score);
              if (retry.ok) {
                setCurrentUserRating(retry.userRating);
                setCurrentSummary(retry.summary);
                toast.success('Cảm ơn bạn đã đánh giá!');
              }
            },
          });
          return;
        }

        toast.error('Không lưu được đánh giá, vui lòng thử lại.');
        return;
      }

      setCurrentUserRating(result.userRating);
      setCurrentSummary(result.summary);
      toast.success('Cảm ơn bạn đã đánh giá!');
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeRatingAction(recipeId, slug);

      if (!result.ok) {
        toast.error('Không xóa được đánh giá, vui lòng thử lại.');
        return;
      }

      setCurrentUserRating(null);
      setCurrentSummary(result.summary);
      toast.success('Đã xóa đánh giá của bạn.');
      router.refresh();
    });
  }

  return (
    <div className={'flex flex-col gap-3'}>
      <div className={'flex flex-wrap items-center gap-3'}>
        <RatingStars
          value={Math.round(currentSummary.average ?? 0)}
          size={'sm'}
        />

        <span className={'text-sm font-medium'}>
          {formatAverage(currentSummary.average)}
        </span>

        <span className={'text-muted-foreground text-sm'}>
          ({currentSummary.count} lượt đánh giá)
        </span>
      </div>

      <div className={'flex flex-wrap items-center gap-3'}>
        <span className={'text-sm font-medium'}>Đánh giá của bạn:</span>

        <RatingStars
          value={currentUserRating ?? 0}
          onSelect={handleSelect}
          disabled={isPending}
        />

        {isPending ? (
          <Loader2
            className={'h-4 w-4 animate-spin'}
            aria-hidden={true}
          />
        ) : null}

        {currentUserRating ? (
          <Button
            type={'button'}
            variant={'ghost'}
            size={'sm'}
            onClick={handleRemove}
            disabled={isPending}
            data-test={'rating-remove'}
          >
            Xóa đánh giá
          </Button>
        ) : null}
      </div>

      {!isAuthenticated ? (
        <p className={'text-muted-foreground text-sm'}>
          <button
            type={'button'}
            onClick={() =>
              openSignInModal({
                title: 'Đăng nhập',
                description: 'Đăng nhập để lưu món yêu thích và đánh giá công thức.',
              })
            }
            className={'text-primary font-medium underline underline-offset-4 hover:opacity-80'}
          >
            Đăng nhập
          </button>{' '}
          để lưu món yêu thích và đánh giá công thức.
        </p>
      ) : null}
    </div>
  );
}
