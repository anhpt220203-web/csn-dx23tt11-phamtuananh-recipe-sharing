import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { ExternalLink, Star, User as UserIcon, Utensils } from 'lucide-react';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@kit/ui/card';

import { PaginationNav } from '~/(marketing)/_components/pagination-nav';
import type { RecipeSchema } from '~/lib/recipes/database';
import { resolveRecipeImageSrc } from '~/lib/recipes/images';

import { DeleteRatingButton } from './_components/delete-rating-button';

export const metadata: Metadata = {
  title: 'Kiểm duyệt đánh giá',
};

export const instant = false;

// 12 đánh giá/trang chia đều đẹp mắt cho cả lưới 2 cột và 3 cột
const PAGE_SIZE = 12;

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
  searchParams: Promise<{ page?: string }>;
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

  const rawPage = Number(params.page ?? '1');
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const admin = getSupabaseServerAdminClient<RecipeSchema>();

  const { data: ratings, count, error } = await admin
    .from('ratings')
    .select('id,user_id,recipe_id,rating,created_at,recipes(title,slug,image_url)', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(from, to);

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
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className={'flex flex-col gap-6'}>
      <div className={'flex flex-wrap items-center justify-between gap-4'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>
            Kiểm duyệt đánh giá
          </h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            Quản lý {total} lượt đánh giá món ăn từ cộng đồng — sắp xếp mới nhất trước.
          </p>
        </div>

        {total > 0 && (
          <span className={'text-xs font-medium text-muted-foreground'}>
            Trang {page} / {totalPages} ({rows.length} mục trên trang này)
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className={'py-12 text-center'}>
            <Star className={'mx-auto h-10 w-10 text-muted-foreground/30 mb-2'} />
            <p className={'text-muted-foreground text-sm font-medium'}>
              {total === 0
                ? 'Chưa có đánh giá nào từ người dùng.'
                : 'Trang này hiện chưa có dữ liệu, hãy quay lại trang trước.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Danh sách đánh giá dạng lưới (Grid 2 cột trên md, 3 cột trên lg/xl) */
        <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
          {rows.map((row) => (
            <Card
              key={row.id}
              className={'flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-sm transition-shadow'}
            >
              <CardHeader className={'p-4 pb-3 space-y-3 border-b border-border/40 bg-muted/10'}>
                {/* Thông tin món ăn: Ảnh bìa nhỏ + Tiêu đề món + Số sao */}
                <div className={'flex items-start gap-3 min-w-0'}>
                  {row.recipeImage ? (
                    <div className={'h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted'}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.recipeImage}
                        alt={row.recipeTitle}
                        className={'h-full w-full object-cover'}
                      />
                    </div>
                  ) : (
                    <div className={'flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted text-muted-foreground'}>
                      <Utensils className={'h-5 w-5'} />
                    </div>
                  )}

                  <div className={'min-w-0 flex-1 space-y-1'}>
                    <p className={'font-semibold text-sm leading-snug text-foreground line-clamp-1'} title={row.recipeTitle}>
                      {row.recipeTitle}
                    </p>

                    <div className={'flex items-center gap-1.5'}>
                      <Stars value={row.rating} />
                      <Badge variant={'secondary'} className={'h-4 px-1.5 text-[10px] font-mono'}>
                        {row.rating}/5
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className={'p-4 py-3 space-y-1.5 text-xs'}>
                {/* Thông tin người đánh giá */}
                <div className={'flex items-center gap-1.5 text-muted-foreground'}>
                  <UserIcon className={'h-3.5 w-3.5 shrink-0'} />
                  <span className={'truncate font-medium text-foreground'} title={row.userEmail}>
                    {row.userEmail}
                  </span>
                </div>

                {row.userName !== 'Chưa đặt tên' && (
                  <p className={'text-muted-foreground pl-5 truncate'}>
                    Tên: <span className={'text-foreground font-medium'}>{row.userName}</span>
                  </p>
                )}

                <p className={'text-[11px] text-muted-foreground pl-5'}>
                  Thời gian: {formatDateTime(row.created_at)}
                </p>
              </CardContent>

              {/* Nút thao tác: Đi đến công thức & Xóa đánh giá */}
              <CardFooter className={'p-4 pt-2 border-t border-border/40 flex items-center justify-between gap-2'}>
                {row.recipeSlug ? (
                  <Button
                    nativeButton={false}
                    variant={'outline'}
                    size={'sm'}
                    className={'h-8 gap-1.5 text-xs flex-1'}
                    render={
                      <Link
                        href={`/cong-thuc/${row.recipeSlug}`}
                        target={'_blank'}
                        rel={'noreferrer'}
                      >
                        <ExternalLink className={'h-3.5 w-3.5'} />
                        <span>Đi đến công thức</span>
                      </Link>
                    }
                  />
                ) : (
                  <span className={'text-xs text-muted-foreground italic'}>Món đã bị xóa</span>
                )}

                <DeleteRatingButton
                  id={row.id}
                  recipeTitle={row.recipeTitle}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={'flex justify-center pt-2'}>
          <PaginationNav
            currentPage={page}
            totalPages={totalPages}
            buildHref={(p: number) => `/admin/danh-gia?page=${p}`}
          />
        </div>
      )}
    </div>
  );
}
