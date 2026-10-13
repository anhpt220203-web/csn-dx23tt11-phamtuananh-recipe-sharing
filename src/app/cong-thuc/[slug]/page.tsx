import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChefHat, ChevronRight, Clock3, Heart, Users } from "lucide-react";

import {
  formatCookTime,
  RecipeCard,
} from "@/components/site/recipe-card";
import { SectionHeading } from "@/components/site/section-heading";
import {
  CATEGORY_EMOJI,
  DEFAULT_EMOJI,
} from "@/lib/site-data";
import {
  getRecipeBySlug,
  listRelatedRecipes,
} from "@/services/recipe-service";

// Đọc DB theo request (không prerender lúc build — DB có thể chưa sẵn sàng).
export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/cong-thuc/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return { title: "Không tìm thấy công thức" };
  return {
    title: `${recipe.title} — Công Thức Nấu Ăn`,
    description: recipe.description ?? undefined,
  };
}

export default async function RecipeDetailPage(
  props: PageProps<"/cong-thuc/[slug]">,
) {
  const { slug } = await props.params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();

  const related = await listRelatedRecipes(recipe.categoryId, recipe.id);
  const emoji = CATEGORY_EMOJI[recipe.category.slug] ?? DEFAULT_EMOJI;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Đường dẫn */}
        <nav aria-label="Đường dẫn" className="mb-5 flex flex-wrap items-center gap-1 text-sm text-zinc-500">
          <Link href="/" className="hover:text-brand">
            Trang chủ
          </Link>
          <ChevronRight className="size-4" />
          <Link
            href={`/danh-muc/${recipe.category.slug}`}
            className="hover:text-brand"
          >
            {recipe.category.name}
          </Link>
          <ChevronRight className="size-4" />
          <span className="font-semibold text-zinc-700">{recipe.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          {/* Ảnh món ăn */}
          <div className="flex flex-col gap-2">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-orange-200 via-amber-100 to-rose-100 shadow-sm">
              {recipe.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="h-72 w-full object-cover sm:h-96"
                />
              ) : (
                <span
                  aria-hidden
                  className="grid h-72 w-full place-items-center text-8xl sm:h-96"
                >
                  {emoji}
                </span>
              )}
            </div>

            {/* Ghi nguồn ảnh — bắt buộc khi dùng ảnh giấy phép CC */}
            {recipe.sourceName ? (
              <p className="text-xs text-zinc-500">
                {recipe.sourceName}
                {recipe.sourceUrl ? (
                  <>
                    {" — "}
                    <a
                      href={recipe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="font-semibold text-brand hover:underline"
                    >
                      xem ảnh gốc
                    </a>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href={`/danh-muc/${recipe.category.slug}`}
              className="w-fit rounded-lg bg-cream px-3 py-1 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
            >
              {emoji} {recipe.category.name}
            </Link>

            <h1 className="text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
              {recipe.title}
            </h1>

            {recipe.description ? (
              <p className="text-zinc-600">{recipe.description}</p>
            ) : null}

            <ul className="flex flex-wrap gap-2">
              {recipe.servings ? (
                <li className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700">
                  <Users className="size-4 text-brand" />
                  {recipe.servings} người
                </li>
              ) : null}
              {recipe.difficulty ? (
                <li className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700">
                  <ChefHat className="size-4 text-brand" />
                  {recipe.difficulty}
                </li>
              ) : null}
              {recipe.cookTime ? (
                <li className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700">
                  <Clock3 className="size-4 text-brand" />
                  {formatCookTime(recipe.cookTime)}
                </li>
              ) : null}
            </ul>

            <div className="mt-1 grid grid-cols-2 gap-3 rounded-xl bg-cream p-4 text-sm text-zinc-600">
              <p>
                <span className="font-semibold text-zinc-800">
                  Nguyên liệu:
                </span>{" "}
                {recipe.ingredients.length} mục
              </p>
              <p>
                <span className="font-semibold text-zinc-800">Các bước:</span>{" "}
                {recipe.steps.length} bước
              </p>
            </div>

            <p className="text-xs text-zinc-400">
              Đánh giá và lượt thích sẽ có ở chức năng FR5/FR6.
            </p>
          </div>
        </div>

        {/* Nguyên liệu + Các bước */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-zinc-800">
              <span className="grid size-8 place-items-center rounded-lg bg-cream text-brand">
                🧺
              </span>
              Nguyên liệu
            </h2>
            {recipe.ingredients.length > 0 ? (
              <ul className="space-y-2 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
                {recipe.ingredients.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 border-b border-dashed border-zinc-100 pb-2 text-sm text-zinc-700 last:border-0 last:pb-0"
                  >
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-cream0" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500">
                Công thức này chưa có nguyên liệu.
              </p>
            )}
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-zinc-800">
              <span className="grid size-8 place-items-center rounded-lg bg-cream text-brand">
                🍳
              </span>
              Cách làm
            </h2>
            {recipe.steps.length > 0 ? (
              <ol className="space-y-3">
                {recipe.steps.map((step, index) => (
                  <li
                    key={step}
                    className="flex gap-4 rounded-2xl border border-zinc-100 bg-white p-4 text-sm text-zinc-700 shadow-sm"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-zinc-500">
                Công thức này chưa có các bước thực hiện.
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Món cùng danh mục */}
      {related.length > 0 ? (
        <section className="mt-6 bg-cream py-12">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading normal="Món Cùng" strong="Danh Mục" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <RecipeCard key={item.id} recipe={item} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href={`/danh-muc/${recipe.category.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-brand-dark"
              >
                <Heart className="size-4" />
                Xem cả danh mục {recipe.category.name}
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
