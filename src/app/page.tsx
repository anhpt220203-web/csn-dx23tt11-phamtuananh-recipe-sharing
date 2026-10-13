import Link from "next/link";
import { ArrowUp, Heart, Search } from "lucide-react";

import { RecipeCard } from "@/components/site/recipe-card";
import { SectionHeading } from "@/components/site/section-heading";
import {
  CARD_GRADIENTS,
  CATEGORY_EMOJI,
  DEFAULT_EMOJI,
  type RecipeCardData,
} from "@/lib/site-data";
import { listCategories, listRecipes } from "@/services/recipe-service";

// Trang chủ đọc dữ liệu trực tiếp từ DB theo mỗi request.
export const dynamic = "force-dynamic";

const POPULAR_KEYWORDS = [
  "Món chính",
  "Món canh",
  "Món chay",
  "Món ăn vặt",
  "Món tráng miệng",
  "Đồ uống",
];

export default async function Home() {
  const [categories, newest] = await Promise.all([
    listCategories(),
    listRecipes({ take: 8 }),
  ]);

  const trending = newest.slice(0, 6);

  return (
    <div className="flex flex-col bg-white">
      {/* ─── Banner đỏ ─── */}
      <section className="bg-gradient-to-r from-brand to-brand-dark px-4 py-8 text-center text-white">
        <p className="font-script text-3xl sm:text-4xl">
          Bữa cơm nhà ngon mỗi ngày
        </p>
        <p className="mt-2 text-sm text-white/90 sm:text-base">
          Kho công thức nấu ăn theo danh mục — tìm nhanh, nấu chuẩn, chia sẻ cùng
          cộng đồng.
        </p>
      </section>

      {/* ─── Khu tìm kiếm (nền trắng) ─── */}
      <section id="tim-kiem" className="bg-white px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-script text-2xl text-ink sm:text-[28px]">
            Hàng trăm Công thức món ngon và dễ làm
          </p>

          <form
            action="/cong-thuc"
            className="mx-auto mt-4 flex max-w-2xl items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                name="q"
                placeholder="Nhập món ngon đang tìm kiếm..."
                className="h-[42px] w-full rounded-lg bg-zinc-100 pl-12 pr-4 text-base text-ink outline-none transition focus:bg-white focus:ring-2 focus:ring-brand/40"
              />
            </div>
            <button
              type="submit"
              className="grid size-[42px] shrink-0 place-items-center rounded-lg bg-brand text-white transition hover:bg-brand-dark"
              aria-label="Tìm kiếm"
            >
              <Search className="size-5" />
            </button>
          </form>

          <p className="mt-6 text-sm font-bold uppercase tracking-wide text-ink">
            Tìm kiếm phổ biến
          </p>
          <ul className="mt-1 flex flex-wrap justify-center">
            {POPULAR_KEYWORDS.map((kw) => (
              <li key={kw}>
                <Link
                  href={`/cong-thuc?q=${encodeURIComponent(kw)}`}
                  className="inline-block px-3 py-2 text-sm text-ink transition hover:text-brand hover:underline"
                >
                  {kw}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {newest.length === 0 ? (
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-5xl" aria-hidden>
            🍚
          </p>
          <h2 className="mt-4 text-xl font-extrabold text-ink">
            Chưa đọc được công thức nào từ cơ sở dữ liệu
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Kiểm tra kết nối DB rồi nạp dữ liệu mẫu bằng lệnh{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em]">
              pnpm exec prisma db seed
            </code>{" "}
            (chạy trong thư mục <code className="font-mono">src/</code>).
          </p>
        </section>
      ) : (
        <>
          {/* ─── Món ngon xu hướng ─── */}
          <section className="bg-white py-10">
            <div className="mx-auto max-w-[1320px] px-4">
              <SectionHeading normal="Món Ngon" strong="Xu Hướng" id="xu-huong" />
              <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {trending.map((recipe, index) => (
                  <Link
                    key={recipe.id}
                    href={`/cong-thuc/${recipe.slug}`}
                    className="group relative w-56 shrink-0 snap-start overflow-hidden rounded-lg shadow-sm transition hover:shadow-xl sm:w-64"
                  >
                    <TrendThumb recipe={recipe} rank={index + 1} />
                  </Link>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/cong-thuc"
                  className="inline-block rounded-lg bg-brand px-5 py-2 text-sm font-bold uppercase text-white transition hover:bg-brand-dark"
                >
                  Xem thêm công thức
                </Link>
              </div>
            </div>
          </section>

          {/* ─── Món ngon mới ra lò ─── */}
          <section className="bg-white pb-12">
            <div className="mx-auto max-w-[1320px] px-4">
              <SectionHeading normal="Món Ngon" strong="Mới Ra Lò" id="moi-ra-lo" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {newest.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link
                  href="/cong-thuc"
                  className="inline-block rounded-lg bg-brand px-5 py-2 text-sm font-bold uppercase text-white transition hover:bg-brand-dark"
                >
                  Xem thêm
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ─── Danh mục món ăn ─── */}
      <section className="bg-cream py-12">
        <div className="mx-auto max-w-[1320px] px-4">
          <SectionHeading normal="Khám Phá" strong="Danh Mục" id="danh-muc" />
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((category, index) => (
                <Link
                  key={category.slug}
                  href={`/danh-muc/${category.slug}`}
                  className={`flex flex-col items-center gap-2 rounded-lg bg-gradient-to-br p-6 text-center transition hover:shadow-lg ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]}`}
                >
                  <span className="text-5xl" aria-hidden>
                    {CATEGORY_EMOJI[category.slug] ?? DEFAULT_EMOJI}
                  </span>
                  <span className="font-bold text-ink">{category.name}</span>
                  <span className="line-clamp-2 text-xs text-zinc-600">
                    {category.description ??
                      "Khám phá các công thức trong danh mục"}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide text-brand">
                    Xem món
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-zinc-500">
              Chưa có danh mục nào trong cơ sở dữ liệu.
            </p>
          )}
        </div>
      </section>

      {/* ─── Banner kêu gọi chia sẻ ─── */}
      <section id="chia-se" className="bg-brand px-4 py-12 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <p className="font-script text-3xl">Cùng nấu, cùng chia sẻ</p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            Đăng công thức của bạn — để cả nhà cùng nấu cùng bạn
          </h2>
          <Link
            href="/cong-thuc"
            className="mt-6 inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-bold uppercase text-brand transition hover:bg-cream"
          >
            Khám phá công thức
          </Link>
        </div>
      </section>

      {/* Nút lên đầu trang */}
      <a
        href="#tim-kiem"
        aria-label="Lên đầu trang"
        className="fixed bottom-5 right-5 z-40 grid size-11 place-items-center rounded-lg bg-brand text-white shadow-lg transition hover:bg-brand-dark"
      >
        <ArrowUp className="size-5" />
      </a>
    </div>
  );
}

function TrendThumb({
  recipe,
  rank,
}: {
  recipe: RecipeCardData;
  rank: number;
}) {
  const emoji = CATEGORY_EMOJI[recipe.category.slug] ?? DEFAULT_EMOJI;

  return (
    <>
      <span className="absolute left-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-brand text-sm font-extrabold text-white shadow">
        {rank}
      </span>
      {recipe.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          loading="lazy"
          className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <span
          className={`flex h-52 w-full flex-col items-center justify-center gap-2 bg-gradient-to-br ${CARD_GRADIENTS[rank % CARD_GRADIENTS.length]} transition group-hover:scale-105`}
        >
          <span className="text-6xl" aria-hidden>
            {emoji}
          </span>
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 pt-10 text-white">
        <span className="text-xs font-bold uppercase tracking-wide text-white/80">
          {recipe.category.name}
        </span>
        <span className="line-clamp-2 text-lg font-extrabold leading-snug">
          {recipe.title}
        </span>
      </span>
      <span className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-xs font-bold text-brand">
        <Heart className="size-3.5 fill-brand text-brand" />
        {recipe.cookTime ? `${recipe.cookTime} Phút` : "Món ngon"}
      </span>
    </>
  );
}
