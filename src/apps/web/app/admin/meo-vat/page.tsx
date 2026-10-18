import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { BookOpen, ExternalLink, Plus, Search } from 'lucide-react';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';

import type { ContentSchema } from '~/lib/content/database';
import { PaginationNav } from '~/(marketing)/_components/pagination-nav';
import { MediaUploadDialog } from '../media/_components/media-upload-dialog';

import { TipRowActions } from './_components/tip-forms';

export const metadata: Metadata = {
  title: 'Quản lý mẹo vặt',
};

export const instant = false;

// 9 bài/trang chia đều cho lưới 3 cột trên desktop
const PER_PAGE = 9;

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

      {/* Cụm thống nhất: Gộp bộ lọc, tìm kiếm và danh sách mẹo vặt dạng lưới trong 1 Card */}
      <Card className={'shadow-xs'}>
        <CardHeader className={'space-y-4 border-b border-border/50 pb-5'}>
          <div className={'flex flex-wrap items-center justify-between gap-2'}>
            <CardTitle className={'text-base font-semibold flex items-center gap-2'}>
              <BookOpen className={'h-4 w-4 text-primary'} />
              <span>Danh sách bài viết ({total})</span>
            </CardTitle>

            {total > 0 && (
              <span className={'text-xs text-muted-foreground'}>
                Trang {safePage} / {totalPages}
              </span>
            )}
          </div>

          {/* Thanh công cụ: Tabs lọc trạng thái + Form tìm kiếm */}
          <div className={'flex flex-col gap-3 md:flex-row md:items-center md:justify-between'}>
            <div className={'flex flex-wrap items-center gap-1.5'}>
              {STATUS_FILTERS.map((filter) => {
                const active = statusFilter === filter.value;

                return (
                  <Button
                    key={filter.value}
                    nativeButton={false}
                    variant={active ? 'default' : 'outline'}
                    size={'sm'}
                    className={'h-8 text-xs'}
                    render={
                      <Link
                        href={buildTipsHref({
                          status: filter.value,
                          q: searchTerm,
                          page: 1,
                        })}
                      >
                        {filter.label}
                      </Link>
                    }
                  />
                );
              })}
            </div>

            <form
              action={'/admin/meo-vat'}
              method={'GET'}
              role={'search'}
              className={'flex items-center gap-2'}
            >
              <input type={'hidden'} name={'status'} value={statusFilter} />

              <div className={'relative min-w-56'}>
                <Search className={'text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2'} />
                <Input
                  id={'admin-tip-search'}
                  name={'q'}
                  type={'search'}
                  defaultValue={searchTerm}
                  placeholder={'Nhập tiêu đề mẹo vặt…'}
                  className={'h-8 pl-8 text-xs'}
                />
              </div>

              <Button type={'submit'} variant={'secondary'} size={'sm'} className={'h-8 text-xs'}>
                Tìm
              </Button>

              {hasActiveFilter && (
                <Button
                  nativeButton={false}
                  variant={'ghost'}
                  size={'sm'}
                  className={'h-8 text-xs text-muted-foreground'}
                  render={
                    <Link
                      href={buildTipsHref({
                        status: 'all',
                        q: '',
                        page: 1,
                      })}
                    >
                      Xóa
                    </Link>
                  }
                />
              )}
            </form>
          </div>
        </CardHeader>

        <CardContent className={'pt-5'}>
          {tips.length === 0 ? (
            <div className={'py-12 text-center'}>
              <BookOpen className={'mx-auto h-10 w-10 text-muted-foreground/30 mb-2'} />
              <p className={'text-muted-foreground text-sm font-medium'}>
                {hasActiveFilter
                  ? 'Không tìm thấy bài viết nào phù hợp với bộ lọc.'
                  : 'Chưa có bài viết mẹo vặt nào.'}
              </p>
            </div>
          ) : (
            /* Danh sách mẹo vặt dạng lưới (Grid 2 cột trên md, 3 cột trên lg/xl) */
            <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
              {tips.map((tip) => (
                <Card
                  key={tip.id}
                  className={'flex flex-col justify-between overflow-hidden border-border/70 shadow-xs hover:shadow-sm transition-shadow'}
                >
                  <div>
                    {/* Ảnh đại diện bài viết */}
                    {tip.image_url ? (
                      <div className={'relative aspect-video w-full overflow-hidden bg-muted border-b border-border/50'}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={tip.image_url}
                          alt={tip.title}
                          className={'h-full w-full object-cover'}
                        />
                      </div>
                    ) : (
                      <div className={'flex aspect-video w-full items-center justify-center border-b border-border/50 bg-muted/40 text-muted-foreground'}>
                        <BookOpen className={'h-8 w-8 text-muted-foreground/40'} />
                      </div>
                    )}

                    <div className={'p-4 space-y-2'}>
                      <div className={'flex items-center justify-between gap-2'}>
                        <Badge
                          variant={tip.is_published ? 'default' : 'secondary'}
                          className={'text-[11px] h-5 px-2'}
                        >
                          {tip.is_published ? 'Đã xuất bản' : 'Nháp'}
                        </Badge>

                        <span className={'text-[11px] text-muted-foreground font-mono'}>
                          /{tip.slug}
                        </span>
                      </div>

                      <h3
                        className={'font-semibold text-base leading-snug text-foreground line-clamp-2'}
                        title={tip.title}
                      >
                        {tip.title}
                      </h3>

                      {tip.excerpt && (
                        <p className={'text-xs text-muted-foreground leading-relaxed line-clamp-2'}>
                          {tip.excerpt}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer của card: Nút Xem bài viết & Cụm nút thao tác */}
                  <CardFooter className={'p-4 pt-3 border-t border-border/40 bg-muted/10 flex flex-col gap-2.5'}>
                    <div className={'w-full'}>
                      <Button
                        nativeButton={false}
                        variant={'outline'}
                        size={'sm'}
                        className={'h-8 w-full gap-1.5 text-xs'}
                        render={
                          <Link
                            href={`/meo-vat/${tip.slug}`}
                            target={'_blank'}
                            rel={'noopener noreferrer'}
                            title={`Xem bài viết: ${tip.title}`}
                          >
                            <ExternalLink className={'h-3.5 w-3.5'} />
                            <span>Xem bài viết công khai</span>
                          </Link>
                        }
                      />
                    </div>

                    <div className={'w-full pt-1 border-t border-border/30 flex justify-end'}>
                      <TipRowActions tip={tip} />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>

        {totalPages > 1 && (
          <CardFooter className={'border-t border-border/40 pt-4 flex justify-center'}>
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
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
