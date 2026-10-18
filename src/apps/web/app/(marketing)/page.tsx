import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';

import {
  ArrowRight,
  ChefHat,
  Clock,
  Flame,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { cn } from '@kit/ui/utils';

import { BannerCarousel } from '~/components/content/banner-carousel';
import { RecipeCard } from '~/components/recipes/recipe-card';
import { SearchForm } from '~/components/recipes/search-form';
import appConfig from '~/config/app.config';
import { getActiveBanners, getPublishedTips } from '~/lib/content/queries';
import {
  getFavoriteRecipeIds,
  getRecipeFavoriteCounts,
} from '~/lib/recipes/favorites';
import { resolveRecipeImageSrc } from '~/lib/recipes/images';
import {
  getCategories,
  getLatestRecipes,
  getTopRatedRecipes,
} from '~/lib/recipes/queries';

export const instant = false;

export const metadata: Metadata = {
  title: 'Trang chủ',
  description:
    'Khám phá hàng chục công thức nấu ăn Việt Nam: món chính, món canh, món chay, món ăn vặt, đồ uống và nhiều hơn nữa.',
};

/** Định nghĩa icon và màu sắc cho từng nhóm món ăn */
const CATEGORY_META: Record<
  string,
  { icon: string; bg: string; border: string }
> = {
  'mon-chinh': {
    icon: '🍲',
    bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    border: 'hover:border-orange-500/40',
  },
  'mon-canh': {
    icon: '🥣',
    bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    border: 'hover:border-amber-500/40',
  },
  'salad-goi': {
    icon: '🥗',
    bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    border: 'hover:border-emerald-500/40',
  },
  'mon-chay': {
    icon: '🥬',
    bg: 'bg-green-500/10 text-green-600 dark:text-green-400',
    border: 'hover:border-green-500/40',
  },
  'an-vat': {
    icon: '🍢',
    bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    border: 'hover:border-rose-500/40',
  },
  'do-uong': {
    icon: '🍹',
    bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    border: 'hover:border-cyan-500/40',
  },
  'trang-mieng': {
    icon: '🍨',
    bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    border: 'hover:border-purple-500/40',
  },
};

function formatCookTime(minutes: number | null): string {
  if (minutes === null || minutes === undefined) {
    return 'Chưa rõ';
  }
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}m` : `${hours} giờ`;
}

/** Đầu dòng của mỗi section: tiêu đề + mô tả + link "Xem tất cả" */
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
  await connection();

  const [categories, latestRecipes, topRated, banners, tips] =
    await Promise.all([
      getCategories(),
      getLatestRecipes(8),
      getTopRatedRecipes(4),
      getActiveBanners(),
      getPublishedTips(3),
    ]);

  const allRecipeIds = [...latestRecipes, ...topRated].map(
    (recipe) => recipe.id,
  );

  const [favoriteIds, favoriteCounts] = await Promise.all([
    getFavoriteRecipeIds(allRecipeIds),
    getRecipeFavoriteCounts(allRecipeIds),
  ]);

  // Chọn món nổi bật để làm Spotlight trong Hero: ưu tiên top rated, fallback sang latest
  const featuredRecipe = topRated[0] ?? latestRecipes[0];

  return (
    <div className={'flex flex-col'}>
      {/* ── Banner Carousel (nếu có dữ liệu trong DB) ────── */}
      {banners.length > 0 ? (
        <section className={'container mx-auto px-4 pt-6'}>
          <BannerCarousel banners={banners} />
        </section>
      ) : null}

      {/* ── Hero Section (Split View hiện đại & Spotlight Card) ── */}
      <section
        className={cn(
          'relative overflow-hidden border-b',
          'bg-gradient-to-b from-orange-100/70 via-amber-50/50 to-background',
          'dark:from-orange-950/30 dark:via-amber-950/15 dark:to-background',
        )}
      >
        {/* Họa tiết ánh sáng mờ phía nền */}
        <div
          className={
            'pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-orange-400/20 blur-3xl'
          }
          aria-hidden={true}
        />
        <div
          className={
            'pointer-events-none absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl'
          }
          aria-hidden={true}
        />

        <div className={'container mx-auto px-4 py-10 sm:py-16 lg:py-20'}>
          <div className={'grid grid-cols-1 items-center gap-12 lg:grid-cols-12'}>
            {/* Cột trái: Tiêu đề + Form tìm kiếm + Thẻ thống kê */}
            <div className={'flex flex-col gap-6 lg:col-span-7'}>
              <div className={'flex items-center gap-2'}>
                <span
                  className={
                    'inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-xs'
                  }
                >
                  <Sparkles className={'h-3.5 w-3.5'} aria-hidden={true} />
                  <span>Ẩm thực Việt — Nấu ngon mỗi ngày</span>
                </span>
              </div>

              <h1
                className={
                  'text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:leading-[1.15]'
                }
              >
                Hôm nay ăn gì? Khám phá{' '}
                <span className={'bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'}>
                  công thức Việt
                </span>{' '}
                ngon đúng điệu
              </h1>

              <p className={'text-muted-foreground text-base sm:text-lg leading-relaxed'}>
                Từ bát phở bò Hà Nội thanh tao, bánh xèo miền Trung giòn rụm đến
                canh chua cá lóc miền Tây — công thức chi tiết, định lượng chuẩn và mẹo hay cho mọi gian bếp.
              </p>

              {/* Hộp tìm kiếm nổi bật kiểu Floating Card */}
              <div
                className={
                  'rounded-2xl border border-border/80 bg-card/95 p-2 shadow-lg backdrop-blur-md'
                }
              >
                <SearchForm categories={categories} />
              </div>

              {/* Gợi ý tìm kiếm phổ biến */}
              <div className={'flex flex-wrap items-center gap-2 pt-1'}>
                <span className={'text-muted-foreground text-xs font-medium'}>
                  Gợi ý món ngon:
                </span>
                {[
                  'Phở bò',
                  'Bún bò Huế',
                  'Canh chua',
                  'Bánh xèo',
                  'Gà chiên',
                  'Món chay',
                  'Sườn ram',
                ].map((item) => (
                  <Link
                    key={item}
                    href={`/tim-kiem?q=${encodeURIComponent(item)}`}
                    className={
                      'rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary'
                    }
                  >
                    {item}
                  </Link>
                ))}
              </div>

              {/* 3 Thống kê nhanh tạo niềm tin */}
              <div className={'mt-2 grid grid-cols-3 gap-4 border-t border-border/40 pt-5'}>
                <div>
                  <div className={'text-2xl font-black text-foreground sm:text-3xl'}>
                    30+
                  </div>
                  <div className={'text-muted-foreground text-xs font-medium sm:text-sm'}>
                    Công thức chuẩn vị
                  </div>
                </div>

                <div>
                  <div className={'text-2xl font-black text-primary sm:text-3xl'}>
                    100%
                  </div>
                  <div className={'text-muted-foreground text-xs font-medium sm:text-sm'}>
                    Dễ làm tại nhà
                  </div>
                </div>

                <div>
                  <div className={'flex items-center gap-1 text-2xl font-black text-amber-500 sm:text-3xl'}>
                    4.9 <Star className={'h-5 w-5 fill-amber-500 text-amber-500'} />
                  </div>
                  <div className={'text-muted-foreground text-xs font-medium sm:text-sm'}>
                    Đánh giá yêu thích
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Card món ngon nổi bật (Hero Spotlight Card) */}
            <div className={'lg:col-span-5'}>
              {featuredRecipe ? (
                <div className={'group relative mx-auto max-w-md lg:max-w-none'}>
                  {/* Hiệu ứng ánh sáng nền sau card */}
                  <div
                    className={
                      'absolute -inset-2 rounded-3xl bg-gradient-to-r from-orange-500/25 via-amber-500/25 to-red-500/25 opacity-75 blur-xl transition duration-500 group-hover:opacity-100'
                    }
                    aria-hidden={true}
                  />

                  <div
                    className={
                      'relative overflow-hidden rounded-3xl border border-border/60 bg-card/95 p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl'
                    }
                  >
                    <div
                      className={
                        'relative aspect-[16/10] w-full overflow-hidden rounded-2xl'
                      }
                    >
                      {resolveRecipeImageSrc(featuredRecipe.image_url) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            resolveRecipeImageSrc(
                              featuredRecipe.image_url,
                            ) as string
                          }
                          alt={featuredRecipe.title}
                          className={
                            'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                          }
                        />
                      ) : (
                        <div
                          className={
                            'flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-950 dark:to-orange-950'
                          }
                        >
                          <ChefHat className={'h-16 w-16 text-orange-400'} />
                        </div>
                      )}

                      <div
                        className={
                          'absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-md'
                        }
                      >
                        <Sparkles className={'h-3.5 w-3.5 text-amber-300'} />
                        <span>Món ngon nổi bật</span>
                      </div>

                      {featuredRecipe.category_name ? (
                        <span
                          className={
                            'bg-primary text-primary-foreground absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm'
                          }
                        >
                          {featuredRecipe.category_name}
                        </span>
                      ) : null}
                    </div>

                    <div className={'p-2 pt-4'}>
                      <div
                        className={
                          'text-muted-foreground flex items-center gap-4 text-xs'
                        }
                      >
                        <span className={'inline-flex items-center gap-1 font-medium'}>
                          <Clock className={'text-primary h-3.5 w-3.5'} />
                          {formatCookTime(featuredRecipe.cook_time)}
                        </span>
                        <span className={'inline-flex items-center gap-1'}>
                          <Flame className={'h-3.5 w-3.5 text-orange-500'} />
                          {featuredRecipe.difficulty ?? 'Dễ'}
                        </span>
                        {featuredRecipe.servings ? (
                          <span className={'inline-flex items-center gap-1'}>
                            <Users className={'h-3.5 w-3.5'} />
                            {featuredRecipe.servings} người
                          </span>
                        ) : null}
                      </div>

                      <h3
                        className={
                          'group-hover:text-primary mt-2.5 text-xl font-bold tracking-tight line-clamp-1 transition-colors'
                        }
                      >
                        {featuredRecipe.title}
                      </h3>

                      {featuredRecipe.description ? (
                        <p
                          className={
                            'text-muted-foreground mt-1.5 text-sm line-clamp-2 leading-relaxed'
                          }
                        >
                          {featuredRecipe.description}
                        </p>
                      ) : null}

                      <div
                        className={
                          'mt-4 flex items-center justify-between border-t pt-3.5'
                        }
                      >
                        <span className={'text-muted-foreground text-xs font-medium'}>
                          Công thức chuẩn vị Việt
                        </span>

                        <Button
                          size={'sm'}
                          className={'group/btn gap-1.5 shadow-sm'}
                          nativeButton={false}
                          render={
                            <Link href={`/cong-thuc/${featuredRecipe.slug}`} />
                          }
                        >
                          <span>Xem công thức</span>
                          <ArrowRight
                            className={
                              'h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5'
                            }
                          />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ── Nhóm món ăn trực quan (Visual Category Badges) ── */}
      <section className={'container mx-auto px-4 py-12 sm:py-16'}>
        <SectionHeader
          title={'Khám phá theo'}
          strong={'nhóm món'}
          description={'Chọn danh mục để tìm kiếm cảm hứng nấu nướng cho bữa ăn hôm nay.'}
          href={'/danh-muc'}
          linkLabel={'Xem tất cả danh mục'}
        />

        {categories.length === 0 ? (
          <p className={'text-muted-foreground'}>
            Chưa có danh mục nào. Vui lòng quay lại sau.
          </p>
        ) : (
          <div
            className={
              'grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
            }
          >
            {categories.map((category) => {
              const meta = CATEGORY_META[category.slug] ?? {
                icon: '🍽️',
                bg: 'bg-primary/10 text-primary',
                border: 'hover:border-primary/40',
              };

              return (
                <Link
                  key={category.slug}
                  href={`/danh-muc/${category.slug}`}
                  className={cn(
                    'group relative flex flex-col items-center rounded-2xl border bg-card p-4 text-center transition-all duration-200',
                    'hover:-translate-y-1 hover:bg-accent/40 hover:shadow-md',
                    meta.border,
                  )}
                >
                  <span
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-xs transition-transform duration-300 group-hover:scale-110',
                      meta.bg,
                    )}
                  >
                    {meta.icon}
                  </span>

                  <span
                    className={
                      'group-hover:text-primary mt-3 text-sm font-semibold line-clamp-1 transition-colors'
                    }
                  >
                    {category.name}
                  </span>

                  <span
                    className={
                      'text-muted-foreground mt-0.5 flex items-center gap-0.5 text-xs opacity-75 transition-opacity group-hover:opacity-100'
                    }
                  >
                    Khám phá{' '}
                    <ArrowRight className={'h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5'} />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Công thức mới nhất ───────────────────────────── */}
      <section className={'border-y bg-muted/30 py-12 sm:py-16'}>
        <div className={'container mx-auto px-4'}>
          <SectionHeader
            title={'Công thức'}
            strong={'mới cập nhật'}
            description={`Những món ăn vừa được thêm vào thư viện ${appConfig.name}.`}
            href={'/tim-kiem'}
            linkLabel={'Xem thêm món khác'}
          />

          {latestRecipes.length === 0 ? (
            <p className={'text-muted-foreground'}>
              Chưa có công thức nào. Vui lòng quay lại sau.
            </p>
          ) : (
            <div
              className={'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'}
            >
              {latestRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  initialFavorited={favoriteIds.has(recipe.id)}
                  initialFavoriteCount={favoriteCounts.get(recipe.id) ?? 0}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Bộ sưu tập Ẩm thực 3 Miền ────────────────────── */}
      <section className={'container mx-auto px-4 py-12 sm:py-16'}>
        <div className={'mb-8'}>
          <span className={'text-primary text-xs font-bold tracking-wider uppercase'}>
            Bản sắc truyền thống
          </span>
          <h2 className={'mt-1 text-2xl font-bold tracking-tight sm:text-3xl'}>
            Khám phá hương vị <span className={'text-primary'}>3 miền</span>
          </h2>
          <p className={'text-muted-foreground mt-1 text-sm sm:text-base'}>
            Mỗi vùng miền mang một nét đặc trưng riêng, làm nên sự phong phú của ẩm thực Việt Nam.
          </p>
        </div>

        <div className={'grid grid-cols-1 gap-6 md:grid-cols-3'}>
          {/* Miền Bắc */}
          <Link
            href={'/tim-kiem?q=Ha+Noi'}
            className={
              'group relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-lg'
            }
          >
            <div className={'flex items-center justify-between'}>
              <span className={'text-3xl'}>🥢</span>
              <span
                className={
                  'rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400'
                }
              >
                Vị thanh tao
              </span>
            </div>

            <h3
              className={
                'group-hover:text-primary mt-4 text-xl font-bold tracking-tight transition-colors'
              }
            >
              Ẩm thực Miền Bắc
            </h3>

            <p className={'text-muted-foreground mt-2 text-sm leading-relaxed'}>
              Đề cao sự thanh nhã, vừa vặn và hương vị mộc mạc: Phở bò Hà Nội, Bún chả, Chả cá Lã Vọng.
            </p>

            <div className={'text-primary mt-6 flex items-center gap-1 text-xs font-semibold'}>
              <span>Khám phá món Bắc</span>
              <ArrowRight className={'h-3.5 w-3.5 transition-transform group-hover:translate-x-1'} />
            </div>
          </Link>

          {/* Miền Trung */}
          <Link
            href={'/tim-kiem?q=Hue'}
            className={
              'group relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-red-500/10 via-rose-500/5 to-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40 hover:shadow-lg'
            }
          >
            <div className={'flex items-center justify-between'}>
              <span className={'text-3xl'}>🌶️</span>
              <span
                className={
                  'rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-400'
                }
              >
                Đậm đà cay nồng
              </span>
            </div>

            <h3
              className={
                'group-hover:text-primary mt-4 text-xl font-bold tracking-tight transition-colors'
              }
            >
              Ẩm thực Miền Trung
            </h3>

            <p className={'text-muted-foreground mt-2 text-sm leading-relaxed'}>
              Gia vị cay nồng quyến rũ, màu sắc rực rỡ và chiều sâu văn hóa: Bún bò Huế, Bánh xèo, Mì Quảng.
            </p>

            <div className={'text-primary mt-6 flex items-center gap-1 text-xs font-semibold'}>
              <span>Khám phá món Trung</span>
              <ArrowRight className={'h-3.5 w-3.5 transition-transform group-hover:translate-x-1'} />
            </div>
          </Link>

          {/* Miền Nam */}
          <Link
            href={'/tim-kiem?q=mien+tay'}
            className={
              'group relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg'
            }
          >
            <div className={'flex items-center justify-between'}>
              <span className={'text-3xl'}>🥥</span>
              <span
                className={
                  'rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400'
                }
              >
                Phóng khoáng & Ngọt lành
              </span>
            </div>

            <h3
              className={
                'group-hover:text-primary mt-4 text-xl font-bold tracking-tight transition-colors'
              }
            >
              Ẩm thực Miền Nam
            </h3>

            <p className={'text-muted-foreground mt-2 text-sm leading-relaxed'}>
              Đặc sản vùng sông nước với hương dừa béo bùi và vị ngọt tự nhiên: Canh chua cá lóc, Cá kho tộ.
            </p>

            <div className={'text-primary mt-6 flex items-center gap-1 text-xs font-semibold'}>
              <span>Khám phá món Nam</span>
              <ArrowRight className={'h-3.5 w-3.5 transition-transform group-hover:translate-x-1'} />
            </div>
          </Link>
        </div>
      </section>

      {/* ── Được đánh giá cao nhất ───────────────────────── */}
      {topRated.length > 0 ? (
        <section className={'border-t bg-muted/20 py-12 sm:py-16'}>
          <div className={'container mx-auto px-4'}>
            <SectionHeader
              title={'Món ngon'}
              strong={'được đánh giá cao nhất'}
              description={
                'Những món ăn được cộng đồng chấm điểm cao qua trải nghiệm thực tế tại gian bếp.'
              }
              href={'/tim-kiem?sort=danh-gia-cao'}
              linkLabel={'Xem thêm'}
            />

            <div
              className={'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'}
            >
              {topRated.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  rating={recipe.rating}
                  initialFavorited={favoriteIds.has(recipe.id)}
                  initialFavoriteCount={favoriteCounts.get(recipe.id) ?? 0}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Mẹo vặt & Bí quyết bếp núc ───────────────────── */}
      {tips.length > 0 ? (
        <section className={'container mx-auto px-4 py-12 sm:py-16'}>
          <SectionHeader
            title={'Mẹo vặt &'}
            strong={'bí quyết nhà bếp'}
            description={'Những mẹo nhỏ hữu ích giúp việc nấu nướng trở nên dễ dàng và thú vị hơn.'}
            href={'/meo-vat'}
            linkLabel={'Xem tất cả bài viết'}
          />

          <div className={'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'}>
            {tips.map((tip) => (
              <Link
                key={tip.slug}
                href={`/meo-vat/${tip.slug}`}
                className={'group block h-full'}
              >
                <Card
                  className={
                    'h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
                  }
                >
                  {tip.image_url ? (
                    <div className={'relative aspect-[16/9] w-full overflow-hidden'}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tip.image_url}
                        alt={tip.title}
                        loading={'lazy'}
                        className={
                          'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                        }
                      />
                    </div>
                  ) : null}

                  <CardHeader>
                    <CardTitle
                      className={
                        'group-hover:text-primary text-lg leading-snug transition-colors line-clamp-2'
                      }
                    >
                      {tip.title}
                    </CardTitle>
                  </CardHeader>

                  {tip.excerpt ? (
                    <CardContent>
                      <CardDescription className={'line-clamp-2'}>
                        {tip.excerpt}
                      </CardDescription>

                      <div className={'text-primary mt-4 flex items-center gap-1 text-xs font-semibold'}>
                        <span>Đọc tiếp</span>
                        <ArrowRight className={'h-3 w-3 transition-transform group-hover:translate-x-1'} />
                      </div>
                    </CardContent>
                  ) : null}
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Community Banner (CTA) ───────────────────────── */}
      <section className={'container mx-auto px-4 pb-16 pt-4'}>
        <div
          className={
            'relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 px-6 py-10 text-white shadow-xl sm:px-12 sm:py-14'
          }
        >
          {/* Họa tiết ánh sáng trang trí */}
          <div
            className={
              'pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl'
            }
            aria-hidden={true}
          />
          <div
            className={
              'pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-black/10 blur-2xl'
            }
            aria-hidden={true}
          />

          <div className={'relative max-w-2xl'}>
            <span
              className={
                'inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm'
              }
            >
              <ChefHat className={'h-3.5 w-3.5'} aria-hidden={true} />
              Cộng đồng yêu bếp Việt
            </span>

            <h2
              className={
                'mt-3.5 text-2xl font-black tracking-tight sm:text-4xl leading-tight'
              }
            >
              Lưu giữ và chia sẻ niềm đam mê ẩm thực của bạn
            </h2>

            <p className={'mt-2 text-white/90 text-sm sm:text-base leading-relaxed'}>
              Tạo tài khoản miễn phí để lưu công thức yêu thích, chấm điểm sao, đặt câu hỏi cho cộng đồng và nhận gợi ý món ngon mỗi ngày.
            </p>

            <div className={'mt-6 flex flex-wrap items-center gap-3'}>
              <Button
                size={'lg'}
                variant={'secondary'}
                className={'font-semibold text-orange-950 shadow-md hover:bg-white'}
                nativeButton={false}
                render={<Link href={'/auth/sign-up'} />}
              >
                Đăng ký miễn phí
              </Button>

              <Button
                size={'lg'}
                variant={'outline'}
                className={'border-white/40 text-white hover:bg-white/10'}
                nativeButton={false}
                render={<Link href={'/danh-muc'} />}
              >
                Khám phá danh mục món
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
