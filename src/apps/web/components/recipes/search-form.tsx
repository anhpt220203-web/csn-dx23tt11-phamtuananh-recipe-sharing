'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Search } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

import type { CategoryRow } from '~/lib/recipes/database';

type SearchFormProps = {
  categories: CategoryRow[];
  defaultQuery?: string;
  defaultCategory?: string;
};

/**
 * Form tìm kiếm: gửi query param `q` và `category` tới route /tim-kiem.
 */
export function SearchForm({
  categories,
  defaultQuery = '',
  defaultCategory = 'all',
}: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [category, setCategory] = useState(defaultCategory);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    const params = new URLSearchParams();
    const trimmed = query.trim();

    if (trimmed) {
      params.set('q', trimmed);
    }

    if (category && category !== 'all') {
      params.set('category', category);
    }

    router.push(`/tim-kiem?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      role={'search'}
      className={'flex w-full flex-col gap-2 sm:flex-row'}
    >
      <div className={'relative flex-1'}>
        <Search
          className={
            'text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2'
          }
          aria-hidden={true}
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={'Tìm món ăn, nguyên liệu… (ví dụ: phở bò, thịt heo)'}
          aria-label={'Từ khóa tìm kiếm'}
          className={'pl-9'}
        />
      </div>

      <Select value={category} onValueChange={(value) => setCategory(value ?? 'all')}>
        <SelectTrigger
          className={'w-full sm:w-52'}
          aria-label={'Lọc theo nhóm món'}
        >
          <SelectValue placeholder={'Tất cả nhóm món'} />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={'all'}>Tất cả nhóm món</SelectItem>

          {categories.map((item) => (
            <SelectItem key={item.slug} value={item.slug}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type={'submit'} className={'w-full sm:w-auto'}>
        Tìm kiếm
      </Button>
    </form>
  );
}
