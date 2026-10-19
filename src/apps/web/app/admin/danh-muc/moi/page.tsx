import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';

import { CreateCategoryForm } from '../_components/category-forms';

export const metadata: Metadata = {
  title: 'Thêm danh mục mới',
};

export const instant = false;

export default async function NewCategoryPage() {
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
              <Link href={'/admin/danh-muc'}>
                <ArrowLeft className={'h-4 w-4'} />
                <span>Quay lại danh sách danh mục</span>
              </Link>
            }
          />
        </div>

        <div>
          <h1 className={'text-2xl font-bold tracking-tight'}>Thêm danh mục mới</h1>

          <p className={'text-muted-foreground mt-1 text-sm'}>
            Tạo nhóm phân loại mới cho các công thức món ăn (theo nhóm món, nguyên liệu, bữa ăn, cách chế biến...).
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={'text-base'}>Thông tin danh mục</CardTitle>
          <CardDescription>
            Điền tên danh mục, chiều phân loại và hình ảnh đại diện minh họa.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <CreateCategoryForm redirectTo={'/admin/danh-muc'} />
        </CardContent>
      </Card>
    </div>
  );
}
