import type { Metadata } from 'next';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import type { ContentSchema } from '~/lib/content/database';

import { BannerRowActions, CreateBannerForm } from './_components/banner-forms';

export const metadata: Metadata = {
  title: 'Quản lý banner',
};

export default async function BannersAdminPage() {
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
      <div>
        <h1 className={'text-2xl font-bold tracking-tight'}>Quản lý banner</h1>

        <p className={'text-muted-foreground mt-1 text-sm'}>
          Banner hiển thị ở carousel trang chủ. Chỉ banner đang hoạt động mới
          hiện ra ngoài.
        </p>
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
                  className={'flex items-center justify-between gap-4 rounded-lg border p-3'}
                >
                  <div className={'min-w-0'}>
                    <p className={'font-medium'}>
                      {banner.title}{' '}
                      <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                        {banner.is_active ? 'Đang hiện' : 'Đang ẩn'}
                      </Badge>
                    </p>

                    <p className={'text-muted-foreground truncate text-sm'}>
                      Thứ tự: {banner.sort_order}
                      {banner.link_url ? ` · Link: ${banner.link_url}` : ''}
                    </p>
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
