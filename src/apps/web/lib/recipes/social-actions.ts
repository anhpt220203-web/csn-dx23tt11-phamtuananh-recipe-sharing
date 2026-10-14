/**
 * Server actions cho FR5 (yêu thích) và FR6 (đánh giá sao).
 *
 * Mọi thao tác ghi đều đi qua `enhanceAction` với `auth: true` (mặc định):
 * người dùng chưa đăng nhập bị chuyển hướng về /auth/sign-in ở phía server.
 * Quyền ghi chi tiết còn được RLS của Supabase bảo vệ ở tầng database.
 */
'use server';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { FavoritesSchema } from './favorites';
import type { RatingsSchema } from './ratings';

const RecipeIdSchema = z.object({
  recipeId: z.number().int().positive(),
});

const SubmitRatingSchema = z.object({
  recipeId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
});

async function getRecipeSlug(recipeId: number): Promise<string | null> {
  const client = getSupabaseServerClient<FavoritesSchema>();

  const { data } = await client
    .from('recipes')
    .select('slug')
    .eq('id', recipeId)
    .maybeSingle();

  return data?.slug ?? null;
}

function revalidateRecipePages(slug: string | null) {
  if (slug) {
    revalidatePath(`/cong-thuc/${slug}`);
  }

  revalidatePath('/yeu-thich');
}

/**
 * Đánh dấu / bỏ đánh dấu yêu thích một công thức.
 * Trả về trạng thái yêu thích sau khi thực hiện.
 */
export const toggleFavoriteAction = enhanceAction(
  async ({ recipeId }: z.infer<typeof RecipeIdSchema>, user) => {
    const client = getSupabaseServerClient<FavoritesSchema>();

    // Công thức phải tồn tại (RLS bảng recipes cho đọc công khai).
    const { data: recipe, error: recipeError } = await client
      .from('recipes')
      .select('id, slug')
      .eq('id', recipeId)
      .maybeSingle();

    if (recipeError) {
      throw new Error('Không kiểm tra được công thức, thử lại sau.');
    }

    if (!recipe) {
      throw new Error('Công thức không tồn tại.');
    }

    const { data: existing, error: lookupError } = await client
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
      .maybeSingle();

    if (lookupError) {
      throw new Error('Không kiểm tra được trạng thái yêu thích, thử lại sau.');
    }

    if (existing) {
      const { error } = await client
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId);

      if (error) {
        throw new Error('Bỏ đánh dấu yêu thích thất bại, thử lại sau.');
      }
    } else {
      const { error } = await client.from('favorites').insert({
        user_id: user.id,
        recipe_id: recipeId,
      });

      if (error) {
        throw new Error('Đánh dấu yêu thích thất bại, thử lại sau.');
      }
    }

    const favorited = !existing;

    revalidateRecipePages(recipe.slug);

    return { favorited };
  },
  {
    schema: RecipeIdSchema,
  },
);

/**
 * Gửi / cập nhật đánh giá sao (1–5) cho một công thức.
 * Mỗi người chỉ có 1 đánh giá cho 1 công thức: dùng upsert theo
 * UNIQUE(user_id, recipe_id) — đánh giá lại sẽ ghi đè điểm cũ.
 */
export const submitRatingAction = enhanceAction(
  async ({ recipeId, rating }: z.infer<typeof SubmitRatingSchema>, user) => {
    const client = getSupabaseServerClient<RatingsSchema>();

    const { error } = await client.from('ratings').upsert(
      {
        user_id: user.id,
        recipe_id: recipeId,
        rating,
      },
      { onConflict: 'user_id,recipe_id' },
    );

    if (error) {
      throw new Error('Gửi đánh giá thất bại, thử lại sau.');
    }

    const slug = await getRecipeSlug(recipeId);

    revalidateRecipePages(slug);

    return { rating };
  },
  {
    schema: SubmitRatingSchema,
  },
);
