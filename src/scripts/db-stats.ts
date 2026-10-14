// Thống kê nhanh dữ liệu trong DB. Chạy: pnpm exec tsx scripts/db-stats.ts
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [categories, recipes, users, accounts, sessions, verifications] =
    await Promise.all([
      prisma.category.count(),
      prisma.recipe.count(),
      prisma.user.count(),
      prisma.account.count(),
      prisma.session.count(),
      prisma.verification.count(),
    ]);

  console.log(
    `categories=${categories} recipes=${recipes} users=${users} accounts=${accounts} sessions=${sessions} verification=${verifications}`,
  );

  const byCategory = await prisma.category.findMany({
    select: { name: true, slug: true, _count: { select: { recipes: true } } },
    orderBy: { id: "asc" },
  });
  for (const c of byCategory) {
    console.log(`  ${c.slug.padEnd(18)} ${String(c._count.recipes).padStart(2)} công thức  (${c.name})`);
  }

  const missingImage = await prisma.recipe.count({ where: { imageUrl: null } });
  const missingSteps = await prisma.recipe.count({ where: { steps: { isEmpty: true } } });
  const placeholderImages = await prisma.recipe.count({
    where: { imageUrl: { endsWith: ".svg" } },
  });
  const realPhotos = await prisma.recipe.count({
    where: { NOT: { imageUrl: { endsWith: ".svg" } } },
  });
  const withCredit = await prisma.recipe.count({
    where: { sourceName: { not: null } },
  });
  console.log(
    `  ảnh: ${realPhotos} ảnh thật / ${placeholderImages} placeholder | thiếu ảnh: ${missingImage} | thiếu các bước: ${missingSteps}`,
  );
  console.log(`  có ghi nguồn ảnh: ${withCredit}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Lỗi đọc DB:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
