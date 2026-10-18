import type { Metadata } from 'next';
import { connection } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import type { ContentSchema } from '~/lib/content/database';
import { MediaUploadDialog } from '../media/_components/media-upload-dialog';

import { BannerRowActions, CreateBannerForm } from './_components/banner-forms';

export const metadata: Metadata = {
  title: 'Quản lý banner',
};

export const instant = false;

export default async function BannersAdminPage() {
  // Trang admin đọc DB mỗi request, không prerender lúc build
  // (tránh gọi service-role key khi biến môi trường chưa có).
  await connection();

  const admin = getSupabaseServerAdminClient<ContentSchema>();

  const { data, error } = await admin
    .from('banners')
    .select('id,title,subtitle,image_url,link_url,sort_order,is_active,created_at,updated_at')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`Không tải được banner: ${error.message}`);
  }

  const banners = data ?? [];

  return (
    <div className={'flex flex-col gap-6'}>
      <div className={'flex flex-wrap items-center justify-between gap-4'}>
        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>Quản lý banner</h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            Banner hiển thị ở carousel trang chủ. Chỉ banner đang hoạt động mới
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

      <Card>
        <CardHeader>
          <CardTitle className={'text-base'}>
            Danh sách banner ({banners.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {banners.length === 0 ? (
            <p className={'text-muted-foreground text-sm'}>
              Chưa có banner nào.
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
    </div>
  );
}
