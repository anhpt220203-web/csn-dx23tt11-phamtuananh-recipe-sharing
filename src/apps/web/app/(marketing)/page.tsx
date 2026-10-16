import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';

import { ArrowRight, ChefHat, Heart, Search, Star } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { RecipeCard } from '~/components/recipes/recipe-card';
import { SearchForm } from '~/components/recipes/search-form';
import appConfig from '~/config/app.config';
import { getCategories, getLatestRecipes } from '~/lib/recipes/queries';
import { getFavoriteRecipeIds } from '~/lib/recipes/favorites';

export const metadata: Metadata = {
  title: 'Trang chủ',
  description:
    'Khám phá hàng chục công thức nấu ăn Việt Nam: món chính, món canh, món chay, món ăn vặt, đồ uống và nhiều hơn nữa.',
};

const FEATURES = [
  {
    icon: ChefHat,
    title: 'Công thức chi tiết',
    description:
      'Nguyên liệu định lượng rõ ràng, từng bước thực hiện kèm thời gian nấu và độ khó.',
  },
  {
    icon: Search,
    title: 'Tìm kiếm nhanh',
    description:
      'Tìm theo tên món, nguyên liệu hoặc lọc theo nhóm món chỉ trong vài giây.',
  },
  {
    icon: Heart,
    title: 'Lưu món yêu thích',
    description:
      'Đăng nhập để đánh dấu các món bạn thích và xem lại bất cứ lúc nào.',
  },
  {
    icon: Star,
    title: 'Đánh giá 5 sao',
    description:
      'Chấm điểm các món đã thử để giúp cộng đồng chọn được công thức ngon nhất.',
  },
] as const;

export default async function HomePage() {
  // Trang chủ đọc dữ liệu mới mỗi request để luôn phản ánh DB hiện tại.
  // (Dùng `connection()` thay cho `dynamic = 'force-dynamic'`, vốn không
  // tương thích với `cacheComponents` của Next 16.)
  await connection();

  const [categories, latestRecipes] = await Promise.all([
    getCategories(),
    getLatestRecipes(8),
  ]);

  // Trạng thái yêu thích ban đầu cho nút trái tim trên thẻ công thức.
  const favoriteIds = await getFavoriteRecipeIds(
    latestRecipes.map((recipe) => recipe.id),
  );

  return (
    <div className={'flex flex-col'}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className={
          'bg-gradient-to-b from-orange-50 via-amber-50 to-background dark:from-orange-950/40 dark:via-amber-950/20'
        }
      >
        <div
          className={
            'container mx-auto flex flex-col items-center gap-6 px-4 py-12 text-center sm:py-16'
          }
        >
          <span
            className={
              'bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium'
            }
          >
            <ChefHat className={'h-4 w-4'} aria-hidden={true} />
            {appConfig.name} — Nấu ngon mỗi ngày
          </span>

          <h1
            className={
              'max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl'
            }
          >
            Khám phá công thức nấu ăn Việt Nam ngon đúng điệu
          </h1>

          <p className={'text-muted-foreground max-w-xl text-base sm:text-lg'}>
            Từ phở bò Hà Nội đến bánh xèo miền Trung — hàng chục công thức chi
            tiết, dễ làm theo, kèm ảnh minh họa từng món.
          </p>

          <div className={'w-full max-w-2xl'}>
            <SearchForm categories={categories} />
          </div>
        </div>
      </section>

      {/* ── Nhóm món ─────────────────────────────────────── */}
      <section className={'container mx-auto px-4 py-10 sm:py-14'}>
        <div className={'mb-6 flex items-end justify-between gap-4'}>
          <div>
            <h2 className={'text-2xl font-bold tracking-tight sm:text-3xl'}>
              Nhóm món ăn
            </h2>
            <p className={'text-muted-foreground mt-1 text-sm sm:text-base'}>
              Chọn một nhóm món để bắt đầu khám phá.
            </p>
          </div>

          <Button variant={'ghost'} render={<Link href={'/danh-muc'} />}>
            Xem tất cả
            <ArrowRight className={'h-4 w-4'} aria-hidden={true} />
          </Button>
        </div>

        {categories.length === 0 ? (
          <p className={'text-muted-foreground'}>
            Chưa có danh mục nào. Vui lòng quay lại sau.
          </p>
        ) : (
          <div
            className={'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'}
          >
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.slug}
                href={`/danh-muc/${category.slug}`}
                className={'block h-full'}
              >
                <Card className={'h-full transition-shadow hover:shadow-md'}>
                  <CardHeader>
                    <CardTitle className={'text-lg'}>{category.name}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <CardDescription className={'line-clamp-2'}>
                      {category.description ||
                        'Xem các công thức trong nhóm này.'}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Công thức mới nhất ───────────────────────────── */}
      <section className={'bg-muted/40 border-y'}>
        <div className={'container mx-auto px-4 py-10 sm:py-14'}>
          <div className={'mb-6 flex items-end justify-between gap-4'}>
            <div>
              <h2 className={'text-2xl font-bold tracking-tight sm:text-3xl'}>
                Công thức mới nhất
              </h2>
              <p className={'text-muted-foreground mt-1 text-sm sm:text-base'}>
                Những món ăn vừa được cập nhật trên {appConfig.name}.
              </p>
            </div>

            <Button variant={'ghost'} render={<Link href={'/tim-kiem'} />}>
              Tìm món khác
              <ArrowRight className={'h-4 w-4'} aria-hidden={true} />
            </Button>
          </div>

          {latestRecipes.length === 0 ? (
            <p className={'text-muted-foreground'}>
              Chưa có công thức nào. Vui lòng quay lại sau.
            </p>
          ) : (
            <div
              className={'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'}
            >
              {latestRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  initialFavorited={favoriteIds.has(recipe.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Tính năng ────────────────────────────────────── */}
      <section className={'container mx-auto px-4 py-10 sm:py-14'}>
        <h2
          className={
            'mb-6 text-center text-2xl font-bold tracking-tight sm:text-3xl'
          }
        >
          Vì sao nên dùng {appConfig.name}?
        </h2>

        <div className={'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'}>
          {FEATURES.map((feature) => (
            <Card key={feature.title} className={'h-full'}>
              <CardHeader>
                <span
                  className={
                    'bg-primary/10 text-primary inline-flex h-10 w-10 items-center justify-center rounded-lg'
                  }
                >
                  <feature.icon className={'h-5 w-5'} aria-hidden={true} />
                </span>

                <CardTitle className={'mt-3 text-lg'}>
                  {feature.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
