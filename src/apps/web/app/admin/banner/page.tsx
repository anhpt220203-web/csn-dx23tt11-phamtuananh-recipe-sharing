import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { Search } from 'lucide-react';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';

import { PaginationNav } from '~/(marketing)/_components/pagination-nav';
import type { ContentSchema } from '~/lib/content/database';
import { MediaUploadDialog } from '../media/_components/media-upload-dialog';

import { BannerRowActions, CreateBannerForm } from './_components/banner-forms';

export const metadata: Metadata = {
  title: 'Quản lý banner',
};

export const instant = false;

const PER_PAGE = 6;

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
  // (tránh gọi service-role key khi biến môi trường chưa có).
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
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className={'flex flex-col gap-6'}>
      <div className={'flex flex-wrap items-center justify-between gap-4'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>Quản lý banner</h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            Banner hiển thị ở carousel trang chủ ({total} banner). Chỉ banner đang hoạt động mới
            hiện ra ngoài.
          </p>
        </div>

        <MediaUploadDialog
          defaultFolder={'banners'}
          buttonLabel={'Tải ảnh banner lên'}
          buttonVariant={'outline'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={'text-base'}>Thêm banner mới</CardTitle>
        </CardHeader>

        <CardContent>
          <CreateBannerForm />
        </CardContent>
      </Card>

      {/* Tabs lọc trạng thái + ô tìm kiếm */}
      <Card>
        <CardContent className={'p-4'}>
          <div className={'flex flex-col gap-3 md:flex-row md:items-center md:justify-between'}>
            <div className={'flex flex-wrap items-center gap-1.5'}>
              {STATUS_FILTERS.map((f) => {
                const active = f.value === status;
                return (
                  <Button
                    key={f.value}
                    nativeButton={false}
                    variant={active ? 'default' : 'outline'}
                    size={'sm'}
                    render={
                      <Link
                        href={buildBannersHref({
                          status: f.value,
                          q,
                          page: 1,
                        })}
                      >
                        {f.label}
                      </Link>
                    }
                  />
                );
              })}
            </div>

            <form
              method={'GET'}
              action={'/admin/banner'}
              className={'flex items-center gap-2'}
            >
              {status !== 'all' && (
                <input type={'hidden'} name={'status'} value={status} />
              )}

              <div className={'relative min-w-56'}>
                <Search className={'text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2'} />
                <Input
                  name={'q'}
                  defaultValue={q}
                  placeholder={'Tìm theo tiêu đề banner...'}
                  className={'pl-9 text-sm'}
                />
              </div>

              <Button type={'submit'} variant={'secondary'} size={'sm'}>
                Tìm
              </Button>

              {q && (
                <Button
                  nativeButton={false}
                  variant={'ghost'}
                  size={'sm'}
                  className={'text-xs text-muted-foreground'}
                  render={
                    <Link
                      href={buildBannersHref({
                        status,
                        q: '',
                        page: 1,
                      })}
                    >
                      Xóa tìm
                    </Link>
                  }
                />
              )}
            </form>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className={'pb-3'}>
          <CardTitle className={'text-base flex items-center justify-between'}>
            <span>Danh sách banner ({total})</span>
            {total > 0 && (
              <span className={'text-xs font-normal text-muted-foreground'}>
                Trang {page} / {Math.max(1, totalPages)}
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {banners.length === 0 ? (
            <p className={'text-muted-foreground text-sm'}>
              {q || status !== 'all'
                ? 'Không tìm thấy banner nào phù hợp với bộ lọc.'
                : 'Chưa có banner nào.'}
            </p>
          ) : (
            <ul className={'flex flex-col gap-3'}>
              {banners.map((banner) => (
                <li
                  key={banner.id}
                  className={'flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between'}
                >
                  <div className={'flex items-start gap-3 min-w-0 flex-1'}>
                    {banner.image_url ? (
                      <div className={'relative h-14 w-24 shrink-0 overflow-hidden rounded-md border bg-muted'}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className={'h-full w-full object-cover'}
                        />
                      </div>
                    ) : null}

                    <div className={'min-w-0 flex-1'}>
                      <div className={'flex flex-wrap items-center gap-2'}>
                        <p className={'font-semibold text-base'}>{banner.title}</p>
                        <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                          {banner.is_active ? 'Đang hiện' : 'Đang ẩn'}
                        </Badge>
                      </div>

                      {banner.subtitle && (
                        <p className={'text-muted-foreground line-clamp-1 text-xs mt-0.5'}>
                          {banner.subtitle}
                        </p>
                      )}

                      <p className={'text-muted-foreground truncate font-mono text-xs mt-1'}>
                        Thứ tự: {banner.sort_order}
                        {banner.link_url ? ` · Link: ${banner.link_url}` : ''}
                      </p>
                    </div>
                  </div>

                  <BannerRowActions banner={banner} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className={'flex justify-center pt-2'}>
          <PaginationNav
            currentPage={page}
            totalPages={totalPages}
            getPageHref={(p) =>
              buildBannersHref({
                status,
                q,
                page: p,
              })
            }
          />
        </div>
      )}
    </div>
  );
}
