import type { Metadata } from 'next';
import Link from 'next/link';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Input } from '@kit/ui/input';

import type { RecipeSchema } from '~/lib/recipes/database';
import { getCategories } from '~/lib/recipes/queries';

import { DeleteRecipeButton } from './_components/delete-recipe-button';

export const metadata: Metadata = {
  title: 'Quản lý công thức',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'draft', label: 'Nháp' },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]['value'];

type AdminRecipeParams = {
  status: StatusFilter;
  q: string;
  category: string | null;
};

/**
 * Dựng URL trang quản lý công thức, giữ lại các bộ lọc đang dùng.
 */
function buildRecipesHref({ status, q, category }: AdminRecipeParams): string {
  const params = new URLSearchParams();

  if (status !== 'all') {
    params.set('status', status);
  }

  const trimmed = q.trim();

  if (trimmed) {
    params.set('q', trimmed);
  }

  if (category) {
    params.set('category', category);
  }

  const queryString = params.toString();

  return queryString ? `/admin/cong-thuc?${queryString}` : '/admin/cong-thuc';
}

/**
 * Escape ký tự đặc biệt của LIKE để từ khoá tìm kiếm của admin
 * không bị hiểu nhầm thành wildcard.
 */
function escapeLike(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export default async function RecipesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; category?: string }>;
}) {
  const { status: statusParam, q: qParam, category: categoryParam } =
    await searchParams;

  const statusFilter: StatusFilter =
    statusParam === 'published' || statusParam === 'draft'
      ? statusParam
      : 'all';

  const searchTerm = (qParam ?? '').trim();

  const categories = await getCategories();

  const activeCategory =
    categories.find((category) => category.slug === categoryParam) ?? null;

  const admin = getSupabaseServerAdminClient<RecipeSchema>();

  const baseQuery = admin
    .from('recipes')
    .select(
      'id,title,slug,image_url,difficulty,cook_time,status,categories(name)',
    )
    .order('id', { ascending: false })
    .limit(200);

  const statusQuery =
    statusFilter === 'all' ? baseQuery : baseQuery.eq('status', statusFilter);

  const searchQuery = searchTerm
    ? statusQuery.ilike('title', `%${escapeLike(searchTerm)}%`)
    : statusQuery;

  const filteredQuery =
    activeCategory !== null
      ? searchQuery.eq('category_id', activeCategory.id)
      : searchQuery;

  const { data, error } = await filteredQuery;

  if (error) {
    throw new Error(`Không tải được công thức: ${error.message}`);
  }

  const recipes = data ?? [];

  const hasActiveFilter = searchTerm !== '' || activeCategory !== null;

  return (
    <div className={'flex flex-col gap-6'}>
      <div className={'flex flex-wrap items-start justify-between gap-3'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>
            Quản lý công thức
          </h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            {recipes.length} công thức (hiển thị tối đa 200).
          </p>
        </div>

        <Button nativeButton={false} render={<Link href={'/admin/cong-thuc/moi'}>Thêm công thức</Link>} />
      </div>

      <div className={'flex flex-wrap gap-2'}>
        {STATUS_FILTERS.map((filter) => {
          const active = statusFilter === filter.value;

          return (
            <Link
              key={filter.value}
              href={buildRecipesHref({
                status: filter.value,
                q: searchTerm,
                category: activeCategory?.slug ?? null,
              })}
              aria-current={active ? 'page' : undefined}
              className={
                active
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm font-medium'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-3 py-1.5 text-sm font-medium'
              }
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <form
        action={'/admin/cong-thuc'}
        method={'GET'}
        role={'search'}
        className={'flex flex-col gap-2 sm:flex-row sm:items-end'}
      >
        <input type={'hidden'} name={'status'} value={statusFilter} />

        <div className={'flex-1'}>
          <label
            htmlFor={'admin-recipe-search'}
            className={'mb-1 block text-xs font-medium'}
          >
            Tìm kiếm theo tên món
          </label>

          <Input
            id={'admin-recipe-search'}
            name={'q'}
            type={'search'}
            defaultValue={searchTerm}
            placeholder={'Nhập tên món…'}
            className={'max-w-md'}
          />
        </div>

        <div>
          <label
            htmlFor={'admin-recipe-category'}
            className={'mb-1 block text-xs font-medium'}
          >
            Danh mục
          </label>

          <select
            id={'admin-recipe-category'}
            name={'category'}
            defaultValue={activeCategory?.slug ?? ''}
            className={
              'border-input bg-transparent h-8 rounded-lg border px-2.5 text-sm outline-none'
            }
          >
            <option value={''}>Tất cả danh mục</option>

            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className={'flex gap-2'}>
          <Button type={'submit'} size={'sm'}>
            Lọc
          </Button>

          {hasActiveFilter && (
            <Button
              nativeButton={false}
              size={'sm'}
              variant={'outline'}
              render={
                <Link
                  href={buildRecipesHref({
                    status: statusFilter,
                    q: '',
                    category: null,
                  })}
                >
                  Xoá lọc
                </Link>
              }
            />
          )}
        </div>
      </form>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className={'py-10 text-center'}>
            <p className={'text-muted-foreground text-sm'}>
              {hasActiveFilter
                ? 'Không tìm thấy công thức nào với bộ lọc hiện tại.'
                : 'Chưa có công thức nào. Hãy thêm công thức đầu tiên.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={'grid grid-cols-1 gap-3 lg:grid-cols-2'}>
          {recipes.map((recipe) => {
            const categoryName =
              (recipe.categories as { name?: string } | null)?.name ?? '—';

            return (
              <Card key={recipe.id}>
                <CardHeader className={'pb-3'}>
                  <div className={'flex gap-3'}>
                    {recipe.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className={'h-16 w-16 shrink-0 rounded-md object-cover'}
                        loading={'lazy'}
                      />
                    ) : (
                      <div
                        className={
                          'bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded-md text-xs text-muted-foreground'
                        }
                      >
                        Không ảnh
                      </div>
                    )}

                    <div className={'min-w-0 flex-1'}>
                      <CardTitle className={'truncate text-base'}>
                        {recipe.title}
                      </CardTitle>

                      <CardDescription className={'truncate font-mono text-xs'}>
                        {recipe.slug}
                      </CardDescription>

                      <div className={'mt-1.5 flex flex-wrap gap-1'}>
                        <Badge
                          variant={
                            recipe.status === 'draft'
                              ? 'secondary'
                              : 'default'
                          }
                        >
                          {recipe.status === 'draft' ? 'Nháp' : 'Đã xuất bản'}
                        </Badge>

                        <Badge variant={'secondary'}>{categoryName}</Badge>

                        {recipe.difficulty && (
                          <Badge variant={'outline'}>{recipe.difficulty}</Badge>
                        )}

                        {recipe.cook_time !== null && (
                          <Badge variant={'outline'}>
                            {recipe.cook_time} phút
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className={'flex gap-2 pt-0'}>
                  <Button
                    nativeButton={false}
                    size={'sm'}
                    variant={'outline'}
                    render={
                      <Link href={`/admin/cong-thuc/${recipe.id}/sua`}>
                        Sửa
                      </Link>
                    }
                  />

                  <DeleteRecipeButton id={recipe.id} title={recipe.title} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
