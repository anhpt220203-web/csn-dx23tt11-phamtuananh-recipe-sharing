import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { getCategories } from '~/lib/recipes/queries';

import { SitePageHeader } from '../_components/site-page-header';

export const metadata: Metadata = {
  title: 'Danh mục món ăn',
  description:
    'Khám phá 7 nhóm món ăn: món chính, món canh, món khai vị, món chay, món ăn vặt, món tráng miệng và đồ uống.',
};

export default async function CategoriesPage() {
  // Trang đọc dữ liệu mới mỗi request (DB Supabase), không prerender lúc build.
  // (Dùng `connection()` thay cho `dynamic = 'force-dynamic'`, vốn không
  // tương thích với `cacheComponents` của Next 16.)
  await connection();

  const categories = await getCategories();

  return (
    <div>
      <SitePageHeader
        title={'Danh mục món ăn'}
        subtitle={
          'Chọn một nhóm món để xem các công thức nấu ăn trong nhóm đó.'
        }
      />

      <div className={'container mx-auto py-8'}>
        {categories.length === 0 ? (
          <p className={'text-muted-foreground'}>
            Chưa có danh mục nào. Vui lòng quay lại sau.
          </p>
        ) : (
          <div
            className={'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'}
          >
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/danh-muc/${category.slug}`}
                className={'block h-full'}
              >
                <Card className={'h-full transition-shadow hover:shadow-md'}>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <CardDescription>
                      {category.description ||
                        'Xem các công thức trong nhóm này.'}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
