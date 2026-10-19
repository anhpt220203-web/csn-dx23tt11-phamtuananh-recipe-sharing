'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { RecipeSchema } from '~/lib/recipes/database';

export type QuestionActionResult =
  | { ok: true; asked?: boolean }
  | { ok: false; message: string };

export async function askQuestionAction(
  _prev: QuestionActionResult,
  formData: FormData,
): Promise<QuestionActionResult> {
  const recipeId = Number(formData.get('recipe_id'));
  const question = String(formData.get('question') ?? '').trim();

  if (!Number.isInteger(recipeId) || recipeId <= 0) {
    return { ok: false, message: 'Công thức không hợp lệ.' };
  }

  if (question.length === 0) {
    return { ok: false, message: 'Vui lòng nhập câu hỏi.' };
  }

  if (question.length > 1000) {
    return { ok: false, message: 'Câu hỏi quá dài (tối đa 1000 ký tự).' };
  }

  const client = getSupabaseServerClient<RecipeSchema>();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { ok: false, message: 'Vui lòng đăng nhập để đặt câu hỏi.' };
  }

  const { error } = await client.from('recipe_questions').insert({
    recipe_id: recipeId,
    user_id: user.id,
    question,
  });

  if (error) {
    return { ok: false, message: `Không gửi được câu hỏi: ${error.message}` };
  }

  revalidatePath(`/cong-thuc/[slug]`, 'page');

  return { ok: true, asked: true };
}

export type LiveSearchItem = {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  categoryName: string | null;
  cookTime: number | null;
};

/**
 * Gợi ý tìm kiếm trực tiếp cho ô tìm kiếm trên thanh điều hướng Header.
 * Trả về tối đa 5 món ăn phù hợp nhất.
 */
export async function getLiveSearchSuggestionsAction(
  query: string,
): Promise<LiveSearchItem[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const { searchRecipes } = await import('~/lib/recipes/queries');
    const results = await searchRecipes({ q: trimmed });

    return results.slice(0, 5).map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      imageUrl: r.image_url,
      categoryName: r.category_name,
      cookTime: r.cook_time,
    }));
  } catch {
    return [];
  }
}
