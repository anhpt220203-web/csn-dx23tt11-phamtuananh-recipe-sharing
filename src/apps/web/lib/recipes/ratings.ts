/**
 * Truy vấn bảng `ratings` (đánh giá sao) — FR6.
 *
 * Schema DB (task 2, migration 20261014140000_recipes.sql):
 *   ratings(user_id uuid, recipe_id bigint, rating smallint 1–5, ...)
 *   UNIQUE(user_id, recipe_id): mỗi người chỉ đánh giá 1 công thức 1 lần.
 *   RLS: đọc công khai (để hiển thị điểm trung bình), chỉ chủ sở hữu được ghi.
 */
import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { getCurrentUserId } from './favorites';

export type RatingRow = {
  user_id: string;
  recipe_id: number;
  rating: number;
  created_at: string;
  updated_at: string;
};

export type RatingSummary = {
  /** Điểm trung bình, null khi chưa có đánh giá nào. */
  average: number | null;
  /** Tổng số lượt đánh giá. */
  count: number;
};

type TableDef<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Row>;
  Relationships: never[];
};

/**
 * Schema tối thiểu cho supabase-js generic.
 */
export type RatingsSchema = {
  public: {
    Tables: {
      ratings: TableDef<
        RatingRow,
        { user_id: string; recipe_id: number; rating: number }
      >;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

function getClient() {
  return getSupabaseServerClient<RatingsSchema>();
}

/**
 * Điểm trung bình và số lượt đánh giá của một công thức.
 * Đọc công khai theo RLS nên không cần đăng nhập.
 */
export async function getRatingSummary(recipeId: number): Promise<RatingSummary> {
  const client = getClient();

  const { data, error } = await client
    .from('ratings')
    .select('rating')
    .eq('recipe_id', recipeId);

  if (error) {
    throw new Error(`Không tải được đánh giá: ${error.message}`);
  }

  const scores = (data ?? []).map((row) => row.rating);

  if (scores.length === 0) {
    return { average: null, count: 0 };
  }

  const total = scores.reduce((sum, score) => sum + score, 0);

  return { average: total / scores.length, count: scores.length };
}

/**
 * Số sao người dùng hiện tại đã đánh giá cho công thức.
 * Trả về null khi chưa đăng nhập hoặc chưa đánh giá.
 */
export async function getMyRating(recipeId: number): Promise<number | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const client = getClient();

  const { data, error } = await client
    .from('ratings')
    .select('rating')
    .eq('recipe_id', recipeId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Không tải được đánh giá của bạn: ${error.message}`);
  }

  return data?.rating ?? null;
}
