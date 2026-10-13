import { readFile } from "node:fs/promises";

import { PrismaClient } from "../generated/prisma/client";
import { CATEGORY_SEED, RECIPE_SEED } from "./data/recipes";

const prisma = new PrismaClient();

// ≥ 5 tài khoản demo (NFR5). Mật khẩu mẫu dùng chung cho buổi demo đồ án.
const DEMO_PASSWORD = "Demo@123456";
const DEMO_USERS = [
  { name: "Phạm Tuấn Anh", email: "phamtuananh@example.com" },
  { name: "Trần Thị Bích", email: "tranbich@example.com" },
  { name: "Nguyễn Minh Khôi", email: "minhkhoi@example.com" },
  { name: "Lê Hoàng Yến", email: "hoangyen@example.com" },
  { name: "Võ Đức Huy", email: "duchuy@example.com" },
];

type ImageCredit = {
  imageUrl: string;
  sourceName: string;
  sourceUrl: string;
};

// Ảnh thật (giấy phép mở) do scripts/fetch-images.ts tải về, có ghi nguồn tác giả.
// Nếu đã có ảnh thật thì seed KHÔNG ghi đè bằng ảnh placeholder.
async function loadImageCredits(): Promise<Record<string, ImageCredit>> {
  try {
    const raw = await readFile("prisma/data/image-credits.json", "utf8");
    return JSON.parse(raw) as Record<string, ImageCredit>;
  } catch {
    return {};
  }
}

function imageUrlFor(slug: string): string {
  return `/images/recipes/${slug}.svg`;
}

async function seedCategories() {
  const idBySlug = new Map<string, number>();
  for (const category of CATEGORY_SEED) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: category,
    });
    idBySlug.set(category.slug, row.id);
  }
  return idBySlug;
}

async function seedRecipes(categoryIdBySlug: Map<string, number>) {
  const credits = await loadImageCredits();

  for (const recipe of RECIPE_SEED) {
    const categoryId = categoryIdBySlug.get(recipe.categorySlug);
    if (!categoryId) throw new Error(`Thiếu danh mục: ${recipe.categorySlug}`);

    const credit = credits[recipe.slug];
    const data = {
      categoryId,
      title: recipe.title,
      description: recipe.description,
      imageUrl: credit?.imageUrl ?? imageUrlFor(recipe.slug),
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      servings: recipe.servings,
      cookTime: recipe.cookTime,
      difficulty: recipe.difficulty,
      sourceName: credit?.sourceName ?? recipe.sourceName ?? null,
      sourceUrl: credit?.sourceUrl ?? recipe.sourceUrl ?? null,
    };

    await prisma.recipe.upsert({
      where: { slug: recipe.slug },
      update: data,
      create: { slug: recipe.slug, ...data },
    });
  }
}

async function seedDemoUsers() {
  const { auth } = await import("../lib/auth");
  let created = 0;

  for (const user of DEMO_USERS) {
    const existing = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });
    if (existing) continue;

    await auth.api.signUpEmail({
      body: {
        name: user.name,
        email: user.email,
        password: DEMO_PASSWORD,
      },
    });
    // Tài khoản demo không cần xác thực email để đăng nhập.
    await prisma.user.update({
      where: { email: user.email },
      data: { emailVerified: true },
    });
    created += 1;
  }

  return { total: DEMO_USERS.length, created };
}

async function main() {
  const categoryIdBySlug = await seedCategories();
  await seedRecipes(categoryIdBySlug);

  // Dọn danh mục rỗng còn sót từ bộ seed cũ (giữ đúng 7 danh mục theo spec).
  const seedSlugs = new Set(CATEGORY_SEED.map((c) => c.slug));
  const leftovers = await prisma.category.findMany({
    where: { recipes: { none: {} } },
    select: { id: true, slug: true },
  });
  const removed = leftovers.filter((c) => !seedSlugs.has(c.slug));
  if (removed.length > 0) {
    await prisma.category.deleteMany({
      where: { id: { in: removed.map((c) => c.id) } },
    });
  }

  const demoUsers = await seedDemoUsers();

  const [categories, recipes, users] = await Promise.all([
    prisma.category.count(),
    prisma.recipe.count(),
    prisma.user.count(),
  ]);

  console.log(
    `Seed xong — danh mục: ${categories}, công thức: ${recipes}, người dùng: ${users} (tạo mới ${demoUsers.created}/${demoUsers.total} tài khoản demo, mật khẩu: ${DEMO_PASSWORD}).`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed lỗi:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
