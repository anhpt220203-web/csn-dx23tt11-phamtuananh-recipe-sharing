/**
 * Kiểu dữ liệu cho các bảng công thức nấu ăn (Supabase).
 *
 * Khớp với migration `supabase/migrations/20261014140000_recipes.sql`
 * (TASK 2): categories, recipes, recipe_ingredients, recipe_steps,
 * favorites, ratings. Không dùng Prisma — mọi truy vấn đi qua
 * Supabase client của makerkit.
 */

export type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

export type RecipeRow = {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  source_name: string | null;
  source_url: string | null;
  servings: number | null;
  /** Thời gian nấu (phút). */
  cook_time: number | null;
  difficulty: string | null;
  /** Trạng thái xuất bản: 'published' | 'draft'. */
  status: string;
  created_by: string | null;
};

export type RecipeIngredientRow = {
  id: number;
  recipe_id: number;
  name: string;
  position: number;
};

export type RecipeStepRow = {
  id: number;
  recipe_id: number;
  step: string;
  position: number;
};

/** Món yêu thích: khóa chính kép (user_id, recipe_id). */
export type FavoriteRow = {
  user_id: string;
  recipe_id: number;
  created_at: string;
};

/** Đánh giá 1–5 sao, UNIQUE(user_id, recipe_id). */
export type RatingRow = {
  user_id: string;
  recipe_id: number;
  rating: number;
  created_at: string;
  updated_at: string;
};

/** Điểm trung bình + số lượt đánh giá của một công thức. */
export type RatingSummary = {
  /** null khi chưa có lượt đánh giá nào. */
  average: number | null;
  count: number;
};

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: never[];
};

/**
 * Schema tối thiểu cho supabase-js generic.
 */
export type RecipeSchema = {
  public: {
    Tables: {
      categories: TableDef<CategoryRow>;
      recipes: TableDef<RecipeRow>;
      recipe_ingredients: TableDef<RecipeIngredientRow>;
      recipe_steps: TableDef<RecipeStepRow>;
      favorites: TableDef<FavoriteRow>;
      ratings: TableDef<RatingRow>;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      /** Thu hồi toàn bộ session của user (TASK 5) — trả về số session đã xóa. */
      revoke_user_sessions: {
        Args: { p_user_id: string };
        Returns: number;
      };
      /** Tìm kiếm công thức theo SRS FR3 (migration 20261015230500). */
      search_recipes: {
        Args: {
          p_query: string;
          p_category_slug: string | null;
          p_sort: string;
        };
        Returns: RecipeSearchRow[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

/** Công thức kèm tên danh mục — dùng cho card danh sách. */
export type RecipeWithCategory = RecipeRow & {
  category_name: string;
  category_slug: string;
};

/**
 * Một dòng kết quả của RPC `public.search_recipes` (FR3):
 * công thức + tên nhóm món + điểm đánh giá tổng hợp.
 */
export type RecipeSearchRow = {
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
  /** Thời điểm tạo (ISO string) — có trong kết quả RPC search_recipes. */
  created_at: string;
  category_name: string;
  category_slug: string;
  /** Điểm trung bình, null khi chưa có lượt đánh giá nào. */
  rating_average: number | null;
  rating_count: number;
};

/** Công thức đầy đủ kèm nguyên liệu + các bước — dùng cho trang chi tiết. */
export type RecipeDetail = RecipeWithCategory & {
  ingredients: string[];
  steps: string[];
};
