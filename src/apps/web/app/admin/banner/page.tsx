import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { ExternalLink } from 'lucide-react';

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

import { BannerRowActions, CreateBannerModal } from './_components/banner-forms';

export const metadata: Metadata = {
  title: 'Quản lý banner',
};

export const instant = false;

const PER_PAGE = 8;

const STATUS_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang hiện' },
  { value: 'inactive', label: 'Đang ẩn' },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]['value'];

function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function buildBannersHref({
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
  return queryString ? `/admin/banner?${queryString}` : '/admin/banner';
}

function escapeLike(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export default async function BannersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}) {
  // Trang admin đọc DB mỗi request, không prerender lúc build
  await connection();

  const params = await searchParams;
  const page = parsePage(params.page);
  const q = (params.q ?? '').trim();
  const status: StatusFilter =
    params.status === 'active' || params.status === 'inactive'
      ? params.status
      : 'all';

  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const admin = getSupabaseServerAdminClient<ContentSchema>();

  let query = admin
    .from('banners')
    .select(
      'id,title,subtitle,image_url,link_url,sort_order,is_active,created_at,updated_at',
      { count: 'exact' },
    );

  if (status === 'active') {
    query = query.eq('is_active', true);
  } else if (status === 'inactive') {
    query = query.eq('is_active', false);
  }

  if (q) {
    const escaped = escapeLike(q);
    query = query.or(`title.ilike.%${escaped}%,subtitle.ilike.%${escaped}%`);
  }

  const { data, count, error } = await query
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(`Không tải được banner: ${error.message}`);
  }

  const banners = data ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);

  if (page > totalPages && total > 0) {
    redirect(
      buildBannersHref({
        status,
        q,
        page: totalPages,
      }),
    );
  }

  const hasActiveFilter = q !== '' || status !== 'all';

  return (
    <div className={'flex flex-col gap-6'}>
      {/* Header trang & nút hành động */}
      <div className={'flex flex-wrap items-start justify-between gap-3'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>Quản lý banner</h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            Tổng cộng {total} banner trong hệ thống. Hiển thị ở carousel trang chủ.
          </p>
        </div>

        <div className={'flex flex-wrap items-center gap-2'}>
          <MediaUploadDialog
            defaultFolder={'banners'}
            buttonLabel={'Tải ảnh vào kho'}
            buttonVariant={'outline'}
          />

          <CreateBannerModal />
        </div>
      </div>

      {/* Tabs lọc theo trạng thái */}
      <div className={'flex flex-wrap gap-2'}>
        {STATUS_FILTERS.map((filter) => {
          const active = status === filter.value;

          return (
            <Link
              key={filter.value}
              href={buildBannersHref({
                status: filter.value,
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
              {filter.label}
            </Link>
          );
        })}
      </div>

      {/* Bộ lọc theo từ khóa */}
      <form
        action={'/admin/banner'}
        method={'GET'}
        role={'search'}
        className={'flex flex-col gap-2 sm:flex-row sm:items-end'}
      >
        {status !== 'all' && (
          <input type={'hidden'} name={'status'} value={status} />
        )}

        <div className={'flex-1'}>
          <label
            htmlFor={'admin-banner-search'}
            className={'mb-1 block text-xs font-medium'}
          >
            Tìm kiếm theo tiêu đề banner
          </label>

          <Input
            id={'admin-banner-search'}
            name={'q'}
            type={'search'}
            defaultValue={q}
            placeholder={'Nhập tiêu đề hoặc phụ đề banner…'}
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
                  href={buildBannersHref({
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

      {/* Danh sách banner */}
      {banners.length === 0 ? (
        <Card>
          <CardContent className={'py-10 text-center'}>
            <p className={'text-muted-foreground text-sm'}>
              {hasActiveFilter
                ? 'Không tìm thấy banner nào với bộ lọc hiện tại.'
                : 'Chưa có banner nào. Hãy thêm banner đầu tiên.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={'flex flex-col gap-4'}>
          {total > 0 && (
            <div className={'flex items-center justify-between text-xs text-muted-foreground'}>
              <span>
                Hiển thị {from + 1}–{Math.min(to + 1, total)} trên tổng số {total} banner
              </span>
            </div>
          )}

          <div className={'grid grid-cols-1 gap-3 lg:grid-cols-2'}>
            {banners.map((banner) => (
              <Card key={banner.id} className={'hover:shadow-xs transition-shadow'}>
                <CardHeader className={'pb-3'}>
                  <div className={'flex gap-3'}>
                    {banner.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={banner.image_url}
                        alt={banner.title}
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
                        {banner.title}
                      </CardTitle>

                      {banner.subtitle && (
                        <CardDescription className={'line-clamp-1 text-xs mt-0.5'}>
                          {banner.subtitle}
                        </CardDescription>
                      )}

                      {banner.link_url && (
                        <div className={'flex items-center gap-1.5 mt-0.5'}>
                          <Link
                            href={banner.link_url}
                            target={'_blank'}
                            rel={'noopener noreferrer'}
                            className={
                              'inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium truncate max-w-full'
                            }
                            title={`Mở liên kết: ${banner.link_url}`}
                          >
                            <span className={'truncate font-mono'}>{banner.link_url}</span>
                            <ExternalLink className={'h-3 w-3 shrink-0'} />
                          </Link>
                        </div>
                      )}

                      <div className={'mt-1.5 flex flex-wrap gap-1'}>
                        <Badge
                          variant={
                            banner.is_active
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {banner.is_active ? 'Đang hiện' : 'Đang ẩn'}
                        </Badge>

                        <Badge variant={'outline'}>
                          Thứ tự: {banner.sort_order}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className={'flex items-center gap-2 pt-0'}>
                  <BannerRowActions banner={banner} />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Phân trang */}
          <div className={'pt-2'}>
            <PaginationNav
              currentPage={safePage}
              totalPages={totalPages}
              buildHref={(p: number) =>
                buildBannersHref({
                  status,
                  q,
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
