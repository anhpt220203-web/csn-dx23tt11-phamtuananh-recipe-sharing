import type { Metadata } from 'next';
import { connection } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import type { RecipeSchema } from '~/lib/recipes/database';

import { RecipeForm } from '../_components/recipe-form';

export const metadata: Metadata = {
  title: 'Thêm công thức',
};

export default async function NewRecipePage() {
  // Trang admin đọc DB mỗi request, không prerender lúc build.
  await connection();

  const admin = getSupabaseServerAdminClient<RecipeSchema>();

  const { data, error } = await admin
    .from('categories')
    .select('id,name,slug,description,dimension')
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`Không tải được danh mục: ${error.message}`);
  }

  return (
    <div className={'mx-auto flex w-full max-w-3xl flex-col gap-6'}>
      <div>
        <h1 className={'text-2xl font-bold tracking-tight'}>Thêm công thức</h1>

        <p className={'text-muted-foreground mt-1 text-sm'}>
          Nhập thông tin món ăn, nguyên liệu (mỗi dòng một mục) và các bước
          thực hiện.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={'text-base'}>Thông tin công thức</CardTitle>
        </CardHeader>

        <CardContent>
          <RecipeForm categories={data ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
