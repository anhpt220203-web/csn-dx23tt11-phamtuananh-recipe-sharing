import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

/**
 * Seed tối thiểu (FR-007): ≥ 1 Category + ≥ 1 Recipe để kiểm chứng đường đi dữ liệu.
 * Upsert theo slug — chạy lại nhiều lần không nhân đôi bản ghi (idempotent).
 * Nội dung seed thật (≥ 30 công thức, 7 danh mục, ≥ 5 tài khoản — NFR5) thuộc feature kế tiếp.
 */
async function main() {
  const category = await prisma.category.upsert({
    where: { slug: "mon-viet-nam" },
    update: {},
    create: {
      name: "Món ăn Việt Nam",
      slug: "mon-viet-nam",
      description: "Những món ăn truyền thống và hiện đại của Việt Nam.",
    },
  });

  await prisma.recipe.upsert({
    where: { slug: "com-chien" },
    update: {},
    create: {
      categoryId: category.id,
      title: "Cơm chiên dương châu",
      slug: "com-chien",
      description:
        "Món cơm chiên quen thuộc với trứng, xúc xích và rau củ — nhanh, dễ làm, thích hợp bữa sáng.",
    },
  });

  console.log("Seed hoàn tất: 1 danh mục + 1 công thức mẫu.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed lỗi:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
