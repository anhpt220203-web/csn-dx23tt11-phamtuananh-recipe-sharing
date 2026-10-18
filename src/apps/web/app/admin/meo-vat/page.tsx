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
import type { ContentSchema } from '~/lib/content/database';
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

function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function buildTipsHref({
  status = 'all',
  q = '',
  page = 1,
}: {
  status?: StatusFilter;
  q?: string;
  page?: number;
}): string {
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

function escapeLike(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export default async function CookingTipsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}) {
  // Trang admin đọc DB mỗi request, không prerender lúc build.
  await connection();

  const {
    status: statusParam,
    q: qParam,
    page: pageParam,
  } = await searchParams;

  const statusFilter: StatusFilter =
    statusParam === 'published' || statusParam === 'draft'
      ? statusParam
      : 'all';

  const searchTerm = (qParam ?? '').trim();
  const page = parsePage(pageParam);

  const admin = getSupabaseServerAdminClient<ContentSchema>();

  let baseQuery = admin
    .from('tips')
    .select('id,title,slug,image_url,excerpt,content,is_published,created_at,updated_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false });

  if (statusFilter === 'published') {
    baseQuery = baseQuery.eq('is_published', true);
  } else if (statusFilter === 'draft') {
    baseQuery = baseQuery.eq('is_published', false);
  }

  if (searchTerm) {
    const escaped = escapeLike(searchTerm);
    baseQuery = baseQuery.or(`title.ilike.%${escaped}%,excerpt.ilike.%${escaped}%`);
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
      <div className={'flex flex-wrap items-start justify-between gap-3'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>Quản lý mẹo vặt</h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            Tổng cộng {total} bài viết kinh nghiệm và bí quyết làm bếp.
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

      {/* Tabs lọc theo trạng thái */}
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

      {/* Bộ lọc theo từ khóa */}
      <form
        action={'/admin/meo-vat'}
        method={'GET'}
        role={'search'}
        className={'flex flex-col gap-2 sm:flex-row sm:items-end'}
      >
        {statusFilter !== 'all' && (
          <input type={'hidden'} name={'status'} value={statusFilter} />
        )}

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
            placeholder={'Nhập tiêu đề hoặc tóm tắt bài viết…'}
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

      {/* Danh sách mẹo vặt */}
      {tips.length === 0 ? (
        <Card>
          <CardContent className={'py-10 text-center'}>
            <p className={'text-muted-foreground text-sm'}>
              {hasActiveFilter
                ? 'Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.'
                : 'Chưa có bài viết nào. Hãy thêm bài viết đầu tiên.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={'flex flex-col gap-4'}>
          {total > 0 && (
            <div className={'flex items-center justify-between text-xs text-muted-foreground'}>
              <span>
                Hiển thị {from + 1}–{Math.min(to + 1, total)} trên tổng số {total} bài viết
              </span>
            </div>
          )}

          <div className={'grid grid-cols-1 gap-3 lg:grid-cols-2'}>
            {tips.map((tip) => (
              <Card key={tip.id} className={'hover:shadow-xs transition-shadow'}>
                <CardHeader className={'pb-3'}>
                  <div className={'flex gap-3'}>
                    {tip.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tip.image_url}
                        alt={tip.title}
                        className={'h-16 w-24 shrink-0 rounded-md object-cover border'}
                        loading={'lazy'}
                      />
                    ) : (
                      <div
                        className={
                          'bg-muted flex h-16 w-24 shrink-0 items-center justify-center rounded-md text-xs text-muted-foreground border'
                        }
                      >
                        Không ảnh
                      </div>
                    )}

                    <div className={'min-w-0 flex-1'}>
                      <CardTitle className={'truncate text-base'}>
                        {tip.title}
                      </CardTitle>

                      <div className={'flex items-center gap-2 mt-0.5'}>
                        <CardDescription className={'truncate font-mono text-xs'}>
                          {tip.slug}
                        </CardDescription>

                        <Link
                          href={`/meo-vat/${tip.slug}`}
                          target={'_blank'}
                          rel={'noopener noreferrer'}
                          className={
                            'inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium shrink-0'
                          }
                          title={`Xem bài viết "${tip.title}"`}
                        >
                          <span>Xem bài viết</span>
                          <ExternalLink className={'h-3 w-3'} />
                        </Link>
                      </div>

                      <div className={'mt-1.5 flex flex-wrap gap-1'}>
                        <Badge
                          variant={
                            tip.is_published
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {tip.is_published ? 'Đã xuất bản' : 'Nháp'}
                        </Badge>

                        <Badge variant={'outline'}>
                          {new Date(tip.created_at).toLocaleDateString('vi-VN')}
                        </Badge>
                      </div>

                      {tip.excerpt && (
                        <p className={'text-muted-foreground text-xs line-clamp-1 mt-1.5'}>
                          {tip.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className={'flex items-center gap-2 pt-0'}>
                  <TipRowActions tip={tip} />
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
                buildTipsHref({
                  status: statusFilter,
                  q: searchTerm,
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
