import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { ExternalLink, Plus } from 'lucide-react';

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
import { resolveRecipeImageSrc } from '~/lib/recipes/images';
import { getCategories } from '~/lib/recipes/queries';

import { DeleteRecipeButton } from './_components/delete-recipe-button';
import { PreviewRecipeButton } from './_components/preview-recipe-modal';

export const metadata: Metadata = {
  title: 'Quản lý công thức',
};

export const instant = false;

const PER_PAGE = 8;

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
  page?: number;
};

/**
 * Dựng URL trang quản lý công thức, giữ lại các bộ lọc đang dùng và số trang.
 */
function buildRecipesHref({
  status,
  q,
  category,
  page = 1,
}: AdminRecipeParams): string {
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

  if (page > 1) {
    params.set('page', String(page));
  }

  const queryString = params.toString();

  return queryString ? `/admin/cong-thuc?${queryString}` : '/admin/cong-thuc';
}

function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
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
  searchParams: Promise<{
    status?: string;
    q?: string;
    category?: string;
    page?: string;
  }>;
}) {
  // Trang admin đọc DB mỗi request, không prerender lúc build.
  await connection();

  const {
    status: statusParam,
    q: qParam,
    category: categoryParam,
    page: pageParam,
  } = await searchParams;

  const statusFilter: StatusFilter =
    statusParam === 'published' || statusParam === 'draft'
      ? statusParam
      : 'all';

  const searchTerm = (qParam ?? '').trim();
  const page = parsePage(pageParam);

  const categories = await getCategories();

  const activeCategory =
    categories.find((category) => category.slug === categoryParam) ?? null;

  const admin = getSupabaseServerAdminClient<RecipeSchema>();

  let baseQuery = admin
    .from('recipes')
    .select(
      'id,title,slug,image_url,difficulty,cook_time,status,categories(name)',
      { count: 'exact' },
    )
    .order('id', { ascending: false });

  if (statusFilter !== 'all') {
    baseQuery = baseQuery.eq('status', statusFilter);
  }

  if (searchTerm) {
    baseQuery = baseQuery.ilike('title', `%${escapeLike(searchTerm)}%`);
  }

  if (activeCategory !== null) {
    baseQuery = baseQuery.eq('category_id', activeCategory.id);
  }

  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const { data, count, error } = await baseQuery.range(from, to);

  if (error) {
    throw new Error(`Không tải được công thức: ${error.message}`);
  }

  const recipes = data ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);

  // Nếu page trên URL vượt quá tổng số trang do người dùng xóa hoặc lọc
  if (page > totalPages && total > 0) {
    redirect(
      buildRecipesHref({
        status: statusFilter,
        q: searchTerm,
        category: activeCategory?.slug ?? null,
        page: totalPages,
      }),
    );
  }

  const hasActiveFilter =
    searchTerm !== '' || activeCategory !== null || statusFilter !== 'all';

  return (
    <div className={'flex flex-col gap-6'}>
      {/* Header trang & nút Thêm công thức */}
      <div className={'flex flex-wrap items-start justify-between gap-3'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>
            Quản lý công thức
          </h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            Tổng cộng {total} công thức trong hệ thống.
          </p>
        </div>

        <Button
          nativeButton={false}
          render={
            <Link href={'/admin/cong-thuc/moi'} className={'gap-1.5'}>
              <Plus className={'h-4 w-4'} />
              <span>Thêm công thức</span>
            </Link>
          }
        />
      </div>

      {/* Tabs lọc theo trạng thái */}
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
                page: 1,
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

      {/* Bộ lọc theo từ khóa và danh mục */}
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
                    status: 'all',
                    q: '',
                    category: null,
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

      {/* Danh sách công thức */}
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
        <div className={'flex flex-col gap-4'}>
          {total > 0 && (
            <div className={'flex items-center justify-between text-xs text-muted-foreground'}>
              <span>
                Hiển thị {from + 1}–{Math.min(to + 1, total)} trên tổng số {total} công thức
              </span>
            </div>
          )}

          <div className={'grid grid-cols-1 gap-3 lg:grid-cols-2'}>
            {recipes.map((recipe) => {
              const categoryName =
                (recipe.categories as { name?: string } | null)?.name ?? '—';

              return (
                <Card key={recipe.id} className={'hover:shadow-xs transition-shadow'}>
                  <CardHeader className={'pb-3'}>
                    <div className={'flex gap-3'}>
                      {recipe.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            resolveRecipeImageSrc(recipe.image_url) ??
                            recipe.image_url
                          }
                          alt={recipe.title}
                          className={'h-16 w-16 shrink-0 rounded-md object-cover border'}
                          loading={'lazy'}
                        />
                      ) : (
                        <div
                          className={
                            'bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded-md text-xs text-muted-foreground border'
                          }
                        >
                          Không ảnh
                        </div>
                      )}

                      <div className={'min-w-0 flex-1'}>
                        <CardTitle className={'truncate text-base'}>
                          {recipe.title}
                        </CardTitle>

                        <div className={'flex items-center gap-2 mt-0.5'}>
                          <CardDescription className={'truncate font-mono text-xs'}>
                            {recipe.slug}
                          </CardDescription>

                          <Link
                            href={`/cong-thuc/${recipe.slug}`}
                            target={'_blank'}
                            rel={'noopener noreferrer'}
                            className={
                              'inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium shrink-0'
                            }
                            title={`Xem trang công thức "${recipe.title}"`}
                          >
                            <span>Xem công thức</span>
                            <ExternalLink className={'h-3 w-3'} />
                          </Link>
                        </div>

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

                  <CardContent className={'flex items-center gap-2 pt-0'}>
                    <PreviewRecipeButton
                      recipe={{
                        id: recipe.id,
                        title: recipe.title,
                        slug: recipe.slug,
                        image_url: recipe.image_url,
                        difficulty: recipe.difficulty,
                        cook_time: recipe.cook_time,
                        status: recipe.status,
                        categoryName,
                      }}
                    />

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

          {/* Phân trang */}
          <div className={'pt-2'}>
            <PaginationNav
              currentPage={safePage}
              totalPages={totalPages}
              buildHref={(targetPage: number) =>
                buildRecipesHref({
                  status: statusFilter,
                  q: searchTerm,
                  category: activeCategory?.slug ?? null,
                  page: targetPage,
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
