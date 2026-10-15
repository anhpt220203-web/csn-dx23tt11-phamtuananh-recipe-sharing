'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Search } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { cn } from '@kit/ui/utils';

type HeaderSearchFormProps = {
  className?: string;
};

/**
 * Ô tìm kiếm gọn đặt trong header chung (FR3): gõ từ khóa rồi Enter
 * hoặc bấm nút để sang trang /tim-kiem. Giữ hành vi submit đơn giản,
 * không live-search.
 */
export function HeaderSearchForm({ className }: HeaderSearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    const params = new URLSearchParams();
    const trimmed = query.trim();

    if (trimmed) {
      params.set('q', trimmed);
    }

    router.push(`/tim-kiem?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      role={'search'}
      className={cn('flex w-full items-center gap-1.5', className)}
    >
      <div className={'relative min-w-0 flex-1'}>
        <Search
          className={
            'text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2'
          }
          aria-hidden={true}
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={'Tìm món ăn, nguyên liệu…'}
          aria-label={'Tìm kiếm công thức'}
          data-test={'header-search-input'}
          className={'h-9 w-full pl-8 text-sm'}
        />
      </div>

      <Button
        type={'submit'}
        size={'icon'}
        variant={'ghost'}
        className={'h-9 w-9 shrink-0'}
        aria-label={'Tìm kiếm'}
        data-test={'header-search-submit'}
      >
        <Search className={'h-4 w-4'} aria-hidden={true} />
      </Button>
    </form>
  );
}
