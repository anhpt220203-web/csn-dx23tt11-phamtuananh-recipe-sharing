import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { ExternalLink, Layers, Plus, Search, Utensils } from 'lucide-react';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@kit/ui/card';
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

      {/* Cụm thống nhất: Gộp bộ lọc, tìm kiếm và danh sách danh mục trong 1 Card */}
      <Card className={'shadow-xs'}>
        <CardHeader className={'space-y-4 border-b border-border/50 pb-5'}>
          <div className={'flex flex-wrap items-center justify-between gap-2'}>
            <CardTitle className={'text-base font-semibold flex items-center gap-2'}>
              <Layers className={'h-4 w-4 text-primary'} />
              <span>Danh sách danh mục ({total})</span>
            </CardTitle>

            {total > 0 && (
              <span className={'text-xs text-muted-foreground'}>
                Trang {page} / {Math.max(1, totalPages)}
              </span>
            )}
          </div>

          {/* Thanh công cụ tìm kiếm và lọc dimension */}
          <form
            method={'GET'}
            action={'/admin/danh-muc'}
            className={'flex flex-wrap items-center gap-3'}
          >
            <div className={'relative min-w-56 flex-1'}>
              <Search className={'text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2'} />
              <Input
                name={'q'}
                defaultValue={q}
                placeholder={'Tìm kiếm theo tên danh mục, slug...'}
                className={'h-8 pl-8 text-xs'}
              />
            </div>

            <div className={'w-auto'}>
              <select
                name={'dimension'}
                defaultValue={dimension}
                className={'border-input bg-background rounded-md border px-3 py-1.5 text-xs h-8'}
              >
                {DIMENSION_OPTIONS.map((dim) => (
                  <option key={dim.value} value={dim.value}>
                    {dim.label}
                  </option>
                ))}
              </select>
            </div>

            <Button type={'submit'} variant={'secondary'} size={'sm'} className={'h-8 text-xs'}>
              Tìm kiếm
            </Button>

            {(q || (dimension && dimension !== 'all')) && (
              <Button
                nativeButton={false}
                variant={'ghost'}
                size={'sm'}
                className={'h-8 text-xs text-muted-foreground'}
                render={<Link href={'/admin/danh-muc'}>Xóa bộ lọc</Link>}
              />
            )}
          </form>
        </CardHeader>

        <CardContent className={'pt-5'}>
          {categories.length === 0 ? (
            <div className={'py-12 text-center'}>
              <Layers className={'mx-auto h-10 w-10 text-muted-foreground/30 mb-2'} />
              <p className={'text-muted-foreground text-sm font-medium'}>
                {q || dimension !== 'all'
                  ? 'Không tìm thấy danh mục nào phù hợp với bộ lọc.'
                  : 'Chưa có danh mục nào. Hãy bấm "Thêm danh mục mới" ở trên để bắt đầu.'}
              </p>
            </div>
          ) : (
            /* Danh sách danh mục dạng lưới 2 cột */
            <div className={'grid grid-cols-1 gap-4 lg:grid-cols-2'}>
              {categories.map((category) => {
                const recipeCount = countByCat.get(category.id) ?? 0;

                return (
                  <Card
                    key={category.id}
                    className={'flex flex-col justify-between overflow-hidden border-border/70 shadow-xs hover:shadow-sm transition-shadow'}
                  >
                    <CardHeader className={'p-4 pb-3 space-y-2.5'}>
                      <div className={'flex items-start justify-between gap-3'}>
                        <div className={'flex items-center gap-3 min-w-0'}>
                          {category.image_url ? (
                            <div
                              className={
                                'h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted'
                              }
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={category.image_url}
                                alt={category.name}
                                className={'h-full w-full object-cover'}
                              />
                            </div>
                          ) : (
                            <div className={'flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted text-muted-foreground'}>
                              <Layers className={'h-5 w-5'} />
                            </div>
                          )}

                          <div className={'min-w-0'}>
                            <CardTitle className={'text-base font-semibold leading-snug line-clamp-1'}>
                              {category.name}
                            </CardTitle>

                            <div className={'flex flex-wrap items-center gap-1.5 mt-1'}>
                              <Badge variant={'secondary'} className={'font-mono text-[10px] h-4 px-1.5'}>
                                {category.slug}
                              </Badge>

                              {category.dimension && (
                                <span className={'text-muted-foreground text-xs'}>
                                  · {DIMENSION_OPTIONS.find((d) => d.value === category.dimension)?.label ?? category.dimension}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Badge
                          variant={recipeCount > 0 ? 'default' : 'outline'}
                          className={'text-[11px] shrink-0 h-5 px-2'}
                        >
                          {recipeCount} món
                        </Badge>
                      </div>

                      {category.description && (
                        <p className={'text-muted-foreground text-xs leading-relaxed line-clamp-2'}>
                          {category.description}
                        </p>
                      )}
                    </CardHeader>

                    {/* Footer chứa nút "Xem danh mục", "Xem list công thức" và hành động Sửa/Xóa */}
                    <CardFooter className={'p-4 pt-3 border-t border-border/40 bg-muted/10 flex flex-col gap-2.5'}>
                      <div className={'flex flex-wrap items-center gap-2 w-full'}>
                        {/* Nút xem danh mục công khai */}
                        <Button
                          nativeButton={false}
                          variant={'outline'}
                          size={'sm'}
                          className={'h-8 gap-1.5 text-xs flex-1 min-w-32'}
                          render={
                            <Link
                              href={`/danh-muc/${category.slug}`}
                              target={'_blank'}
                              rel={'noreferrer'}
                              title={`Xem trang danh mục ${category.name} công khai`}
                            >
                              <ExternalLink className={'h-3.5 w-3.5'} />
                              <span>Xem danh mục</span>
                            </Link>
                          }
                        />

                        {/* Nút xem list công thức trong danh mục */}
                        <Button
                          nativeButton={false}
                          variant={'outline'}
                          size={'sm'}
                          className={'h-8 gap-1.5 text-xs flex-1 min-w-36'}
                          render={
                            <Link
                              href={`/admin/cong-thuc?category=${category.slug}`}
                              title={`Xem tất cả công thức thuộc danh mục ${category.name}`}
                            >
                              <Utensils className={'h-3.5 w-3.5 text-primary'} />
                              <span>Xem list công thức ({recipeCount})</span>
                            </Link>
                          }
                        />
                      </div>

                      {/* Các thao tác Sửa / Xóa */}
                      <div className={'w-full pt-1 border-t border-border/30'}>
                        <CategoryRowActions category={category} />
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>

        {totalPages > 1 && (
          <CardFooter className={'border-t border-border/40 pt-4 flex justify-center'}>
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
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
