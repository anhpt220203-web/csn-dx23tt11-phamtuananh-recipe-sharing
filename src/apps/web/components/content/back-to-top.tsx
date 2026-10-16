'use client';

import { useEffect, useState } from 'react';

import { ArrowUp } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';

const SHOW_AFTER_PX = 400;

/**
 * Nút "về đầu trang" trôi nổi góc phải dưới, hiện khi cuộn xuống.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <Button
      type={'button'}
      size={'icon'}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={'Về đầu trang'}
      className={cn(
        'fixed right-4 bottom-4 z-50 h-10 w-10 rounded-full shadow-lg transition-all',
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <ArrowUp className={'h-5 w-5'} aria-hidden={true} />
    </Button>
  );
}
