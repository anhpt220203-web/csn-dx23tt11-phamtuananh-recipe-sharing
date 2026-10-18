import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import {
  ChefHat,
  Clock,
  Flame,
  Heart,
  Star,
  Timer,
  Users,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@kit/ui/breadcrumb';
import { Separator } from '@kit/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { cn } from '@kit/ui/utils';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type {
  RatingSummary,
  RecipeDetail,
  RecipeQuestionRow,
} from '~/lib/recipes/database';
import {
  getRatingSummary,
  getRecipeQuestions,
  getRecipeBySlug,
  getRelatedRecipes,
  getUserRating,
  isFavorite,
} from '~/lib/recipes/queries';
import { resolveRecipeImageSrc } from '~/lib/recipes/images';
import { MarkdownRenderer } from '~/components/markdown/markdown-renderer';

import { FavoriteButton } from '~/components/recipes/favorite-button';
import {
  QuestionForm,
  QuestionList,
} from '~/components/recipes/question-section';
import { RatingWidget } from '~/components/recipes/rating-widget';

type RecipePageProps = {
  params: Promise<{ slug: string }>;
};

// Trang đọc trạng thái đăng nhập theo từng request (nút yêu thích + đánh giá).

// Cho phép route "blocking" thay vì lỗi prerender với cacheComponents
// (dùng kèm `await connection()` trong component bên dưới).
export const instant = false;

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  await connection();

  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    return { title: 'Không tìm thấy công thức' };
  }

  return {
    title: recipe.title,
    description: recipe.description || `Cách làm ${recipe.title}.`,
  };
}

function formatCookTime(minutes: number | null): string {
  if (minutes === null || minutes === undefined) {
    return 'Chưa rõ';
  }

  if (minutes < 60) {
    return `${minutes} phút`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest > 0 ? `${hours} giờ ${rest} phút` : `${hours} giờ`;
}

export default async function RecipePage({ params }: RecipePageProps) {
  // Yêu cầu render động theo từng request (thay cho `dynamic = 'force-dynamic'`,
  // vốn không tương thích với cacheComponents của Next.js 16).
  await connection();

  const { slug } = await params;

  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  const related = await getRelatedRecipes(recipe, 3);

  const client = getSupabaseServerClient();
  const { data: claimsData } = await client.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  const [summary, favorited, userRating, questions] = await Promise.all([
    getRatingSummary(recipe.id),
    isFavorite(userId, recipe.id),
    getUserRating(userId, recipe.id),
    getRecipeQuestions(recipe.id),
  ]);

  return (
    <div className={'container mx-auto py-6 md:py-10'}>
      <RecipeBreadcrumb recipe={recipe} />

      {/* ── Tiêu đề + điểm đánh giá ───────────────────────── */}
      <header className={'mt-4'}>
        <div className={'flex flex-wrap items-center gap-2'}>
          <Link href={`/danh-muc/${recipe.category_slug}`}>
            <Badge>{recipe.category_name}</Badge>
          </Link>

          {recipe.difficulty ? (
            <Badge variant={'outline'}>{recipe.difficulty}</Badge>
          ) : null}

          {summary.count > 0 && summary.average !== null ? (
            <span
              className={
                'text-primary inline-flex items-center gap-1 text-sm font-medium'
              }
            >
              <Star className={'fill-primary h-4 w-4'} aria-hidden={true} />
              {summary.average.toFixed(1)}
              <span className={'text-muted-foreground font-normal'}>
                ({summary.count} đánh giá)
              </span>
            </span>
          ) : null}
        </div>

        <h1
          className={
            'font-heading mt-3 text-3xl font-bold tracking-tight md:text-4xl'
          }
        >
          {recipe.title}
        </h1>
      </header>

      {/* ── Ảnh + bảng thông số ──────────────────────────── */}
      <div className={'mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3'}>
        <div className={'lg:col-span-2'}>
          {resolveRecipeImageSrc(recipe.image_url) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveRecipeImageSrc(recipe.image_url) as string}
              alt={recipe.title}
              className={
                'aspect-[16/10] w-full rounded-2xl object-cover shadow-sm'
              }
            />
          ) : (
            <div
              className={cn(
                'flex aspect-[16/10] w-full items-center justify-center rounded-2xl',
                'bg-gradient-to-br from-amber-100 to-orange-200',
                'dark:from-amber-950 dark:to-orange-950',
              )}
              aria-hidden={true}
            >
              <ChefHat className={'h-16 w-16 text-orange-400'} />
            </div>
          )}
        </div>

        <aside className={'lg:col-span-1'}>
          <RecipeMetaCard recipe={recipe} favorited={favorited} />
        </aside>
      </div>

      {/* ── Điều hướng trong trang (kiểu anchor tab) ─────── */}
      <RecipeAnchorNav />

      {/* ── Nội dung chính + cột phải ────────────────────── */}
      <div className={'mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3'}>
        <div className={'lg:col-span-2'}>
          <section
            id={'mo-ta'}
            aria-labelledby={'desc-heading'}
            className={'scroll-mt-24'}
          >
            <h2
              id={'desc-heading'}
              className={'text-2xl font-bold tracking-tight'}
            >
              Mô tả
            </h2>

            {recipe.description ? (
              <MarkdownRenderer
                content={recipe.description}
                className={'mt-3 text-base'}
              />
            ) : (
              <p className={'text-muted-foreground mt-3'}>
                Chưa có mô tả cho công thức này.
              </p>
            )}

            {recipe.source_name || recipe.source_url ? (
              <p className={'text-muted-foreground mt-3 text-xs'}>
                Nguồn:{' '}
                {recipe.source_url ? (
                  <a
                    href={recipe.source_url}
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                    className={'underline'}
                  >
                    {recipe.source_name || recipe.source_url}
                  </a>
                ) : (
                  recipe.source_name
                )}
              </p>
            ) : null}
          </section>

          <Separator className={'my-8'} />

          <IngredientsSection recipe={recipe} />

          <Separator className={'my-8'} />

          <StepsSection recipe={recipe} />
        </div>

        <aside className={'flex flex-col gap-6 lg:col-span-1'}>
          <NutritionSidebar recipe={recipe} />
          <RelatedSidebar related={related} />
        </aside>
      </div>

      {/* ── Đánh giá & hỏi đáp ───────────────────────────── */}
      <div id={'danh-gia'} className={'scroll-mt-24'}>
        <FeedbackTabs
          recipe={recipe}
          summary={summary}
          userRating={userRating}
          questions={questions}
          isAuthenticated={userId !== null}
        />
      </div>
    </div>
  );
}

function RecipeBreadcrumb({ recipe }: { recipe: RecipeDetail }) {
  return (
    <Breadcrumb aria-label={'Điều hướng'}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href={'/'} />}>
            Trang chủ
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href={'/danh-muc'} />}>
            Danh mục
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbLink
            render={<Link href={`/danh-muc/${recipe.category_slug}`} />}
          >
            {recipe.category_name}
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbPage>{recipe.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/** Bảng thông số nổi bật kiểu tạp chí: khẩu phần · chuẩn bị · nấu · độ khó + nút lưu. */
function RecipeMetaCard({
  recipe,
  favorited,
}: {
  recipe: RecipeDetail;
  favorited: boolean;
}) {
  const stats = [
    {
      icon: Users,
      label: 'Khẩu phần',
      value: recipe.servings ? `${recipe.servings} người` : '—',
    },
    {
      icon: Timer,
      label: 'Chuẩn bị',
      value: formatCookTime(recipe.prep_time),
    },
    {
      icon: Clock,
      label: 'Thời gian nấu',
      value: formatCookTime(recipe.cook_time),
    },
    {
      icon: ChefHat,
      label: 'Độ khó',
      value: recipe.difficulty ?? '—',
    },
  ];

  return (
    <div
      className={cn(
        'bg-card text-card-foreground ring-foreground/10 rounded-2xl p-5 ring-1',
        'lg:sticky lg:top-20',
      )}
    >
      <dl className={'grid grid-cols-2 gap-x-4 gap-y-5'}>
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt
              className={
                'text-muted-foreground flex items-center gap-1.5 text-xs'
              }
            >
              <stat.icon className={'text-primary h-4 w-4'} aria-hidden={true} />
              {stat.label}
            </dt>
            <dd className={'mt-1 text-base font-semibold'}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className={'mt-5'}>
        <FavoriteButton
          recipeId={recipe.id}
          slug={recipe.slug}
          initialFavorited={favorited}
          className={'w-full'}
        />
      </div>
    </div>
  );
}

/** Thanh anchor điều hướng tới các mục trong trang, dính dưới header khi cuộn. */
function RecipeAnchorNav() {
  const anchors = [
    { href: '#mo-ta', label: 'Mô tả' },
    { href: '#nguyen-lieu', label: 'Nguyên liệu' },
    { href: '#cac-buoc', label: 'Các bước' },
    { href: '#dinh-duong', label: 'Dinh dưỡng' },
    { href: '#danh-gia', label: 'Đánh giá' },
  ];

  return (
    <nav
      aria-label={'Mục trong công thức'}
      className={
        'bg-background/95 ring-foreground/10 sticky top-14 z-10 mt-8 rounded-full px-2 py-2 ring-1 backdrop-blur'
      }
    >
      <ul className={'flex items-center gap-1 overflow-x-auto'}>
        {anchors.map((anchor) => (
          <li key={anchor.href}>
            <a
              href={anchor.href}
              className={
                'hover:bg-accent hover:text-accent-foreground inline-block rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors'
              }
            >
              {anchor.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function IngredientsSection({ recipe }: { recipe: RecipeDetail }) {
  return (
    <section
      id={'nguyen-lieu'}
      className={'scroll-mt-24'}
      aria-labelledby={'ingredients-heading'}
    >
      <h2
        id={'ingredients-heading'}
        className={'text-2xl font-bold tracking-tight'}
      >
        Nguyên liệu
      </h2>

      {recipe.servings ? (
        <p className={'text-muted-foreground mt-1 text-sm'}>
          Cho {recipe.servings} khẩu phần
        </p>
      ) : null}

      {recipe.ingredients.length === 0 ? (
        <p className={'text-muted-foreground mt-4 text-sm'}>
          Chưa có thông tin nguyên liệu.
        </p>
      ) : (
        <ul
          className={
            'mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2'
          }
        >
          {recipe.ingredients.map((ingredient, index) => (
            <li
              key={index}
              className={'flex items-start gap-3 border-b pb-3 text-sm'}
            >
              <span
                className={
                  'bg-primary/10 text-primary mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold'
                }
                aria-hidden={true}
              >
                {index + 1}
              </span>
              <span>{ingredient}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StepsSection({ recipe }: { recipe: RecipeDetail }) {
  return (
    <section
      id={'cac-buoc'}
      className={'scroll-mt-24'}
      aria-labelledby={'steps-heading'}
    >
      <h2
        id={'steps-heading'}
        className={'text-2xl font-bold tracking-tight'}
      >
        Các bước thực hiện
      </h2>

      {recipe.steps.length === 0 ? (
        <p className={'text-muted-foreground mt-4 text-sm'}>
          Chưa có hướng dẫn các bước cho công thức này.
        </p>
      ) : (
        <ol className={'mt-6 space-y-5'}>
          {recipe.steps.map((step, index) => (
            <li
              key={index}
              className={'flex items-start gap-4 rounded-xl p-3'}
            >
              <span
                className={cn(
                  'bg-primary text-primary-foreground inline-flex h-9 w-9 shrink-0 items-center justify-center',
                  'rounded-full text-sm font-bold shadow-sm',
                )}
                aria-hidden={true}
              >
                {index + 1}
              </span>
              <MarkdownRenderer content={step} className={'mt-1'} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** Cột phải: thẻ dinh dưỡng gọn (mở sẵn) thay cho details thu gọn giữa trang. */
function NutritionSidebar({ recipe }: { recipe: RecipeDetail }) {
  const items: { label: string; value: number | null; unit: string }[] = [
    { label: 'Năng lượng', value: recipe.calories, unit: 'kcal' },
    { label: 'Chất đạm', value: recipe.protein_g, unit: 'g' },
    { label: 'Tinh bột', value: recipe.carbs_g, unit: 'g' },
    { label: 'Đường', value: recipe.sugar_g, unit: 'g' },
    { label: 'Chất béo', value: recipe.fat_g, unit: 'g' },
    { label: 'Chất xơ', value: recipe.fiber_g, unit: 'g' },
  ].filter((item) => item.value !== null);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      id={'dinh-duong'}
      className={
        'bg-card text-card-foreground ring-foreground/10 scroll-mt-24 rounded-2xl p-5 ring-1'
      }
    >
      <h3 className={'flex items-center gap-2 font-semibold'}>
        <Flame className={'text-primary h-5 w-5'} aria-hidden={true} />
        Giá trị dinh dưỡng
      </h3>

      <dl className={'mt-4 grid grid-cols-2 gap-3'}>
        {items.map((item) => (
          <div
            key={item.label}
            className={'bg-muted/50 rounded-lg px-3 py-2.5 text-center'}
          >
            <dt className={'text-muted-foreground text-xs'}>{item.label}</dt>
            <dd className={'mt-0.5 text-sm font-semibold tabular-nums'}>
              {item.value} {item.unit}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Cột phải: công thức liên quan dạng danh sách gọn. */
function RelatedSidebar({
  related,
}: {
  related: Awaited<ReturnType<typeof getRelatedRecipes>>;
}) {
  if (related.length === 0) {
    return null;
  }

  return (
    <div
      className={
        'bg-card text-card-foreground ring-foreground/10 rounded-2xl p-5 ring-1'
      }
    >
      <h3 className={'font-semibold'}>Công thức cùng nhóm</h3>

      <ul className={'mt-4 space-y-4'}>
        {related.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/cong-thuc/${item.slug}`}
              className={
                'group flex items-center gap-3 rounded-xl transition-colors hover:bg-accent/50 p-1.5'
              }
            >
              {resolveRecipeImageSrc(item.image_url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveRecipeImageSrc(item.image_url) as string}
                  alt={item.title}
                  loading={'lazy'}
                  className={
                    'h-14 w-14 shrink-0 rounded-lg object-cover'
                  }
                />
              ) : (
                <span
                  className={cn(
                    'flex h-14 w-14 shrink-0 items-center justify-center rounded-lg',
                    'bg-gradient-to-br from-orange-100 to-amber-200',
                    'dark:from-orange-950 dark:to-amber-950',
                  )}
                  aria-hidden={true}
                >
                  <ChefHat className={'h-6 w-6 text-orange-400'} />
                </span>
              )}

              <span className={'min-w-0'}>
                <span
                  className={
                    'line-clamp-2 text-sm font-medium group-hover:text-primary'
                  }
                >
                  {item.title}
                </span>

                <span
                  className={
                    'text-muted-foreground mt-0.5 flex items-center gap-2 text-xs'
                  }
                >
                  {item.servings ? (
                    <span className={'inline-flex items-center gap-1'}>
                      <Users className={'h-3 w-3'} aria-hidden={true} />
                      {item.servings}
                    </span>
                  ) : null}
                  <span className={'inline-flex items-center gap-1'}>
                    <Clock className={'h-3 w-3'} aria-hidden={true} />
                    {formatCookTime(item.cook_time)}
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div
        className={
          'text-muted-foreground mt-4 flex items-center gap-1.5 text-xs'
        }
      >
        <Heart className={'h-3.5 w-3.5'} aria-hidden={true} />
        Thử ngay một món cùng nhóm nhé!
      </div>
    </div>
  );
}

function FeedbackTabs({
  recipe,
  summary,
  userRating,
  questions,
  isAuthenticated,
}: {
  recipe: RecipeDetail;
  summary: RatingSummary;
  userRating: number | null;
  questions: RecipeQuestionRow[];
  isAuthenticated: boolean;
}) {
  return (
    <section className={'mt-12'} aria-label={'Đánh giá và hỏi đáp'}>
      <Separator className={'mb-8'} />

      <Tabs defaultValue={'rating'}>
        <TabsList>
          <TabsTrigger value={'rating'}>Đánh giá</TabsTrigger>
          <TabsTrigger value={'qa'}>
            Hỏi đáp
            {questions.length > 0 ? ` (${questions.length})` : ''}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={'rating'} className={'mt-4'}>
          <RatingWidget
            recipeId={recipe.id}
            slug={recipe.slug}
            summary={summary}
            userRating={userRating}
            isAuthenticated={isAuthenticated}
          />
        </TabsContent>

        <TabsContent value={'qa'} className={'mt-4'}>
          <div className={'grid gap-8'}>
            <div>
              <h3 className={'mb-4 text-lg font-medium'}>Câu hỏi từ cộng đồng</h3>
              <QuestionList questions={questions} />
            </div>

            <div>
              <h3 className={'mb-4 text-lg font-medium'}>Đặt câu hỏi mới</h3>
              <QuestionForm
                recipeId={recipe.id}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
