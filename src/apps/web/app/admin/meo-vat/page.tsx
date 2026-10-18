import type { Metadata } from 'next';
import { connection } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import type { ContentSchema } from '~/lib/content/database';

import { TipRowActions, CreateTipForm } from './_components/tip-forms';

export const metadata: Metadata = {
  title: 'Quản lý mẹo vặt',
};

export const instant = false;

export default async function TipsAdminPage() {
  // Trang admin đọc DB mỗi request, không prerender lúc build
  // (tránh gọi service-role key khi biến môi trường chưa có).
  await connection();

  const admin = getSupabaseServerAdminClient<ContentSchema>();

  const { data, error } = await admin
    .from('tips')
    .select('id,title,slug,excerpt,content,image_url,is_published,created_at,updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Không tải được mẹo vặt: ${error.message}`);
  }

  const tips = data ?? [];

  return (
    <div className={'flex flex-col gap-6'}>
      <div>
        <h1 className={'text-2xl font-bold tracking-tight'}>Quản lý mẹo vặt</h1>

        <p className={'text-muted-foreground mt-1 text-sm'}>
          Bài viết bí quyết nấu ăn hiển thị ở trang chủ và trang Mẹo vặt.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={'text-base'}>Thêm bài viết mới</CardTitle>
        </CardHeader>

        <CardContent>
          <CreateTipForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={'text-base'}>
            Danh sách bài viết ({tips.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {tips.length === 0 ? (
            <p className={'text-muted-foreground text-sm'}>
              Chưa có bài viết nào.
            </p>
          ) : (
            <ul className={'flex flex-col gap-3'}>
              {tips.map((tip) => (
                <li
                  key={tip.id}
                  className={'flex items-center justify-between gap-4 rounded-lg border p-3'}
                >
                  <div className={'min-w-0'}>
                    <p className={'font-medium'}>
                      {tip.title}{' '}
                      <Badge variant={tip.is_published ? 'default' : 'secondary'}>
                        {tip.is_published ? 'Đã xuất bản' : 'Nháp'}
                      </Badge>
                    </p>

                    <p className={'text-muted-foreground truncate text-sm'}>
                      /meo-vat/{tip.slug}
                    </p>
                  </div>

                  <TipRowActions tip={tip} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
