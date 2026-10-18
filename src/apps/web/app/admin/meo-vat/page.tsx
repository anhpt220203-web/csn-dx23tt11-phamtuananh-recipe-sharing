import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { ExternalLink, Plus } from 'lucide-react';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';

import type { ContentSchema } from '~/lib/content/database';
import { PaginationNav } from '~/(marketing)/_components/pagination-nav';
import { MediaUploadDialog } from '../media/_components/media-upload-dialog';

import { TipRowActions } from './_components/tip-forms';

export const metadata: Metadata = {
  title: 'Quản lý mẹo vặt',
};

export const instant = false;

const PER_PAGE = 8;

const STATUS_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'draft', label: 'Nháp' },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]['value'];

type AdminTipsParams = {
  status: StatusFilter;
  q: string;
  page?: number;
};

/**
 * Dựng URL trang quản lý mẹo vặt, giữ lại các bộ lọc đang dùng và số trang.
 */
function buildTipsHref({ status, q, page = 1 }: AdminTipsParams): string {
  const params = new URLSearchParams();

  if (status !== 'all') {
    params.set('status', status);
  }

  const trimmed = q.trim();

  if (trimmed) {
    params.set('q', trimmed);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  const queryString = params.toString();

  return queryString ? `/admin/meo-vat?${queryString}` : '/admin/meo-vat';
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

export default async function TipsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  // Trang admin đọc DB mỗi request, không prerender lúc build
  // (tránh gọi service-role key khi biến môi trường chưa có).
  await connection();

  const { status: statusParam, q: qParam, page: pageParam } = await searchParams;

  const statusFilter: StatusFilter =
    statusParam === 'published' || statusParam === 'draft'
      ? statusParam
      : 'all';

  const searchTerm = (qParam ?? '').trim();
  const page = parsePage(pageParam);

  const admin = getSupabaseServerAdminClient<ContentSchema>();

  let baseQuery = admin
    .from('tips')
    .select(
      'id,title,slug,excerpt,content,image_url,is_published,created_at,updated_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false });

  if (statusFilter === 'published') {
    baseQuery = baseQuery.eq('is_published', true);
  } else if (statusFilter === 'draft') {
    baseQuery = baseQuery.eq('is_published', false);
  }

  if (searchTerm) {
    baseQuery = baseQuery.ilike('title', `%${escapeLike(searchTerm)}%`);
  }

  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const { data, count, error } = await baseQuery.range(from, to);

  if (error) {
    throw new Error(`Không tải được mẹo vặt: ${error.message}`);
  }

  const tips = data ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);

  // Nếu page trên URL vượt quá tổng số trang do người dùng xóa hoặc lọc
  if (page > totalPages && total > 0) {
    redirect(
      buildTipsHref({
        status: statusFilter,
        q: searchTerm,
        page: totalPages,
      }),
    );
  }

  const hasActiveFilter = searchTerm !== '' || statusFilter !== 'all';

  return (
    <div className={'flex flex-col gap-6'}>
      {/* Header trang & các nút hành động */}
      <div className={'flex flex-wrap items-center justify-between gap-4'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>Quản lý mẹo vặt</h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            Tổng cộng {total} bài viết mẹo vặt trong hệ thống.
          </p>
        </div>

        <div className={'flex flex-wrap items-center gap-2'}>
          <MediaUploadDialog
            defaultFolder={'tips'}
            buttonLabel={'Tải ảnh vào thư viện'}
            buttonVariant={'outline'}
          />

          <Button
            nativeButton={false}
            render={
              <Link href={'/admin/meo-vat/moi'} className={'gap-1.5'}>
                <Plus className={'h-4 w-4'} />
                <span>Thêm bài viết mới</span>
              </Link>
            }
          />
        </div>
      </div>

      {/* Bộ lọc trạng thái tabs giống bên công thức */}
      <div className={'flex flex-wrap gap-2'}>
        {STATUS_FILTERS.map((filter) => {
          const active = statusFilter === filter.value;

          return (
            <Link
              key={filter.value}
              href={buildTipsHref({
                status: filter.value,
                q: searchTerm,
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

      {/* Form tìm kiếm bài viết */}
      <form
        action={'/admin/meo-vat'}
        method={'GET'}
        role={'search'}
        className={'flex flex-col gap-2 sm:flex-row sm:items-end'}
      >
        <input type={'hidden'} name={'status'} value={statusFilter} />

        <div className={'flex-1'}>
          <label
            htmlFor={'admin-tip-search'}
            className={'mb-1 block text-xs font-medium'}
          >
            Tìm kiếm theo tiêu đề bài viết
          </label>

          <Input
            id={'admin-tip-search'}
            name={'q'}
            type={'search'}
            defaultValue={searchTerm}
            placeholder={'Nhập tiêu đề mẹo vặt…'}
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
                  href={buildTipsHref({
                    status: 'all',
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

      {/* Danh sách bài viết */}
      <Card>
        <CardHeader className={'flex flex-row items-center justify-between pb-3'}>
          <CardTitle className={'text-base'}>
            Danh sách bài viết ({total})
          </CardTitle>

          {total > 0 && (
            <span className={'text-muted-foreground text-xs'}>
              Hiển thị {from + 1}–{Math.min(to + 1, total)} trên tổng số {total} bài
            </span>
          )}
        </CardHeader>

        <CardContent>
          {tips.length === 0 ? (
            <p className={'text-muted-foreground text-sm'}>
              {hasActiveFilter
                ? 'Không tìm thấy bài viết nào phù hợp với bộ lọc.'
                : 'Chưa có bài viết nào.'}
            </p>
          ) : (
            <>
              <ul className={'flex flex-col gap-3'}>
                {tips.map((tip) => (
                  <li
                    key={tip.id}
                    className={
                      'flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors'
                    }
                  >
                    <div className={'flex items-start gap-3 min-w-0 flex-1'}>
                      {tip.image_url ? (
                        <div
                          className={
                            'relative h-14 w-20 shrink-0 overflow-hidden rounded-md border bg-muted'
                          }
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={tip.image_url}
                            alt={tip.title}
                            className={'h-full w-full object-cover'}
                          />
                        </div>
                      ) : null}

                      <div className={'min-w-0 flex-1'}>
                        <div className={'flex flex-wrap items-center gap-2'}>
                          <p className={'font-semibold text-base'}>{tip.title}</p>
                          <Badge variant={tip.is_published ? 'default' : 'secondary'}>
                            {tip.is_published ? 'Đã xuất bản' : 'Nháp'}
                          </Badge>
                        </div>

                        <div className={'mt-1 flex items-center gap-2'}>
                          <Link
                            href={`/meo-vat/${tip.slug}`}
                            target={'_blank'}
                            rel={'noopener noreferrer'}
                            className={
                              'inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium'
                            }
                            title={`Xem bài viết: ${tip.title}`}
                          >
                            <span>Xem bài viết</span>
                            <ExternalLink className={'h-3 w-3'} />
                          </Link>
                        </div>

                        {tip.excerpt && (
                          <p className={'text-muted-foreground line-clamp-1 text-xs mt-1'}>
                            {tip.excerpt}
                          </p>
                        )}
                      </div>
                    </div>

                    <TipRowActions tip={tip} />
                  </li>
                ))}
              </ul>

              {/* Điều hướng phân trang */}
              <div className={'pt-4'}>
                <PaginationNav
                  currentPage={safePage}
                  totalPages={totalPages}
                  buildHref={(targetPage: number) =>
                    buildTipsHref({
                      status: statusFilter,
                      q: searchTerm,
                      page: targetPage,
                    })
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
