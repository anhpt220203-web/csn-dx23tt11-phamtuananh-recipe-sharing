import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { RecipeCard } from "@/components/site/recipe-card";
import { CATEGORY_EMOJI, DEFAULT_EMOJI } from "@/lib/site-data";
import {
  getCategoryBySlug,
  listCategories,
  listRecipes,
} from "@/services/recipe-service";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/danh-muc/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Không tìm thấy danh mục" };
  return {
    title: `${category.name} — Công Thức Nấu Ăn`,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage(props: PageProps<"/danh-muc/[slug]">) {
  const { slug } = await props.params;
  const [category, recipes, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    listRecipes({ categorySlug: slug }),
    listCategories(),
  ]);
  if (!category) notFound();

  const emoji = CATEGORY_EMOJI[category.slug] ?? DEFAULT_EMOJI;

  return (
    <div className="bg-white">
      <section className="bg-cream px-4 py-10 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="text-5xl" aria-hidden>
            {emoji}
          </span>
          <p className="mt-2 font-script text-2xl text-brand">Danh mục món ăn</p>
          <h1 className="mt-1 text-3xl font-extrabold text-ink sm:text-5xl">
            {category.name}
          </h1>
          {category.description ? (
            <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-600 sm:text-base">
              {category.description}
            </p>
          ) : null}
          <p className="mt-3 text-sm font-bold text-brand">
            {recipes.length} công thức trong danh mục này
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav aria-label="Đường dẫn" className="mb-6 flex items-center gap-1 text-sm text-zinc-500">
          <Link href="/" className="hover:text-brand">
            Trang chủ
          </Link>
          <ChevronRight className="size-4" />
          <span className="font-semibold text-zinc-700">{category.name}</span>
        </nav>

        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-10 text-center">
            <p className="font-semibold text-zinc-700">
              Danh mục này chưa có công thức nào.
            </p>
            <Link
              href="/cong-thuc"
              className="mt-3 inline-block text-sm font-bold text-brand hover:underline"
            >
              Xem tất cả công thức
            </Link>
          </div>
        )}

        {/* Các danh mục khác */}
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-extrabold text-zinc-800">
            Danh mục khác
          </h2>
          <ul className="flex flex-wrap gap-2">
            {allCategories
              .filter((item) => item.slug !== category.slug)
              .map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/danh-muc/${item.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition hover:border-brand hover:bg-cream hover:text-brand"
                  >
                    <span aria-hidden>
                      {CATEGORY_EMOJI[item.slug] ?? DEFAULT_EMOJI}
                    </span>
                    {item.name}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
