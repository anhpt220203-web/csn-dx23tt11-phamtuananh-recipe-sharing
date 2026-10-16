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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

import type { RecipeSchema } from '~/lib/recipes/database';

export const metadata: Metadata = {
  title: 'Tổng quan quản trị',
};

type TopFavorite = {
  recipeId: number;
  title: string;
  slug: string;
  favoriteCount: number;
};

type TopRated = {
  recipeId: number;
  title: string;
  slug: string;
  averageRating: number;
  ratingCount: number;
};

/** Đếm tổng số tài khoản qua Auth Admin API (phân trang). */
async function countUsers(): Promise<number> {
  const admin = getSupabaseServerAdminClient<RecipeSchema>();
  const perPage = 1000;
  let page = 1;
  let total = 0;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`Không liệt kê được tài khoản: ${error.message}`);
    }

    total += data.users.length;

    if (data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return total;
}

async function getStats() {
  const admin = getSupabaseServerAdminClient<RecipeSchema>();

  const [
    recipeResult,
    categoryResult,
    ratingCountResult,
    favoritesResult,
    ratingsResult,
    userCount,
  ] = await Promise.all([
    admin.from('recipes').select('id', { count: 'exact', head: true }),
    admin.from('categories').select('id', { count: 'exact', head: true }),
    admin.from('ratings').select('user_id', { count: 'exact', head: true }),
    admin.from('favorites').select('recipe_id'),
    admin.from('ratings').select('recipe_id,rating'),
    countUsers(),
  ]);

  for (const result of [
    recipeResult,
    categoryResult,
    ratingCountResult,
    favoritesResult,
    ratingsResult,
  ]) {
    if (result.error) {
      throw new Error(`Không tải được thống kê: ${result.error.message}`);
    }
  }

  const favoriteCounts = new Map<number, number>();
  for (const row of favoritesResult.data ?? []) {
    favoriteCounts.set(
      row.recipe_id,
      (favoriteCounts.get(row.recipe_id) ?? 0) + 1,
    );
  }

  const ratingSums = new Map<number, { sum: number; count: number }>();
  for (const row of ratingsResult.data ?? []) {
    const agg = ratingSums.get(row.recipe_id) ?? { sum: 0, count: 0 };
    agg.sum += row.rating;
    agg.count += 1;
    ratingSums.set(row.recipe_id, agg);
  }

  const topFavoriteIds = [...favoriteCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([recipeId]) => recipeId);

  const topRatedIds = [...ratingSums.entries()]
    .sort(
      (a, b) =>
        b[1].sum / b[1].count - a[1].sum / a[1].count ||
        b[1].count - a[1].count,
    )
    .slice(0, 5)
    .map(([recipeId]) => recipeId);

  const topIds = [...new Set([...topFavoriteIds, ...topRatedIds])];
  const infoById = new Map<number, { title: string; slug: string }>();

  if (topIds.length > 0) {
    const { data, error } = await admin
      .from('recipes')
      .select('id,title,slug')
      .in('id', topIds);

    if (error) {
      throw new Error(`Không tải được công thức: ${error.message}`);
    }

    for (const recipe of data ?? []) {
      infoById.set(recipe.id, { title: recipe.title, slug: recipe.slug });
    }
  }

  const topFavorites: TopFavorite[] = topFavoriteIds
    .map((recipeId) => {
      const info = infoById.get(recipeId);

      if (!info) {
        return null;
      }

      return {
        recipeId,
        title: info.title,
        slug: info.slug,
        favoriteCount: favoriteCounts.get(recipeId) ?? 0,
      };
    })
    .filter((item): item is TopFavorite => item !== null);

  const topRated: TopRated[] = topRatedIds
    .map((recipeId) => {
      const info = infoById.get(recipeId);
      const agg = ratingSums.get(recipeId);

      if (!info || !agg) {
        return null;
      }

      return {
        recipeId,
        title: info.title,
        slug: info.slug,
        averageRating: agg.sum / agg.count,
        ratingCount: agg.count,
      };
    })
    .filter((item): item is TopRated => item !== null);

  return {
    recipeCount: recipeResult.count ?? 0,
    categoryCount: categoryResult.count ?? 0,
    ratingCount: ratingCountResult.count ?? 0,
    userCount,
    topFavorites,
    topRated,
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

function StatCard({
  label,
  value,
  href,
  linkLabel,
}: {
  label: string;
  value: number;
  href: string;
  linkLabel: string;
}) {
  return (
    <Card>
      <CardHeader className={'pb-2'}>
        <CardDescription>{label}</CardDescription>

        <CardTitle className={'text-3xl'}>{value}</CardTitle>
      </CardHeader>

      <CardContent className={'pt-0'}>
        <Button
          nativeButton={false}
          variant={'link'}
          size={'sm'}
          className={'h-auto p-0'}
          render={<Link href={href}>{linkLabel}</Link>}
        />
      </CardContent>
    </Card>
  );
}

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

      <div className={'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'}>
        <StatCard
          label={'Công thức'}
          value={stats.recipeCount}
          href={'/admin/cong-thuc'}
          linkLabel={'Xem danh sách'}
        />

        <StatCard
          label={'Danh mục'}
          value={stats.categoryCount}
          href={'/admin/danh-muc'}
          linkLabel={'Xem danh sách'}
        />

        <StatCard
          label={'Người dùng'}
          value={stats.userCount}
          href={'/admin/tai-khoan'}
          linkLabel={'Xem danh sách'}
        />

        <StatCard
          label={'Đánh giá'}
          value={stats.ratingCount}
          href={'/admin/cong-thuc'}
          linkLabel={'Xem công thức'}
        />
      </div>

      <div className={'grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2'}>
        <Card>
          <CardHeader>
            <CardTitle className={'text-lg'}>
              Món được yêu thích nhiều nhất
            </CardTitle>

            <CardDescription>
              Top 5 công thức có nhiều lượt yêu thích nhất.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {stats.topFavorites.length === 0 ? (
              <p className={'text-muted-foreground text-sm'}>
                Chưa có lượt yêu thích nào.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={'w-10'}>#</TableHead>

                    <TableHead>Món ăn</TableHead>

                    <TableHead className={'text-right'}>Lượt thích</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {stats.topFavorites.map((item, index) => (
                    <TableRow key={item.recipeId}>
                      <TableCell className={'font-medium'}>
                        {index + 1}
                      </TableCell>

                      <TableCell>
                        <Link
                          href={`/cong-thuc/${item.slug}`}
                          className={'hover:underline'}
                        >
                          {item.title}
                        </Link>
                      </TableCell>

                      <TableCell className={'text-right'}>
                        {item.favoriteCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={'text-lg'}>
              Món được đánh giá cao nhất
            </CardTitle>

            <CardDescription>
              Top 5 công thức có điểm trung bình cao nhất.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {stats.topRated.length === 0 ? (
              <p className={'text-muted-foreground text-sm'}>
                Chưa có đánh giá nào.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={'w-10'}>#</TableHead>

                    <TableHead>Món ăn</TableHead>

                    <TableHead className={'text-right'}>Điểm TB</TableHead>

                    <TableHead className={'text-right'}>Lượt đánh giá</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {stats.topRated.map((item, index) => (
                    <TableRow key={item.recipeId}>
                      <TableCell className={'font-medium'}>
                        {index + 1}
                      </TableCell>

                      <TableCell>
                        <Link
                          href={`/cong-thuc/${item.slug}`}
                          className={'hover:underline'}
                        >
                          {item.title}
                        </Link>
                      </TableCell>

                      <TableCell className={'text-right'}>
                        ★ {item.averageRating.toFixed(1)}
                      </TableCell>

                      <TableCell className={'text-right'}>
                        {item.ratingCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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
