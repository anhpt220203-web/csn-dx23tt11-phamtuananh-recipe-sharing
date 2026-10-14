import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";

import { RecipeCard } from "@/components/site/recipe-card";
import { CATEGORY_EMOJI, DEFAULT_EMOJI } from "@/lib/site-data";
import { listCategories, listRecipes } from "@/services/recipe-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tất cả công thức — Công Thức Nấu Ăn",
  description:
    "Danh sách toàn bộ công thức nấu ăn trong cơ sở dữ liệu, lọc theo danh mục hoặc tìm theo tên món.",
};

export default async function RecipeListPage(props: PageProps<"/cong-thuc">) {
  const searchParams = await props.searchParams;
  const rawQuery = searchParams.q;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.trim() ?? "";
  const rawCategory = searchParams.danh_muc;
  const categorySlug =
    (Array.isArray(rawCategory) ? rawCategory[0] : rawCategory)?.trim() ?? "";

  const [recipes, categories] = await Promise.all([
    listRecipes({ q: query || undefined, categorySlug: categorySlug || undefined }),
    listCategories(),
  ]);

  return (
    <div className="bg-white">
      <section className="bg-cream px-4 py-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-script text-2xl text-brand">Kho công thức</p>
          <h1 className="mt-1 text-3xl font-extrabold text-ink sm:text-5xl">
            Tất cả <strong className="text-brand">công thức</strong>
          </h1>
          <p className="mt-2 text-sm text-zinc-600 sm:text-base">
            {recipes.length} công thức
            {query ? ` khớp với “${query}”` : " trong cơ sở dữ liệu"}
            {categorySlug ? " (đã lọc theo danh mục)" : ""}
          </p>

          <form
            action="/cong-thuc"
            className="mx-auto mt-6 flex max-w-2xl items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Nhập món ngon đang tìm kiếm..."
                className="h-[42px] w-full rounded-lg bg-white pl-12 pr-4 text-base text-ink outline-none ring-1 ring-zinc-200 transition focus:ring-2 focus:ring-brand/40"
              />
            </div>
            {categorySlug ? (
              <input type="hidden" name="danh_muc" value={categorySlug} />
            ) : null}
            <button
              type="submit"
              className="grid size-[42px] shrink-0 place-items-center rounded-lg bg-brand text-white transition hover:bg-brand-dark"
              aria-label="Tìm kiếm"
            >
              <ChevronRight className="size-5" />
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Lọc theo danh mục */}
        <ul className="mb-8 flex flex-wrap gap-2">
          <li>
            <Link
              href={query ? `/cong-thuc?q=${encodeURIComponent(query)}` : "/cong-thuc"}
              className={`inline-block rounded-lg px-4 py-2 text-sm font-bold transition ${
                categorySlug
                  ? "border border-zinc-200 bg-white text-zinc-700 hover:border-brand hover:bg-cream hover:text-brand"
                  : "bg-brand text-white"
              }`}
            >
              Tất cả
            </Link>
          </li>
          {categories.map((category) => {
            const params = new URLSearchParams();
            if (query) params.set("q", query);
            params.set("danh_muc", category.slug);
            const active = category.slug === categorySlug;
            return (
              <li key={category.slug}>
                <Link
                  href={`/cong-thuc?${params.toString()}`}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition ${
                    active
                      ? "bg-brand text-white"
                      : "border border-zinc-200 bg-white text-zinc-700 hover:border-brand hover:bg-cream hover:text-brand"
                  }`}
                >
                  <span aria-hidden>
                    {CATEGORY_EMOJI[category.slug] ?? DEFAULT_EMOJI}
                  </span>
                  {category.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-10 text-center">
            <p className="font-semibold text-zinc-700">
              Không tìm thấy công thức nào khớp.
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Thử từ khoá khác hoặc bỏ lọc danh mục.
            </p>
            <Link
              href="/cong-thuc"
              className="mt-3 inline-block text-sm font-bold text-brand hover:underline"
            >
              Xoá bộ lọc
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
