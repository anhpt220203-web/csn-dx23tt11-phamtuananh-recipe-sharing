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
import { cn } from '@kit/ui/utils';

import { RecipeCard } from '~/components/recipes/recipe-card';
import { SearchForm } from '~/components/recipes/search-form';
import { BannerCarousel } from '~/components/content/banner-carousel';
import appConfig from '~/config/app.config';
import {
  getCategories,
  getLatestRecipes,
  getTopRatedRecipes,
} from '~/lib/recipes/queries';
import { getActiveBanners, getPublishedTips } from '~/lib/content/queries';
import { getFavoriteRecipeIds } from '~/lib/recipes/favorites';

import type { CategoryRow } from '~/lib/recipes/database';

// Trang chủ đọc dữ liệu mới mỗi request (DB Supabase) — cho phép route
// "blocking" thay vì lỗi/diagnostic prerender với cacheComponents của Next 16.
export const instant = false;

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

/** Đầu dòng của mỗi section: tiêu đề + mô tả + link "Xem tất cả". */
function SectionHeader({
  title,
  strong,
  description,
  href,
  linkLabel,
}: {
  title: string;
  strong?: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className={'mb-6 flex items-end justify-between gap-4'}>
      <div>
        <h2 className={'text-2xl font-bold tracking-tight sm:text-3xl'}>
          {title}{' '}
          {strong ? <span className={'text-primary'}>{strong}</span> : null}
        </h2>
        <p className={'text-muted-foreground mt-1 text-sm sm:text-base'}>
          {description}
        </p>
      </div>

      <Button
        variant={'ghost'}
        nativeButton={false}
        render={<Link href={href} />}
        className={'hidden shrink-0 sm:inline-flex'}
      >
        {linkLabel}
        <ArrowRight className={'h-4 w-4'} aria-hidden={true} />
      </Button>
    </div>
  );
}

export default async function HomePage() {
  // Trang chủ đọc dữ liệu mới mỗi request để luôn phản ánh DB hiện tại.
  // (Dùng `connection()` thay cho `dynamic = 'force-dynamic'`, vốn không
  // tương thích với `cacheComponents` của Next 16.)
  await connection();

  const [categories, latestRecipes, topRated, banners, tips] =
    await Promise.all([
      getCategories(),
      getLatestRecipes(8),
      getTopRatedRecipes(4),
      getActiveBanners(),
      getPublishedTips(2),
    ]);

  // Trạng thái yêu thích ban đầu cho nút trái tim trên thẻ công thức.
  const favoriteIds = await getFavoriteRecipeIds(
    [...latestRecipes, ...topRated].map((recipe) => recipe.id),
  );

  return (
    <div className={'flex flex-col'}>
      {/* ── Banner carousel ──────────────────────────────── */}
      {banners.length > 0 ? (
        <section className={'container mx-auto px-4 pt-6'}>
          <BannerCarousel banners={banners} />
        </section>
      ) : null}

      {/* ── Hero: tìm kiếm là trung tâm ──────────────────── */}
      <section
        className={
          'bg-gradient-to-b from-orange-100/80 via-amber-50 to-background dark:from-orange-950/40 dark:via-amber-950/20'
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
            Hôm nay ăn gì? Khám phá{' '}
            <span className={'text-primary'}>công thức Việt</span> ngon đúng
            điệu
          </h1>

          <p className={'text-muted-foreground max-w-xl text-base sm:text-lg'}>
            Từ phở bò Hà Nội đến bánh xèo miền Trung — hàng chục công thức chi
            tiết, dễ làm theo, kèm ảnh minh họa từng món.
          </p>

          <div className={'w-full max-w-2xl'}>
            <SearchForm categories={categories} />
          </div>

          {/* Tìm kiếm theo nhóm món — chip điều hướng nhanh kiểu "tìm kiếm phổ biến" */}
          <nav
            aria-label={'Tìm kiếm theo nhóm món'}
            className={'flex flex-wrap items-center justify-center gap-2'}
          >
            <span
              className={'text-muted-foreground text-xs font-medium uppercase'}
            >
              Tìm theo nhóm:
            </span>

            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.slug}
                href={`/danh-muc/${category.slug}`}
                className={
                  'bg-card ring-foreground/10 text-sm ring-1 transition-colors rounded-full px-3 py-1.5 hover:bg-accent hover:text-accent-foreground'
                }
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* ── Nhóm món ─────────────────────────────────────── */}
      <section className={'container mx-auto px-4 py-10 sm:py-14'}>
        <SectionHeader
          title={'Nhóm món ăn'}
          description={'Chọn một nhóm món để bắt đầu khám phá.'}
          href={'/danh-muc'}
          linkLabel={'Xem tất cả'}
        />

        {categories.length === 0 ? (
          <p className={'text-muted-foreground'}>
            Chưa có danh mục nào. Vui lòng quay lại sau.
          </p>
        ) : (
          <div
            className={'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'}
          >
            {categories.map((category, index) => (
              <CategoryCard
                key={category.slug}
                category={category}
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Công thức mới nhất ───────────────────────────── */}
      <section className={'bg-muted/40 border-y'}>
        <div className={'container mx-auto px-4 py-10 sm:py-14'}>
          <SectionHeader
            title={'Công thức'}
            strong={'mới nhất'}
            description={`Những món ăn vừa được cập nhật trên ${appConfig.name}.`}
            href={'/tim-kiem'}
            linkLabel={'Tìm món khác'}
          />

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

      {/* ── Được đánh giá cao nhất ───────────────────────── */}
      {topRated.length > 0 ? (
        <section className={'container mx-auto px-4 py-10 sm:py-14'}>
          <SectionHeader
            title={'Được'}
            strong={'đánh giá cao nhất'}
            description={
              'Những món ăn được cộng đồng chấm điểm cao qua trải nghiệm thực tế.'
            }
            href={'/tim-kiem?sort=danh-gia-cao'}
            linkLabel={'Xem thêm'}
          />

          <div
            className={'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'}
          >
            {topRated.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                rating={recipe.rating}
                initialFavorited={favoriteIds.has(recipe.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Mẹo vặt ──────────────────────────────────────── */}
      {tips.length > 0 ? (
        <section className={'container mx-auto px-4 py-10 sm:py-14'}>
          <SectionHeader
            title={'Mẹo vặt'}
            description={'Bí quyết nấu ăn ngon mỗi ngày.'}
            href={'/meo-vat'}
            linkLabel={'Xem bí quyết'}
          />

          <div className={'grid grid-cols-1 gap-4 sm:grid-cols-2'}>
            {tips.map((tip) => (
              <Link
                key={tip.slug}
                href={`/meo-vat/${tip.slug}`}
                className={'block h-full'}
              >
                <Card
                  className={'h-full transition-shadow hover:shadow-md'}
                >
                  {tip.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tip.image_url}
                      alt={tip.title}
                      loading={'lazy'}
                      className={'aspect-[16/9] w-full object-cover'}
                    />
                  ) : null}

                  <CardHeader>
                    <CardTitle className={'text-lg leading-snug'}>
                      {tip.title}
                    </CardTitle>
                  </CardHeader>

                  {tip.excerpt ? (
                    <CardContent>
                      <CardDescription className={'line-clamp-2'}>
                        {tip.excerpt}
                      </CardDescription>
                    </CardContent>
                  ) : null}
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

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

/** Card nhóm món: avatar gradient chữ cái đầu + tên + mô tả ngắn. */
function CategoryCard({
  category,
  index,
}: {
  category: CategoryRow;
  index: number;
}) {
  const gradients = [
    'from-orange-400 to-red-400',
    'from-amber-400 to-orange-500',
    'from-lime-500 to-emerald-500',
    'from-teal-400 to-cyan-500',
    'from-rose-400 to-pink-500',
    'from-violet-400 to-purple-500',
    'from-yellow-400 to-amber-500',
  ] as const;

  return (
    <Link href={`/danh-muc/${category.slug}`} className={'block h-full'}>
      <Card
        className={cn(
          'h-full gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg',
        )}
      >
        <CardHeader>
          <span
            className={cn(
              'inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold text-white shadow-sm',
              gradients[index % gradients.length],
            )}
            aria-hidden={true}
          >
            {category.name.charAt(0).toUpperCase()}
          </span>

          <CardTitle className={'mt-2 text-base font-semibold'}>
            {category.name}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <CardDescription className={'line-clamp-2'}>
            {category.description || 'Xem các công thức trong nhóm này.'}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
