import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import { CreateTipForm } from '../_components/tip-forms';

export const metadata: Metadata = {
  title: 'Thêm bài viết mẹo vặt',
};

export const instant = false;

export default async function NewTipPage() {
  // Trang admin đọc DB mỗi request, không prerender lúc build.
  await connection();

  return (
    <div className={'mx-auto flex w-full max-w-3xl flex-col gap-6'}>
      <div className={'flex flex-col gap-2'}>
        <div>
          <Button
            nativeButton={false}
            variant={'ghost'}
            size={'sm'}
            className={'h-8 gap-1.5 px-0 text-muted-foreground hover:text-foreground'}
            render={
              <Link href={'/admin/meo-vat'}>
                <ArrowLeft className={'h-4 w-4'} />
                <span>Quay lại danh sách mẹo vặt</span>
              </Link>
            }
          />
        </div>

        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>Thêm bài viết mẹo vặt</h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            Chia sẻ các bí quyết làm bếp, mẹo vặt nấu ăn và kinh nghiệm hữu ích cho cộng đồng.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={'text-base'}>Thông tin bài viết</CardTitle>
        </CardHeader>

        <CardContent>
          <CreateTipForm redirectTo={'/admin/meo-vat'} />
        </CardContent>
      </Card>
    </div>
  );
}
