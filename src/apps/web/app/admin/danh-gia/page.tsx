import type { Metadata } from 'next';
import { connection } from 'next/server';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';

import type { RecipeSchema } from '~/lib/recipes/database';

import { DeleteRatingButton } from './_components/delete-rating-button';

export const metadata: Metadata = {
  title: 'Kiểm duyệt đánh giá',
};

export const instant = false;

const PAGE_SIZE = 20;

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
      className={'text-base leading-none tracking-wide'}
      aria-label={`${value} trên 5 sao`}
      role={'img'}
    >
      <span className={'text-amber-500'}>{'★'.repeat(value)}</span>
      <span className={'text-muted-foreground/50'}>{'★'.repeat(5 - value)}</span>
    </span>
  );
}

type RatingsPageProps = {
  searchParams: Promise<{ page?: string }>;
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
    .select('id,user_id,recipe_id,rating,created_at,recipes(title)', {
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
    const recipeTitle =
      (rating.recipes as { title?: string } | null)?.title ?? '—';
    const user = userById.get(rating.user_id);

    return {
      ...rating,
      recipeTitle,
      userEmail: user?.email ?? '(không có email)',
      userName: user ? getDisplayName(user) : 'Tài khoản đã xóa',
    };
  });

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className={'flex flex-col gap-6'}>
      <div>
        <h1 className={'text-2xl font-bold tracking-tight'}>
          Kiểm duyệt đánh giá
        </h1>

        <p className={'text-muted-foreground mt-1 text-sm'}>
          {total} lượt đánh giá — sắp xếp mới nhất trước. Xóa đánh giá vi phạm
          hoặc spam sau khi xác nhận.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className={'py-10 text-center'}>
            <p className={'text-muted-foreground text-sm'}>
              {total === 0
                ? 'Chưa có đánh giá nào.'
                : 'Trang này trống, hãy quay lại trang trước.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={'flex flex-col gap-3'}>
          {rows.map((row) => (
            <Card key={row.id}>
              <CardContent className={'py-4'}>
                <div
                  className={
                    'flex flex-wrap items-start justify-between gap-3'
                  }
                >
                  <div className={'min-w-0 flex-1'}>
                    <p className={'truncate text-base font-semibold'}>
                      {row.recipeTitle}
                    </p>

                    <div className={'mt-1 flex flex-wrap items-center gap-2'}>
                      <Stars value={row.rating} />

                      <span className={'text-muted-foreground text-sm'}>
                        {row.rating}/5
                      </span>
                    </div>

                    <p className={'text-muted-foreground mt-1 truncate text-sm'}>
                      {row.userEmail}
                      {row.userName !== 'Chưa đặt tên' &&
                        ` (${row.userName})`}
                    </p>

                    <p className={'text-muted-foreground text-xs'}>
                      Đánh giá lúc {formatDateTime(row.created_at)}
                    </p>
                  </div>

                  <DeleteRatingButton
                    id={row.id}
                    recipeTitle={row.recipeTitle}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div
          className={'flex items-center justify-center gap-3 text-sm'}
          aria-label={'Phân trang'}
        >
          {page > 1 ? (
            <Button
              nativeButton={false}
              variant={'outline'}
              size={'sm'}
              render={<Link href={`/admin/danh-gia?page=${page - 1}`}>← Trang trước</Link>}
            />
          ) : (
            <Button variant={'outline'} size={'sm'} disabled>
              ← Trang trước
            </Button>
          )}

          <span className={'text-muted-foreground'}>
            Trang {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Button
              nativeButton={false}
              variant={'outline'}
              size={'sm'}
              render={<Link href={`/admin/danh-gia?page=${page + 1}`}>Trang sau →</Link>}
            />
          ) : (
            <Button variant={'outline'} size={'sm'} disabled>
              Trang sau →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
