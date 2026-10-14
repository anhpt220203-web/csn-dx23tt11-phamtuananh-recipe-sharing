import type { Metadata } from 'next';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import type { RecipeSchema } from '~/lib/recipes/database';

import { CategoryRowActions, CreateCategoryForm } from './_components/category-forms';

export const metadata: Metadata = {
  title: 'Quản lý danh mục',
};

export default async function CategoriesAdminPage() {
  const admin = getSupabaseServerAdminClient<RecipeSchema>();

  const { data, error } = await admin
    .from('categories')
    .select('id,name,slug,description')
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`Không tải được danh mục: ${error.message}`);
  }

  const categories = data ?? [];

  return (
    <div className={'flex flex-col gap-6'}>
      <div>
        <h1 className={'text-2xl font-bold tracking-tight'}>
          Quản lý danh mục
        </h1>

        <p className={'text-muted-foreground mt-1 text-sm'}>
          Thêm, sửa, xóa các nhóm món ăn. Danh mục còn công thức thì không xóa
          được.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={'text-base'}>Thêm danh mục mới</CardTitle>
        </CardHeader>

        <CardContent>
          <CreateCategoryForm />
        </CardContent>
      </Card>

      <div className={'grid grid-cols-1 gap-3 lg:grid-cols-2'}>
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className={'pb-3'}>
              <div className={'flex items-center justify-between gap-2'}>
                <CardTitle className={'text-base'}>{category.name}</CardTitle>

                <Badge variant={'secondary'} className={'font-mono text-xs'}>
                  {category.slug}
                </Badge>
              </div>

              {category.description && (
                <p className={'text-muted-foreground text-sm'}>
                  {category.description}
                </p>
              )}
            </CardHeader>

            <CardContent className={'pt-0'}>
              <CategoryRowActions category={category} />
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && (
          <Card className={'lg:col-span-2'}>
            <CardContent className={'py-10 text-center'}>
              <p className={'text-muted-foreground text-sm'}>
                Chưa có danh mục nào. Hãy thêm danh mục đầu tiên ở trên.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
