import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { Plus, Search } from 'lucide-react';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';

import { PaginationNav } from '~/(marketing)/_components/pagination-nav';
import type { RecipeSchema } from '~/lib/recipes/database';

import { CategoryRowActions } from './_components/category-forms';

export const metadata: Metadata = {
  title: 'Quản lý danh mục',
};

export const instant = false;

const PER_PAGE = 8;

const DIMENSION_OPTIONS = [
  { value: 'all', label: 'Tất cả chiều' },
  { value: 'nhom-mon', label: 'Nhóm món' },
  { value: 'nguyen-lieu-chinh', label: 'Nguyên liệu chính' },
  { value: 'phuong-phap-che-bien', label: 'Phương pháp chế biến' },
  { value: 'bua-an', label: 'Bữa ăn' },
  { value: 'phong-cach-am-thuc', label: 'Phong cách ẩm thực' },
] as const;

function buildCategoriesHref({
  q,
  dimension,
  page = 1,
}: {
  q?: string;
  dimension?: string;
  page?: number;
}): string {
  const params = new URLSearchParams();

  if (q && q.trim()) {
    params.set('q', q.trim());
  }

  if (dimension && dimension !== 'all') {
    params.set('dimension', dimension);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  const queryString = params.toString();
  return queryString ? `/admin/danh-muc?${queryString}` : '/admin/danh-muc';
}

function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function escapeLike(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export default async function CategoriesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    dimension?: string;
  }>;
}) {
  // Trang admin đọc DB mỗi request, không prerender lúc build.
  await connection();

  const params = await searchParams;
  const page = parsePage(params.page);
  const q = (params.q ?? '').trim();
  const dimension = params.dimension ?? 'all';

  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const admin = getSupabaseServerAdminClient<RecipeSchema>();

  let query = admin
    .from('categories')
    .select('id,name,slug,description,dimension,image_url', { count: 'exact' });

  if (dimension && dimension !== 'all') {
    query = query.eq('dimension', dimension);
  }

  if (q) {
    const escaped = escapeLike(q);
    query = query.or(`name.ilike.%${escaped}%,slug.ilike.%${escaped}%`);
  }

  const { data, count, error } = await query
    .order('id', { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(`Không tải được danh mục: ${error.message}`);
  }

  const categories = data ?? [];
  const total = count ?? 0;
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className={'flex flex-col gap-6'}>
      <div className={'flex flex-wrap items-center justify-between gap-4'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>
            Quản lý danh mục
          </h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            Quản lý các nhóm phân loại món ăn ({total} danh mục). Danh mục còn công thức thì không xóa được.
          </p>
        </div>

        <Button
          nativeButton={false}
          className={'gap-1.5'}
          render={
            <Link href={'/admin/danh-muc/moi'}>
              <Plus className={'h-4 w-4'} />
              <span>Thêm danh mục mới</span>
            </Link>
          }
        />
      </div>

      <Card>
        <CardContent className={'p-4'}>
          <form method={'GET'} action={'/admin/danh-muc'} className={'flex flex-wrap items-center gap-3'}>
            <div className={'relative min-w-56 flex-1'}>
              <Search className={'text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2'} />
              <Input
                name={'q'}
                defaultValue={q}
                placeholder={'Tìm kiếm theo tên danh mục, slug...'}
                className={'pl-9 text-sm'}
              />
            </div>

            <div className={'w-auto'}>
              <select
                name={'dimension'}
                defaultValue={dimension}
                className={'border-input bg-background rounded-md border px-3 py-2 text-sm'}
              >
                {DIMENSION_OPTIONS.map((dim) => (
                  <option key={dim.value} value={dim.value}>
                    {dim.label}
                  </option>
                ))}
              </select>
            </div>

            <Button type={'submit'} variant={'secondary'} size={'sm'} className={'h-9'}>
              Tìm kiếm
            </Button>

            {(q || (dimension && dimension !== 'all')) && (
              <Button
                nativeButton={false}
                variant={'ghost'}
                size={'sm'}
                className={'h-9 text-xs text-muted-foreground'}
                render={<Link href={'/admin/danh-muc'}>Xóa bộ lọc</Link>}
              />
            )}
          </form>
        </CardContent>
      </Card>

      <div className={'grid grid-cols-1 gap-3 lg:grid-cols-2'}>
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className={'pb-3'}>
              <div className={'flex items-start justify-between gap-2'}>
                <div className={'flex items-center gap-3 min-w-0'}>
                  {category.image_url && (
                    <div
                      className={
                        'h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted'
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className={'h-full w-full object-cover'}
                      />
                    </div>
                  )}

                  <div className={'min-w-0'}>
                    <CardTitle className={'text-base'}>{category.name}</CardTitle>
                    {category.dimension && (
                      <span className={'text-muted-foreground text-xs'}>
                        {DIMENSION_OPTIONS.find((d) => d.value === category.dimension)?.label ?? category.dimension}
                      </span>
                    )}
                  </div>
                </div>

                <Badge variant={'secondary'} className={'font-mono text-xs'}>
                  {category.slug}
                </Badge>
              </div>

              {category.description && (
                <p className={'text-muted-foreground text-sm'}>
                  {category.description}
                </p>
              )}
            </CardHeader>

            <CardContent className={'pt-0'}>
              <CategoryRowActions category={category} />
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && (
          <Card className={'lg:col-span-2'}>
            <CardContent className={'py-10 text-center'}>
              <p className={'text-muted-foreground text-sm'}>
                {q || dimension !== 'all'
                  ? 'Không tìm thấy danh mục nào phù hợp với bộ lọc.'
                  : 'Chưa có danh mục nào. Hãy bấm "Thêm danh mục mới" ở trên để bắt đầu.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {totalPages > 1 && (
        <div className={'flex justify-center pt-2'}>
          <PaginationNav
            currentPage={page}
            totalPages={totalPages}
            buildHref={(p: number) =>
              buildCategoriesHref({
                q,
                dimension,
                page: p,
              })
            }
          />
        </div>
      )}
    </div>
  );
}
