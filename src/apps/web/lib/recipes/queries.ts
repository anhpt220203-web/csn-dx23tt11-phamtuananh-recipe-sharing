import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  type CategoryRow,
  type RatingSummary,
  type RecipeDetail,
  type RecipeSchema,
  type RecipeWithCategory,
} from './database';

function getClient() {
  return getSupabaseServerClient<RecipeSchema>();
}

type RecipeQueryRow = {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: string;
  source_name: string | null;
  source_url: string | null;
  servings: number | null;
  cook_time: number | null;
  difficulty: string | null;
  created_by: string | null;
  categories: { name: string; slug: string } | null;
};

function toRecipeWithCategory(row: RecipeQueryRow): RecipeWithCategory {
  const {
    id,
    category_id,
    title,
    slug,
    description,
    image_url,
    status,
    source_name,
    source_url,
    servings,
    cook_time,
    difficulty,
    created_by,
  } = row;

  return {
    id,
    category_id,
    title,
    slug,
    description,
    image_url,
    status,
    source_name,
    source_url,
    servings,
    cook_time,
    difficulty,
    created_by,
    category_name: row.categories?.name ?? '',
    category_slug: row.categories?.slug ?? '',
  };
}

const RECIPE_COLUMNS =
  'id,category_id,title,slug,description,image_url,status,source_name,source_url,servings,cook_time,difficulty,created_by,categories(name,slug)';

/**
 * Danh sách nhóm món, sắp theo thứ tự id.
 */
export async function getCategories(): Promise<CategoryRow[]> {
  const client = getClient();

  const { data, error } = await client
    .from('categories')
    .select('id,name,slug,description')
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`Không tải được danh mục: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Lấy một danh mục theo slug. Trả về null nếu không tồn tại.
 */
export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryRow | null> {
  const client = getClient();

  const { data, error } = await client
    .from('categories')
    .select('id,name,slug,description')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Không tải được danh mục: ${error.message}`);
  }

  return data;
}

/**
 * Liệt kê công thức của một danh mục (theo slug danh mục).
 */
export async function getRecipesByCategorySlug(
  slug: string,
): Promise<RecipeWithCategory[]> {
  const client = getClient();

  const { data, error } = await client
    .from('recipes')
    .select(RECIPE_COLUMNS)
    .eq('categories.slug', slug)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Không tải được công thức: ${error.message}`);
  }

  return ((data ?? []) as unknown as RecipeQueryRow[]).map(
    toRecipeWithCategory,
  );
}

/**
 * Tìm kiếm công thức theo tên món hoặc mô tả (không phân biệt hoa thường).
 * Có thể giới hạn theo slug danh mục. Trả về mảng rỗng nếu từ khóa trống.
 */
export async function searchRecipes(params: {
  q: string;
  categorySlug?: string;
}): Promise<RecipeWithCategory[]> {
  const q = params.q.trim();

  if (!q) {
    return [];
  }

  const client = getClient();

  // Escape các ký tự đặc biệt của LIKE để từ khóa được hiểu đúng.
  const escaped = q.replace(/[%_\\]/g, (char) => `\\${char}`);
  const pattern = `%${escaped}%`;

  let query = client
    .from('recipes')
    .select(RECIPE_COLUMNS)
    .or(`title.ilike.${pattern},description.ilike.${pattern}`);

  if (params.categorySlug) {
    query = query.eq('categories.slug', params.categorySlug);
  }

  const { data, error } = await query.order('created_at', {
    ascending: false,
  });

  if (error) {
    throw new Error(`Tìm kiếm công thức thất bại: ${error.message}`);
  }

  return ((data ?? []) as unknown as RecipeQueryRow[]).map(
    toRecipeWithCategory,
  );
}

/**
 * Chi tiết một công thức kèm nguyên liệu và các bước (sắp theo vị trí).
 * Trả về null nếu không tồn tại.
 */
export async function getRecipeBySlug(
  slug: string,
): Promise<RecipeDetail | null> {
  const client = getClient();

  const { data, error } = await client
    .from('recipes')
    .select(
      `${RECIPE_COLUMNS},recipe_ingredients(name,position),recipe_steps(step,position)`,
    )
    .eq('slug', slug)
    .order('position', {
      referencedTable: 'recipe_ingredients',
      ascending: true,
    })
    .order('position', {
      referencedTable: 'recipe_steps',
      ascending: true,
    })
    .maybeSingle();

  if (error) {
    throw new Error(`Không tải được công thức: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const row = data as unknown as RecipeQueryRow & {
    recipe_ingredients: { name: string; position: number }[] | null;
    recipe_steps: { step: string; position: number }[] | null;
  };

  return {
    ...toRecipeWithCategory(row),
    ingredients: (row.recipe_ingredients ?? []).map((item) => item.name),
    steps: (row.recipe_steps ?? []).map((item) => item.step),
  };
}

/**
 * Công thức liên quan: cùng danh mục, loại trừ công thức hiện tại.
 */
export async function getRelatedRecipes(
  recipe: Pick<RecipeDetail, 'id' | 'category_id'>,
  limit = 4,
): Promise<RecipeWithCategory[]> {
  const client = getClient();

  const { data, error } = await client
    .from('recipes')
    .select(RECIPE_COLUMNS)
    .eq('category_id', recipe.category_id)
    .neq('id', recipe.id)
    .order('id', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Không tải được công thức liên quan: ${error.message}`);
  }

  return ((data ?? []) as unknown as RecipeQueryRow[]).map(
    toRecipeWithCategory,
  );
}

/**
 * Công thức mới nhất (đã xuất bản), dùng cho trang chủ.
 */
export async function getLatestRecipes(
  limit = 8,
): Promise<RecipeWithCategory[]> {
  const client = getClient();

  const { data, error } = await client
    .from('recipes')
    .select(RECIPE_COLUMNS)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Không tải được công thức mới: ${error.message}`);
  }

  return ((data ?? []) as unknown as RecipeQueryRow[]).map(
    toRecipeWithCategory,
  );
}

/**
 * Danh sách công thức người dùng đã đánh dấu yêu thích, mới nhất trước.
 */
export async function getFavoriteRecipes(
  userId: string,
): Promise<RecipeWithCategory[]> {
  const client = getClient();

  const { data, error } = await client
    .from('favorites')
    .select(`created_at,recipes(${RECIPE_COLUMNS})`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Không tải được danh sách yêu thích: ${error.message}`);
  }

  return ((data ?? []) as unknown as { recipes: RecipeQueryRow | null }[])
    .map((item) => item.recipes)
    .filter((recipe): recipe is RecipeQueryRow => recipe !== null)
    .map(toRecipeWithCategory);
}

/**
 * Người dùng đã yêu thích công thức này chưa.
 */
export async function isFavorite(
  userId: string | null,
  recipeId: number,
): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const client = getClient();

  const { data, error } = await client
    .from('favorites')
    .select('recipe_id')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .maybeSingle();

  if (error) {
    throw new Error(`Không kiểm tra được yêu thích: ${error.message}`);
  }

  return data !== null;
}

/**
 * Điểm trung bình và số lượt đánh giá của một công thức.
 */
export async function getRatingSummary(
  recipeId: number,
): Promise<RatingSummary> {
  const client = getClient();

  const { data, error } = await client
    .from('ratings')
    .select('rating')
    .eq('recipe_id', recipeId);

  if (error) {
    throw new Error(`Không tải được đánh giá: ${error.message}`);
  }

  const count = data?.length ?? 0;

  if (count === 0) {
    return { average: null, count: 0 };
  }

  const total = (data ?? []).reduce((sum, item) => sum + item.rating, 0);

  return { average: total / count, count };
}

/**
 * Điểm người dùng đã đánh giá cho công thức (null nếu chưa đánh giá).
 */
export async function getUserRating(
  userId: string | null,
  recipeId: number,
): Promise<number | null> {
  if (!userId) {
    return null;
  }

  const client = getClient();

  const { data, error } = await client
    .from('ratings')
    .select('rating')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .maybeSingle();

  if (error) {
    throw new Error(`Không tải được đánh giá của bạn: ${error.message}`);
  }

  return data?.rating ?? null;
}
