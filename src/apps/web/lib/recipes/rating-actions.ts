'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { RatingSummary, RecipeSchema } from './database';

export type SetRatingResult =
  | {
      ok: true;
      userRating: number;
      summary: RatingSummary;
    }
  | { ok: false; reason: 'unauthenticated' | 'invalid' | 'error' };

export type RemoveRatingResult =
  | { ok: true; summary: RatingSummary }
  | { ok: false; reason: 'unauthenticated' | 'invalid' | 'error' };

async function getAuthenticatedUserId(): Promise<string | null> {
  const client = getSupabaseServerClient();
  const result = await requireUser(client);

  if (result.error || !result.data?.sub) {
    return null;
  }

  return result.data.sub;
}

function isValidScore(score: number): score is 1 | 2 | 3 | 4 | 5 {
  return (
    Number.isInteger(score) && score >= 1 && score <= 5
  );
}

async function fetchSummary(
  client: ReturnType<typeof getSupabaseServerClient<RecipeSchema>>,
  recipeId: number,
): Promise<RatingSummary> {
  const { data } = await client
    .from('ratings')
    .select('rating')
    .eq('recipe_id', recipeId);

  const count = data?.length ?? 0;

  if (count === 0) {
    return { average: null, count: 0 };
  }

  const total = (data ?? []).reduce((sum, item) => sum + item.rating, 0);

  return { average: total / count, count };
}

/**
 * Đánh giá (hoặc sửa đánh giá) một công thức với số sao 1–5.
 * Mỗi người chỉ có 1 đánh giá cho 1 công thức (UNIQUE ở DB + upsert).
 * Yêu cầu đăng nhập — kiểm tra ở phía server trước khi ghi.
 */
export async function setRatingAction(
  recipeId: number,
  slug: string,
  score: number,
): Promise<SetRatingResult> {
  if (!Number.isInteger(recipeId) || recipeId <= 0 || !isValidScore(score)) {
    return { ok: false, reason: 'invalid' };
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { ok: false, reason: 'unauthenticated' };
  }

  const client = getSupabaseServerClient<RecipeSchema>();

  const { error } = await client.from('ratings').upsert(
    {
      user_id: userId,
      recipe_id: recipeId,
      rating: score,
    },
    { onConflict: 'user_id,recipe_id' },
  );

  if (error) {
    return { ok: false, reason: 'error' };
  }

  const summary = await fetchSummary(client, recipeId);

  revalidatePath(`/cong-thuc/${slug}`);

  return { ok: true, userRating: score, summary };
}

/**
 * Xóa đánh giá của chính người dùng cho một công thức.
 */
export async function removeRatingAction(
  recipeId: number,
  slug: string,
): Promise<RemoveRatingResult> {
  if (!Number.isInteger(recipeId) || recipeId <= 0) {
    return { ok: false, reason: 'invalid' };
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { ok: false, reason: 'unauthenticated' };
  }

  const client = getSupabaseServerClient<RecipeSchema>();

  const { error } = await client
    .from('ratings')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId);

  if (error) {
    return { ok: false, reason: 'error' };
  }

  const summary = await fetchSummary(client, recipeId);

  revalidatePath(`/cong-thuc/${slug}`);

  return { ok: true, summary };
}
