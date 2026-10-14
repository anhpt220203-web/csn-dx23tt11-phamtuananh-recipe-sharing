'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { RecipeSchema } from './database';

export type ToggleFavoriteResult =
  | { ok: true; favorited: boolean }
  | { ok: false; reason: 'unauthenticated' | 'invalid' | 'error' };

async function getAuthenticatedUserId(): Promise<string | null> {
  const client = getSupabaseServerClient();
  const result = await requireUser(client);

  if (result.error || !result.data?.sub) {
    return null;
  }

  return result.data.sub;
}

/**
 * Đánh dấu / bỏ đánh dấu yêu thích một công thức.
 * Yêu cầu đăng nhập — kiểm tra ở phía server trước khi ghi.
 * RLS trên bảng favorites là lớp bảo vệ thứ hai (user_id = auth.uid()).
 */
export async function toggleFavoriteAction(
  recipeId: number,
  slug: string,
): Promise<ToggleFavoriteResult> {
  if (!Number.isInteger(recipeId) || recipeId <= 0) {
    return { ok: false, reason: 'invalid' };
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { ok: false, reason: 'unauthenticated' };
  }

  const client = getSupabaseServerClient<RecipeSchema>();

  const { data: existing, error: readError } = await client
    .from('favorites')
    .select('recipe_id')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .maybeSingle();

  if (readError) {
    return { ok: false, reason: 'error' };
  }

  if (existing) {
    const { error } = await client
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId);

    if (error) {
      return { ok: false, reason: 'error' };
    }
  } else {
    const { error } = await client.from('favorites').insert({
      user_id: userId,
      recipe_id: recipeId,
    });

    if (error) {
      return { ok: false, reason: 'error' };
    }
  }

  revalidatePath(`/cong-thuc/${slug}`);
  revalidatePath('/yeu-thich');

  return { ok: true, favorited: !existing };
}
