import { prisma } from "@/lib/prisma";

// Server component đọc DB khi request (không prerender lúc build — DB có thể chưa kết nối)
export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [categories, recipes] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.recipe.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    ]);
    return { categories, recipes, error: false as const };
  } catch {
    return { categories: [], recipes: [], error: true as const };
  }
}

export default async function Home() {
  const { categories, recipes, error } = await getData();

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center py-16 px-4 gap-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-3">
            Website Quản lý &amp; Chia sẻ Công thức Nấu Ăn
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
            Khám phá và chia sẻ các công thức nấu ăn ngon miệng theo nhóm món ăn.
          </p>
        </header>

        {error ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Không thể kết nối dữ liệu — kiểm tra cấu hình cơ sở dữ liệu.
          </p>
        ) : recipes.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            Chưa có công thức nào. Hãy nạp dữ liệu mẫu bằng{" "}
            <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
              pnpm exec prisma db seed
            </code>
            .
          </p>
        ) : (
          <>
            <section className="w-full">
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-3">
                Nhóm món ăn
              </h2>
              <ul className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    {category.name}
                  </li>
                ))}
              </ul>
            </section>

            <section className="w-full">
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-3">
                Công thức mới
              </h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {recipes.map((recipe) => (
                  <li
                    key={recipe.id}
                    className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <p className="font-medium text-black dark:text-zinc-50">
                      {recipe.title}
                    </p>
                    {recipe.description ? (
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {recipe.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
