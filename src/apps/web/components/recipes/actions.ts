'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { RecipeSchema } from '~/lib/recipes/database';

export type QuestionActionResult =
  | { ok: true; asked?: boolean }
  | { ok: false; message: string };

export const QUESTION_ACTION_INITIAL: QuestionActionResult = { ok: true };

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
