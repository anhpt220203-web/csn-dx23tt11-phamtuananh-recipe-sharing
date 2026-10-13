import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "../generated/prisma/client";

// Lớp truy vấn dữ liệu công thức/danh mục — mọi trang đọc DB đều đi qua đây.
// Mọi hàm đều chịu lỗi kết nối: trả về rỗng để trang hiển thị trạng thái nhẹ nhàng.

export type CategoryRow = Prisma.CategoryGetPayload<Record<string, never>>;
export type RecipeWithCategory = Prisma.RecipeGetPayload<{
  include: { category: true };
}>;

export type RecipeCardView = Pick<
  RecipeWithCategory,
  | "id"
  | "title"
  | "slug"
  | "description"
  | "imageUrl"
  | "servings"
  | "cookTime"
  | "difficulty"
  | "category"
>;

export async function listCategories(): Promise<CategoryRow[]> {
  try {
    return await prisma.category.findMany({ orderBy: { id: "asc" } });
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    return await prisma.category.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export async function getRecipeBySlug(
  slug: string,
): Promise<RecipeWithCategory | null> {
  try {
    return await prisma.recipe.findUnique({
      where: { slug },
      include: { category: true },
    });
  } catch {
    return null;
  }
}

export type ListRecipesOptions = {
  q?: string;
  categorySlug?: string;
  take?: number;
};

export async function listRecipes({
  q,
  categorySlug,
  take = 60,
}: ListRecipesOptions = {}): Promise<RecipeCardView[]> {
  const where: Prisma.RecipeWhereInput = {};

  if (categorySlug) where.category = { slug: categorySlug };

  const keyword = q?.trim();
  if (keyword) {
    where.OR = [
      { title: { contains: keyword, mode: "insensitive" } },
      { description: { contains: keyword, mode: "insensitive" } },
      { category: { name: { contains: keyword, mode: "insensitive" } } },
    ];
  }

  try {
    return await prisma.recipe.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take,
    });
  } catch {
    return [];
  }
}

// Công thức cùng danh mục, dùng cho khối "Món cùng danh mục" ở trang chi tiết.
export async function listRelatedRecipes(
  categoryId: number,
  excludeRecipeId: number,
  take = 4,
): Promise<RecipeCardView[]> {
  try {
    return await prisma.recipe.findMany({
      where: { categoryId, id: { not: excludeRecipeId } },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take,
    });
  } catch {
    return [];
  }
}

export async function countRecipes(): Promise<number> {
  try {
    return await prisma.recipe.count();
  } catch {
    return 0;
  }
}
