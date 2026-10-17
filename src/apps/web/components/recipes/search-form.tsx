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
import type { SearchSort } from '~/lib/recipes/queries';

type SearchFormProps = {
  categories: CategoryRow[];
  defaultQuery?: string;
  defaultCategory?: string;
  defaultSort?: SearchSort;
};

const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: 'moi-nhat', label: 'Mới nhất' },
  { value: 'danh-gia-cao', label: 'Đánh giá cao nhất' },
];

/**
 * Map value → nhãn cho Select của Base UI: không có `items` thì trigger
 * khi đóng hiển thị raw value ("all", "moi-nhat") thay vì nhãn tiếng Việt.
 */
const CATEGORY_ITEMS = (categories: CategoryRow[]) => [
  { value: 'all', label: 'Tất cả nhóm món' },
  ...categories.map((category) => ({ value: category.slug, label: category.name })),
];

/**
 * Form tìm kiếm: gửi query param `q`, `category` và `sort` tới route /tim-kiem.
 */
export function SearchForm({
  categories,
  defaultQuery = '',
  defaultCategory = 'all',
  defaultSort = 'moi-nhat',
}: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [category, setCategory] = useState(defaultCategory);
  const [sort, setSort] = useState<SearchSort>(defaultSort);

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

    if (sort !== 'moi-nhat') {
      params.set('sort', sort);
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

      <Select
        value={category}
        onValueChange={(value) => setCategory(value ?? 'all')}
        items={CATEGORY_ITEMS(categories)}
      >
        <SelectTrigger
          className={'w-full sm:w-44'}
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

      <Select
        value={sort}
        onValueChange={(value) =>
          setSort(value === 'danh-gia-cao' ? 'danh-gia-cao' : 'moi-nhat')
        }
        items={SORT_OPTIONS}
      >
        <SelectTrigger
          className={'w-full sm:w-44'}
          aria-label={'Sắp xếp kết quả'}
          data-test={'search-sort-select'}
        >
          <SelectValue placeholder={'Sắp xếp'} />
        </SelectTrigger>

        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
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
