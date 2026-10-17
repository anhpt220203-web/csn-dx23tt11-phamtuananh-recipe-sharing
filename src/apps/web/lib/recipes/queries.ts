import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  type CategoryRow,
  type RatingSummary,
  type RecipeDetail,
  type RecipeQuestionRow,
  type RecipeSchema,
  type RecipeSearchRow,
  type RecipeWithCategory,
  type TagRow,
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
  prep_time: number | null;
  difficulty: string | null;
  created_by: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  sugar_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
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
    prep_time,
    difficulty,
    created_by,
    calories,
    protein_g,
    carbs_g,
    sugar_g,
    fat_g,
    fiber_g,
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
    prep_time,
    difficulty,
    created_by,
    // PostgREST có thể trả numeric dạng string — ép về number.
    calories: calories === null ? null : Number(calories),
    protein_g: protein_g === null ? null : Number(protein_g),
    carbs_g: carbs_g === null ? null : Number(carbs_g),
    sugar_g: sugar_g === null ? null : Number(sugar_g),
    fat_g: fat_g === null ? null : Number(fat_g),
    fiber_g: fiber_g === null ? null : Number(fiber_g),
    category_name: row.categories?.name ?? '',
    category_slug: row.categories?.slug ?? '',
  };
}

const RECIPE_COLUMNS =
  'id,category_id,title,slug,description,image_url,status,source_name,source_url,servings,cook_time,prep_time,difficulty,created_by,calories,protein_g,carbs_g,sugar_g,fat_g,fiber_g,created_at,categories(name,slug)';

/**
 * Cách sắp xếp kết quả tìm kiếm (FR3).
 * - 'moi-nhat': công thức mới nhất trước.
 * - 'danh-gia-cao': điểm đánh giá trung bình cao nhất trước.
 */
export type SearchSort = 'moi-nhat' | 'danh-gia-cao';

/**
 * Chuẩn hoá giá trị sort từ query param — giá trị lạ về 'moi-nhat'.
 */
export function parseSearchSort(value: string | undefined): SearchSort {
  return value === 'danh-gia-cao' ? 'danh-gia-cao' : 'moi-nhat';
}

/**
 * Kết quả tìm kiếm: công thức kèm điểm đánh giá tổng hợp (để hiển thị
 * và sắp xếp theo 'danh-gia-cao' mà không cần query thêm).
 */
export type RecipeSearchResult = RecipeWithCategory & {
  rating: RatingSummary;
};

function toRecipeSearchResult(row: RecipeSearchRow): RecipeSearchResult {
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
    prep_time,
    difficulty,
    created_by,
    category_name,
    category_slug,
    rating_average,
    rating_count,
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
    prep_time,
    difficulty,
    created_by,
    calories: null,
    protein_g: null,
    carbs_g: null,
    sugar_g: null,
    fat_g: null,
    fiber_g: null,
    category_name,
    category_slug,
    // PostgREST có thể trả numeric/bigint dạng string — ép về number
    // để `rating.average.toFixed(1)` trong RecipeCard không crash.
    rating: {
      average: rating_average === null ? null : Number(rating_average),
      count: Number(rating_count),
    },
  };
}

/**
 * Danh sách nhóm món, sắp theo thứ tự id.
 */
export async function getCategories(): Promise<CategoryRow[]> {
  const client = getClient();

  const { data, error } = await client
    .from('categories')
    .select('id,name,slug,description,dimension')
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
    .select('id,name,slug,description,dimension')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Không tải được danh mục: ${error.message}`);
  }

  return data;
}

/**
 * Liệt kê công thức của một danh mục (theo slug danh mục).
 * Lưu ý: lọc qua cột của bảng nhúng (`categories.slug`) không còn lọc bảng
 * cha trên PostgREST bản mới, nên phải tra `category_id` trước rồi lọc trực tiếp.
 */
export async function getRecipesByCategorySlug(
  slug: string,
): Promise<RecipeWithCategory[]> {
  const client = getClient();

  const category = await getCategoryBySlug(slug);

  if (!category) {
    return [];
  }

  const { data, error } = await client
    .from('recipes')
    .select(RECIPE_COLUMNS)
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Không tải được công thức: ${error.message}`);
  }

  return ((data ?? []) as unknown as RecipeQueryRow[]).map(
    toRecipeWithCategory,
  );
}

/**
 * Tìm kiếm công thức theo tên món, mô tả, TÊN NGUYÊN LIỆU hoặc
 * TÊN NHÓM MÓN (không phân biệt hoa thường, không phân biệt dấu tiếng Việt
 * nhờ RPC `public.search_recipes` dùng kit.unaccent trên DB).
 * Có thể giới hạn theo slug danh mục và sắp xếp kết quả.
 * Chỉ trả về công thức đã xuất bản (status='published').
 * Trả về mảng rỗng nếu từ khóa trống.
 */
export async function searchRecipes(params: {
  q: string;
  categorySlug?: string;
  sort?: SearchSort;
}): Promise<RecipeSearchResult[]> {
  const q = params.q.trim();

  if (!q) {
    return [];
  }

  const client = getClient();

  const { data, error } = await client.rpc('search_recipes', {
    p_query: q,
    p_category_slug: params.categorySlug ?? null,
    p_sort: params.sort ?? 'moi-nhat',
  });

  if (error) {
    throw new Error(`Tìm kiếm công thức thất bại: ${error.message}`);
  }

  return ((data ?? []) as RecipeSearchRow[]).map(toRecipeSearchResult);
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
    .eq('status', 'published')
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
 * Công thức được đánh giá cao nhất (điểm trung bình rồi số lượt), dùng cho
 * trang chủ. Bảng ratings đọc công khai nên hoạt động cả với khách chưa
 * đăng nhập. Dữ liệu đồ án nhỏ nên tổng hợp phía ứng dụng là đủ.
 */
export async function getTopRatedRecipes(
  limit = 4,
): Promise<(RecipeWithCategory & { rating: RatingSummary })[]> {
  const client = getClient();

  const { data: ratingRows, error } = await client
    .from('ratings')
    .select('recipe_id,rating');

  if (error) {
    throw new Error(`Không tải được đánh giá: ${error.message}`);
  }

  const totals = new Map<number, { sum: number; count: number }>();

  for (const row of ratingRows ?? []) {
    const current = totals.get(row.recipe_id) ?? { sum: 0, count: 0 };
    current.sum += row.rating;
    current.count += 1;
    totals.set(row.recipe_id, current);
  }

  const topIds = [...totals.entries()]
    .sort(
      (a, b) =>
        b[1].sum / b[1].count - a[1].sum / a[1].count ||
        b[1].count - a[1].count,
    )
    .slice(0, limit)
    .map(([id]) => id);

  if (topIds.length === 0) {
    return [];
  }

  const { data, error: recipesError } = await client
    .from('recipes')
    .select(RECIPE_COLUMNS)
    .in('id', topIds)
    .eq('status', 'published');

  if (recipesError) {
    throw new Error(`Không tải được công thức đánh giá cao: ${recipesError.message}`);
  }

  return ((data ?? []) as unknown as RecipeQueryRow[])
    .map(toRecipeWithCategory)
    .map((recipe) => {
      const summary = totals.get(recipe.id);

      return {
        ...recipe,
        rating: {
          average: summary ? summary.sum / summary.count : null,
          count: summary?.count ?? 0,
        },
      };
    })
    .sort(
      (a, b) =>
        (b.rating.average ?? 0) - (a.rating.average ?? 0) ||
        b.rating.count - a.rating.count,
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

/** Đánh giá của một người dùng kèm tên và slug công thức — dùng cho trang hồ sơ (FR4). */
export type MyRatingWithRecipe = {
  recipe_id: number;
  rating: number;
  created_at: string;
  title: string;
  slug: string;
};

/**
 * Danh sách đánh giá của một người dùng, mới nhất trước,
 * kèm tiêu đề và slug công thức để hiển thị và liên kết.
 */
export async function getMyRatingsWithRecipes(
  userId: string,
): Promise<MyRatingWithRecipe[]> {
  const client = getClient();

  const { data, error } = await client
    .from('ratings')
    .select('recipe_id,rating,created_at,recipes(title,slug)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Không tải được đánh giá của bạn: ${error.message}`);
  }

  return (data ?? []).flatMap((row) => {
    const recipe = row.recipes as unknown as {
      title: string;
      slug: string;
    } | null;

    if (!recipe) {
      return [];
    }

    return [
      {
        recipe_id: row.recipe_id,
        rating: row.rating,
        created_at: row.created_at,
        title: recipe.title,
        slug: recipe.slug,
      },
    ];
  });
}

/**
 * Nhóm danh mục theo chiều (dimension) cho trang danh sách công thức.
 */
export async function getCategoriesByDimension(): Promise<
  Record<string, CategoryRow[]>
> {
  const categories = await getCategories();
  const grouped: Record<string, CategoryRow[]> = {};

  for (const category of categories) {
    const dim = category.dimension || 'nhom-mon';

    if (!grouped[dim]) {
      grouped[dim] = [];
    }

    grouped[dim].push(category);
  }

  return grouped;
}

/**
 * Danh sách tags chủ đề ("Tìm món").
 */
export async function getTags(): Promise<TagRow[]> {
  const client = getClient();

  const { data, error } = await client
    .from('tags')
    .select('id,name,slug,created_at')
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`Không tải được tags: ${error.message}`);
  }

  return (data ?? []) as TagRow[];
}

/**
 * Công thức theo tag slug.
 */
export async function getRecipesByTagSlug(
  tagSlug: string,
): Promise<RecipeWithCategory[]> {
  const client = getClient();

  const { data: tag, error: tagError } = await client
    .from('tags')
    .select('id')
    .eq('slug', tagSlug)
    .maybeSingle();

  if (tagError || !tag) {
    return [];
  }

  const { data, error } = await client
    .from('recipe_tags')
    .select(`recipes(${RECIPE_COLUMNS})`)
    .eq('tag_id', (tag as { id: number }).id);

  if (error) {
    throw new Error(`Không tải được công thức theo tag: ${error.message}`);
  }

  return ((data ?? []) as unknown as { recipes: RecipeQueryRow }[])
    .map((row) => row.recipes)
    .filter(Boolean)
    .map(toRecipeWithCategory);
}

/**
 * Danh sách câu hỏi của một công thức (kèm câu trả lời nếu có).
 */
export async function getRecipeQuestions(
  recipeId: number,
): Promise<RecipeQuestionRow[]> {
  const client = getClient();

  const { data, error } = await client
    .from('recipe_questions')
    .select('id,recipe_id,user_id,question,answer,answered_at,created_at')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Không tải được câu hỏi: ${error.message}`);
  }

  return (data ?? []) as RecipeQuestionRow[];
}
