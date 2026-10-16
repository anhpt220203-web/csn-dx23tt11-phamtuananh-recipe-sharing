import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { ChefHat, Clock, Users } from 'lucide-react';

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

import { FavoriteButton } from '~/components/recipes/favorite-button';
import {
  QuestionForm,
  QuestionList,
} from '~/components/recipes/question-section';
import { RatingWidget } from '~/components/recipes/rating-widget';
import { RecipeCard } from '~/components/recipes/recipe-card';

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

  const related = await getRelatedRecipes(recipe);

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

      <div className={'mt-6 grid grid-cols-1 gap-8 lg:grid-cols-5'}>
        <div className={'lg:col-span-3'}>
          <RecipeHero recipe={recipe} favorited={favorited} />
        </div>

        <aside className={'lg:col-span-2'}>
          <IngredientsCard recipe={recipe} />
        </aside>
      </div>

      <FeedbackTabs
        recipe={recipe}
        summary={summary}
        userRating={userRating}
        questions={questions}
        isAuthenticated={userId !== null}
      />

      <StepsSection recipe={recipe} />

      <RelatedSection related={related} />
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

function RecipeHero({
  recipe,
  favorited,
}: {
  recipe: RecipeDetail;
  favorited: boolean;
}) {
  return (
    <article>
      {recipe.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className={'aspect-[16/9] w-full rounded-xl object-cover'}
        />
      ) : (
        <div
          className={cn(
            'flex aspect-[16/9] w-full items-center justify-center rounded-xl',
            'bg-gradient-to-br from-amber-100 to-orange-200',
            'dark:from-amber-950 dark:to-orange-950',
          )}
          aria-hidden={true}
        >
          <ChefHat className={'h-16 w-16 text-orange-400'} />
        </div>
      )}

      <div className={'mt-6 flex flex-wrap items-center gap-2'}>
        <Link href={`/danh-muc/${recipe.category_slug}`}>
          <Badge>{recipe.category_name}</Badge>
        </Link>

        {recipe.difficulty ? (
          <Badge variant={'outline'}>Độ khó: {recipe.difficulty}</Badge>
        ) : null}
      </div>

      <h1
        className={
          'font-heading mt-4 text-3xl font-medium tracking-tight md:text-4xl'
        }
      >
        {recipe.title}
      </h1>

      {recipe.description ? (
        <p className={'text-muted-foreground mt-3 text-base leading-relaxed'}>
          {recipe.description}
        </p>
      ) : null}

      <div
        className={'text-muted-foreground mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm'}
      >
        <span className={'inline-flex items-center gap-2'}>
          <Clock className={'h-4 w-4'} aria-hidden={true} />
          Thời gian nấu: <strong>{formatCookTime(recipe.cook_time)}</strong>
        </span>

        {recipe.servings ? (
          <span className={'inline-flex items-center gap-2'}>
            <Users className={'h-4 w-4'} aria-hidden={true} />
            Khẩu phần: <strong>{recipe.servings} người</strong>
          </span>
        ) : null}

        <span className={'inline-flex items-center gap-2'}>
          <FavoriteButton
            recipeId={recipe.id}
            slug={recipe.slug}
            initialFavorited={favorited}
          />
        </span>
      </div>

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

      <Separator className={'my-6'} />
    </article>
  );
}

function IngredientsCard({ recipe }: { recipe: RecipeDetail }) {
  return (
    <div
      className={
        'bg-card text-card-foreground ring-foreground/10 rounded-xl p-6 ring-1'
      }
    >
      <h2 className={'text-xl font-medium'}>Nguyên liệu</h2>

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
        <ul className={'mt-4 space-y-3'}>
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className={'flex items-start gap-3 text-sm'}>
              <span
                className={
                  'bg-primary/10 text-primary mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium'
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
    <section className={'mt-10'} aria-label={'Đánh giá và hỏi đáp'}>
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

function StepsSection({ recipe }: { recipe: RecipeDetail }) {
  return (
    <section className={'mt-10'} aria-labelledby={'steps-heading'}>
      <h2 id={'steps-heading'} className={'text-2xl font-medium'}>
        Các bước thực hiện
      </h2>

      {recipe.steps.length === 0 ? (
        <p className={'text-muted-foreground mt-4 text-sm'}>
          Chưa có hướng dẫn các bước cho công thức này.
        </p>
      ) : (
        <ol className={'mt-6 space-y-6'}>
          {recipe.steps.map((step, index) => (
            <li key={index} className={'flex items-start gap-4'}>
              <span
                className={
                  'bg-primary text-primary-foreground inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold'
                }
                aria-hidden={true}
              >
                {index + 1}
              </span>
              <p className={'text-base leading-relaxed'}>{step}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function RelatedSection({
  related,
}: {
  related: Awaited<ReturnType<typeof getRelatedRecipes>>;
}) {
  if (related.length === 0) {
    return null;
  }

  return (
    <section className={'mt-12'} aria-labelledby={'related-heading'}>
      <Separator className={'mb-8'} />

      <h2 id={'related-heading'} className={'text-2xl font-medium'}>
        Công thức liên quan
      </h2>

      <div
        className={'mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'}
      >
        {related.map((recipe) => (
          <RecipeCard key={recipe.slug} recipe={recipe} />
        ))}
      </div>
    </section>
  );
}
