import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { ExternalLink, Layers, Plus, Utensils } from 'lucide-react';

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

  const [{ data, count, error }, { data: recipeCounts }] = await Promise.all([
    query.order('id', { ascending: true }).range(from, to),
    admin.from('recipes').select('category_id'),
  ]);

  if (error) {
    throw new Error(`Không tải được danh mục: ${error.message}`);
  }

  const countByCat = new Map<number, number>();
  (recipeCounts ?? []).forEach((r) => {
    countByCat.set(r.category_id, (countByCat.get(r.category_id) ?? 0) + 1);
  });

  const categories = data ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);

  if (page > totalPages && total > 0) {
    redirect(
      buildCategoriesHref({
        q,
        dimension,
        page: totalPages,
      }),
    );
  }

  const hasActiveFilter = q !== '' || dimension !== 'all';

  return (
    <div className={'flex flex-col gap-6'}>
      {/* Header trang & nút Thêm danh mục mới */}
      <div className={'flex flex-wrap items-start justify-between gap-3'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>
            Quản lý danh mục
          </h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            Tổng cộng {total} danh mục trong hệ thống. Danh mục còn công thức thì không xóa được.
          </p>
        </div>

        <Button
          nativeButton={false}
          className={'gap-1.5'}
          render={
            <Link href={'/admin/danh-muc/moi'}>
              <Plus className={'h-4 w-4'} />
              <span>Thêm danh mục</span>
            </Link>
          }
        />
      </div>

      {/* Tabs lọc theo chiều phân loại */}
      <div className={'flex flex-wrap gap-2'}>
        {DIMENSION_OPTIONS.map((dim) => {
          const active = dimension === dim.value;

          return (
            <Link
              key={dim.value}
              href={buildCategoriesHref({
                dimension: dim.value,
                q,
                page: 1,
              })}
              aria-current={active ? 'page' : undefined}
              className={
                active
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm font-medium'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-3 py-1.5 text-sm font-medium'
              }
            >
              {dim.label}
            </Link>
          );
        })}
      </div>

      {/* Bộ lọc theo từ khóa */}
      <form
        action={'/admin/danh-muc'}
        method={'GET'}
        role={'search'}
        className={'flex flex-col gap-2 sm:flex-row sm:items-end'}
      >
        {dimension !== 'all' && (
          <input type={'hidden'} name={'dimension'} value={dimension} />
        )}

        <div className={'flex-1'}>
          <label
            htmlFor={'admin-category-search'}
            className={'mb-1 block text-xs font-medium'}
          >
            Tìm kiếm theo tên hoặc slug
          </label>

          <Input
            id={'admin-category-search'}
            name={'q'}
            type={'search'}
            defaultValue={q}
            placeholder={'Nhập tên danh mục, slug…'}
            className={'max-w-md'}
          />
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
                  href={buildCategoriesHref({
                    dimension: 'all',
                    q: '',
                    page: 1,
                  })}
                >
                  Xoá lọc
                </Link>
              }
            />
          )}
        </div>
      </form>

      {/* Danh sách danh mục */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className={'py-10 text-center'}>
            <p className={'text-muted-foreground text-sm'}>
              {hasActiveFilter
                ? 'Không tìm thấy danh mục nào với bộ lọc hiện tại.'
                : 'Chưa có danh mục nào. Hãy thêm danh mục đầu tiên.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={'flex flex-col gap-4'}>
          {total > 0 && (
            <div className={'flex items-center justify-between text-xs text-muted-foreground'}>
              <span>
                Hiển thị {from + 1}–{Math.min(to + 1, total)} trên tổng số {total} danh mục
              </span>
            </div>
          )}

          <div className={'grid grid-cols-1 gap-3 lg:grid-cols-2'}>
            {categories.map((category) => {
              const recipeCount = countByCat.get(category.id) ?? 0;

              return (
                <Card key={category.id} className={'hover:shadow-xs transition-shadow'}>
                  <CardHeader className={'pb-3'}>
                    <div className={'flex gap-3'}>
                      {category.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className={'h-16 w-16 shrink-0 rounded-md object-cover border'}
                          loading={'lazy'}
                        />
                      ) : (
                        <div
                          className={
                            'bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded-md text-xs text-muted-foreground border'
                          }
                        >
                          <Layers className={'h-6 w-6'} />
                        </div>
                      )}

                      <div className={'min-w-0 flex-1'}>
                        <CardTitle className={'truncate text-base'}>
                          {category.name}
                        </CardTitle>

                        <div className={'flex items-center gap-2 mt-0.5'}>
                          <CardDescription className={'truncate font-mono text-xs'}>
                            {category.slug}
                          </CardDescription>

                          <Link
                            href={`/danh-muc/${category.slug}`}
                            target={'_blank'}
                            rel={'noopener noreferrer'}
                            className={
                              'inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium shrink-0'
                            }
                            title={`Xem trang danh mục "${category.name}"`}
                          >
                            <span>Xem danh mục</span>
                            <ExternalLink className={'h-3 w-3'} />
                          </Link>
                        </div>

                        <div className={'mt-1.5 flex flex-wrap items-center gap-1.5'}>
                          <Badge variant={'secondary'}>
                            {DIMENSION_OPTIONS.find((d) => d.value === category.dimension)?.label ?? category.dimension}
                          </Badge>

                          <Badge variant={recipeCount > 0 ? 'default' : 'outline'}>
                            {recipeCount} món
                          </Badge>

                          <Link
                            href={`/admin/cong-thuc?category=${category.slug}`}
                            className={
                              'inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline ml-1'
                            }
                            title={`Xem tất cả công thức thuộc danh mục ${category.name}`}
                          >
                            <Utensils className={'h-3 w-3 text-primary'} />
                            <span>Xem list ({recipeCount})</span>
                          </Link>
                        </div>

                        {category.description && (
                          <p className={'text-muted-foreground text-xs line-clamp-1 mt-1.5'}>
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className={'pt-0'}>
                    <CategoryRowActions category={category} />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Phân trang */}
          <div className={'pt-2'}>
            <PaginationNav
              currentPage={safePage}
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
        </div>
      )}
    </div>
  );
}
