'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';

import type { BannerRow } from '~/lib/content/database';

const AUTOPLAY_MS = 5000;

type BannerCarouselProps = {
  banners: BannerRow[];
};

/**
 * Carousel banner trang chủ: tự động chuyển slide, có nút pause/play
 * và điều hướng trước/sau (theo mẫu Knorr).
 */
export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = banners.length;

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) {
      return;
    }

    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, AUTOPLAY_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [paused, count]);

  if (count === 0) {
    return null;
  }

  const banner = banners[index];

  if (!banner) {
    return null;
  }

  const content = (
    <div className={'relative overflow-hidden rounded-2xl'}>
      {banner.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.image_url}
          alt={banner.title}
          className={'aspect-[21/9] w-full object-cover sm:aspect-[3/1]'}
        />
      ) : (
        <div
          className={
            'bg-gradient-to-br from-orange-100 via-amber-50 to-background dark:from-orange-950/40 dark:via-amber-950/20 aspect-[21/9] w-full sm:aspect-[3/1]'
          }
          aria-hidden={true}
        />
      )}

      <div
        className={
          'absolute inset-0 flex flex-col justify-center gap-2 bg-gradient-to-r from-black/50 via-black/20 to-transparent p-6 sm:p-10'
        }
      >
        <h2
          className={
            'max-w-xl text-2xl font-bold tracking-tight text-white sm:text-4xl'
          }
        >
          {banner.title}
        </h2>

        {banner.subtitle ? (
          <p className={'max-w-lg text-sm text-white/90 sm:text-base'}>
            {banner.subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );

  return (
    <div
      className={'relative'}
      role={'region'}
      aria-roledescription={'carousel'}
      aria-label={'Banner nổi bật'}
    >
      {banner.link_url ? (
        <Link
          href={banner.link_url}
          aria-label={banner.title}
          className={'block'}
        >
          {content}
        </Link>
      ) : (
        content
      )}

      {count > 1 ? (
        <>
          <div
            className={'absolute right-4 bottom-4 flex items-center gap-2'}
          >
            <Button
              type={'button'}
              variant={'secondary'}
              size={'icon'}
              className={'h-8 w-8 rounded-full'}
              onClick={() => goTo(index - 1)}
              aria-label={'Banner trước'}
            >
              <ChevronLeft className={'h-4 w-4'} aria-hidden={true} />
            </Button>

            <Button
              type={'button'}
              variant={'secondary'}
              size={'icon'}
              className={'h-8 w-8 rounded-full'}
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? 'Tiếp tục tự động chuyển' : 'Dừng tự động chuyển'}
              aria-pressed={paused}
            >
              {paused ? (
                <Play className={'h-4 w-4'} aria-hidden={true} />
              ) : (
                <Pause className={'h-4 w-4'} aria-hidden={true} />
              )}
            </Button>

            <Button
              type={'button'}
              variant={'secondary'}
              size={'icon'}
              className={'h-8 w-8 rounded-full'}
              onClick={() => goTo(index + 1)}
              aria-label={'Banner tiếp theo'}
            >
              <ChevronRight className={'h-4 w-4'} aria-hidden={true} />
            </Button>
          </div>

          <div
            className={'absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5'}
            aria-hidden={true}
          >
            {banners.map((b, i) => (
              <span
                key={b.id}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50',
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
