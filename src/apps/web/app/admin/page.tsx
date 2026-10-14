import type { Metadata } from 'next';
import Link from 'next/link';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import type { RecipeSchema } from '~/lib/recipes/database';

export const metadata: Metadata = {
  title: 'Tổng quan quản trị',
};

async function getStats() {
  const admin = getSupabaseServerAdminClient<RecipeSchema>();

  const [{ count: recipeCount }, { count: categoryCount }] = await Promise.all([
    admin.from('recipes').select('id', { count: 'exact', head: true }),
    admin.from('categories').select('id', { count: 'exact', head: true }),
  ]);

  return {
    recipeCount: recipeCount ?? 0,
    categoryCount: categoryCount ?? 0,
  };
}

const SHORTCUTS = [
  {
    href: '/admin/tai-khoan',
    title: 'Quản lý tài khoản',
    description:
      'Xem danh sách người dùng, tìm kiếm theo email/tên, khóa hoặc mở khóa tài khoản.',
    cta: 'Mở quản lý tài khoản',
  },
  {
    href: '/admin/cong-thuc',
    title: 'Quản lý công thức',
    description:
      'Thêm, sửa, xóa công thức; tải ảnh đại diện lên kho lưu trữ.',
    cta: 'Mở quản lý công thức',
  },
  {
    href: '/admin/danh-muc',
    title: 'Quản lý danh mục',
    description: 'Thêm, sửa, xóa các nhóm món ăn của website.',
    cta: 'Mở quản lý danh mục',
  },
];

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className={'flex flex-col gap-6'}>
      <div>
        <h1 className={'text-2xl font-bold tracking-tight'}>
          Tổng quan quản trị
        </h1>

        <p className={'text-muted-foreground mt-1 text-sm'}>
          Chào mừng trở lại. Chọn một mục bên dưới để bắt đầu quản lý.
        </p>
      </div>

      <div className={'grid grid-cols-2 gap-3 sm:gap-4'}>
        <Card>
          <CardHeader className={'pb-2'}>
            <CardDescription>Công thức</CardDescription>

            <CardTitle className={'text-3xl'}>{stats.recipeCount}</CardTitle>
          </CardHeader>

          <CardContent className={'pt-0'}>
            <Button
              nativeButton={false}
              variant={'link'}
              size={'sm'}
              className={'h-auto p-0'}
              render={<Link href={'/admin/cong-thuc'}>Xem danh sách</Link>}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={'pb-2'}>
            <CardDescription>Danh mục</CardDescription>

            <CardTitle className={'text-3xl'}>{stats.categoryCount}</CardTitle>
          </CardHeader>

          <CardContent className={'pt-0'}>
            <Button
              nativeButton={false}
              variant={'link'}
              size={'sm'}
              className={'h-auto p-0'}
              render={<Link href={'/admin/danh-muc'}>Xem danh sách</Link>}
            />
          </CardContent>
        </Card>
      </div>

      <div className={'grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3'}>
        {SHORTCUTS.map((item) => (
          <Card key={item.href} className={'flex flex-col'}>
            <CardHeader>
              <CardTitle className={'text-lg'}>{item.title}</CardTitle>

              <CardDescription>{item.description}</CardDescription>
            </CardHeader>

            <CardContent className={'mt-auto'}>
              <Button
                nativeButton={false}
                variant={'outline'}
                className={'w-full'}
                render={<Link href={item.href}>{item.cta}</Link>}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
