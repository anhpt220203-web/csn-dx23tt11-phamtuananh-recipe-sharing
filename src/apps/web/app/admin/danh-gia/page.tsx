import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { ExternalLink, Star, User as UserIcon, Utensils } from 'lucide-react';

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

import { PaginationNav } from '~/(marketing)/_components/pagination-nav';
import type { RecipeSchema } from '~/lib/recipes/database';
import { resolveRecipeImageSrc } from '~/lib/recipes/images';

import { DeleteRatingButton } from './_components/delete-rating-button';

export const metadata: Metadata = {
  title: 'Quản lý đánh giá',
};

export const instant = false;

const PER_PAGE = 8;

const RATING_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: '5', label: '5 sao ★★★★★' },
  { value: '4', label: '4 sao ★★★★' },
  { value: '3', label: '3 sao ★★★' },
  { value: '2', label: '2 sao ★★' },
  { value: '1', label: '1 sao ★' },
] as const;

type RatingFilter = (typeof RATING_FILTERS)[number]['value'];

function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function buildRatingsHref({
  rating = 'all',
  page = 1,
}: {
  rating?: RatingFilter;
  page?: number;
}): string {
  const params = new URLSearchParams();

  if (rating !== 'all') {
    params.set('rating', rating);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  const queryString = params.toString();
  return queryString ? `/admin/danh-gia?${queryString}` : '/admin/danh-gia';
}

function getDisplayName(user: User): string {
  const meta = user.user_metadata ?? {};

  const name =
    meta['name'] ?? meta['full_name'] ?? meta['display_name'] ?? meta['ten'];

  return typeof name === 'string' && name.trim().length > 0
    ? name
    : 'Chưa đặt tên';
}

function formatDateTime(value: string | undefined): string {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Stars({ value }: { value: number }) {
  return (
    <span
      className={'text-sm leading-none tracking-wide inline-flex items-center'}
      aria-label={`${value} trên 5 sao`}
      role={'img'}
    >
      <span className={'text-amber-500 font-bold'}>{'★'.repeat(value)}</span>
      <span className={'text-muted-foreground/30'}>{'★'.repeat(5 - value)}</span>
    </span>
  );
}

type RatingsPageProps = {
  searchParams: Promise<{ rating?: string; page?: string }>;
};

type RecipeRelation = {
  title?: string;
  slug?: string;
  image_url?: string | null;
};

export default async function RatingsAdminPage({
  searchParams,
}: RatingsPageProps) {
  // Trang admin đọc DB mỗi request, không prerender lúc build.
  await connection();

  const params = await searchParams;
  const page = parsePage(params.page);
  const ratingFilter: RatingFilter =
    params.rating && ['1', '2', '3', '4', '5'].includes(params.rating)
      ? (params.rating as RatingFilter)
      : 'all';

  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const admin = getSupabaseServerAdminClient<RecipeSchema>();

  let query = admin
    .from('ratings')
    .select('id,user_id,recipe_id,rating,created_at,recipes(title,slug,image_url)', {
      count: 'exact',
    })
    .order('created_at', { ascending: false });

  if (ratingFilter !== 'all') {
    query = query.eq('rating', Number.parseInt(ratingFilter, 10));
  }

  const { data: ratings, count, error } = await query.range(from, to);

  if (error) {
    throw new Error(`Không tải được danh sách đánh giá: ${error.message}`);
  }

  // Lấy email + tên người đánh giá qua Auth Admin API (song song).
  const userIds = [...new Set((ratings ?? []).map((r) => r.user_id))];

  const userById = new Map<string, User>();

  await Promise.all(
    userIds.map(async (userId) => {
      const { data } = await admin.auth.admin.getUserById(userId);

      if (data?.user) {
        userById.set(userId, data.user);
      }
    }),
  );

  const rows = (ratings ?? []).map((rating) => {
    const rel = (rating.recipes as unknown as RecipeRelation) ?? null;
    const recipeTitle = rel?.title ?? 'Công thức đã xóa';
    const recipeSlug = rel?.slug ?? '';
    const recipeImage = rel?.image_url
      ? (resolveRecipeImageSrc(rel.image_url) ?? rel.image_url)
      : null;
    const user = userById.get(rating.user_id);

    return {
      ...rating,
      recipeTitle,
      recipeSlug,
      recipeImage,
      userEmail: user?.email ?? '(không có email)',
      userName: user ? getDisplayName(user) : 'Tài khoản đã xóa',
    };
  });

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);

  if (page > totalPages && total > 0) {
    redirect(
      buildRatingsHref({
        rating: ratingFilter,
        page: totalPages,
      }),
    );
  }

  const hasActiveFilter = ratingFilter !== 'all';

  return (
    <div className={'flex flex-col gap-6'}>
      {/* Header trang */}
      <div className={'flex flex-wrap items-start justify-between gap-3'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>
            Quản lý đánh giá
          </h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            Tổng cộng {total} đánh giá trong hệ thống. Theo dõi phản hồi và mức độ hài lòng của người dùng về các món ăn.
          </p>
        </div>
      </div>

      {/* Tabs lọc theo số sao */}
      <div className={'flex flex-wrap items-center gap-2'}>
        <div className={'flex flex-wrap gap-2'}>
          {RATING_FILTERS.map((filter) => {
            const active = ratingFilter === filter.value;

            return (
              <Link
                key={filter.value}
                href={buildRatingsHref({
                  rating: filter.value,
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

        {hasActiveFilter && (
          <Button
            nativeButton={false}
            size={'sm'}
            variant={'outline'}
            render={
              <Link href={'/admin/danh-gia'}>
                Xoá lọc
              </Link>
            }
          />
        )}
      </div>

      {/* Danh sách đánh giá */}
      {rows.length === 0 ? (
        <Card>
          <CardContent className={'py-10 text-center'}>
            <Star className={'mx-auto h-10 w-10 text-muted-foreground/30 mb-2'} />
            <p className={'text-muted-foreground text-sm'}>
              {hasActiveFilter
                ? 'Không tìm thấy đánh giá nào với bộ lọc hiện tại.'
                : 'Chưa có đánh giá nào từ người dùng.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={'flex flex-col gap-4'}>
          {total > 0 && (
            <div className={'flex items-center justify-between text-xs text-muted-foreground'}>
              <span>
                Hiển thị {from + 1}–{Math.min(to + 1, total)} trên tổng số {total} đánh giá
              </span>
            </div>
          )}

          <div className={'grid grid-cols-1 gap-3 lg:grid-cols-2'}>
            {rows.map((row) => (
              <Card key={row.id} className={'hover:shadow-xs transition-shadow'}>
                <CardHeader className={'pb-3'}>
                  <div className={'flex gap-3'}>
                    {row.recipeImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.recipeImage}
                        alt={row.recipeTitle}
                        className={'h-16 w-16 shrink-0 rounded-md object-cover border'}
                        loading={'lazy'}
                      />
                    ) : (
                      <div
                        className={
                          'bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded-md text-xs text-muted-foreground border'
                        }
                      >
                        <Utensils className={'h-6 w-6'} />
                      </div>
                    )}

                    <div className={'min-w-0 flex-1'}>
                      <CardTitle className={'truncate text-base'} title={row.recipeTitle}>
                        {row.recipeTitle}
                      </CardTitle>

                      <div className={'flex items-center gap-2 mt-0.5'}>
                        <Stars value={row.rating} />
                        <Badge variant={'secondary'} className={'h-4 px-1.5 text-[10px] font-mono'}>
                          {row.rating}/5 sao
                        </Badge>
                      </div>

                      <div className={'mt-1.5 flex flex-col gap-0.5 text-xs text-muted-foreground'}>
                        <div className={'flex items-center gap-1.5'}>
                          <UserIcon className={'h-3.5 w-3.5 shrink-0'} />
                          <span className={'truncate font-medium text-foreground'} title={row.userEmail}>
                            {row.userEmail}
                            {row.userName !== 'Chưa đặt tên' ? ` (${row.userName})` : ''}
                          </span>
                        </div>
                        <span className={'text-[11px]'}>Thời gian: {formatDateTime(row.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className={'flex items-center gap-2 pt-0'}>
                  {row.recipeSlug ? (
                    <Button
                      nativeButton={false}
                      variant={'outline'}
                      size={'sm'}
                      className={'gap-1.5'}
                      render={
                        <Link
                          href={`/cong-thuc/${row.recipeSlug}`}
                          target={'_blank'}
                          rel={'noopener noreferrer'}
                        >
                          <ExternalLink className={'h-3.5 w-3.5'} />
                          <span>Đi đến công thức</span>
                        </Link>
                      }
                    />
                  ) : null}

                  <DeleteRatingButton id={row.id} recipeTitle={row.recipeTitle} />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Phân trang */}
          <div className={'pt-2'}>
            <PaginationNav
              currentPage={safePage}
              totalPages={totalPages}
              buildHref={(targetPage: number) =>
                buildRatingsHref({
                  rating: ratingFilter,
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
