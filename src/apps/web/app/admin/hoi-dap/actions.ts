'use server';

import type { AnswerActionResult } from './hoi-dap-constants';
import { revalidatePath } from 'next/cache';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import type { RecipeSchema } from '~/lib/recipes/database';
import { requireAdminUser } from '~/lib/server/require-admin-action';

export async function answerQuestionAction(
  _prev: AnswerActionResult,
  formData: FormData,
): Promise<AnswerActionResult> {
  await requireAdminUser();

  const id = Number(formData.get('id'));
  const answer = String(formData.get('answer') ?? '').trim();

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: 'Câu hỏi không hợp lệ.' };
  }

  if (answer.length === 0) {
    return { ok: false, message: 'Vui lòng nhập câu trả lời.' };
  }

  const admin = getSupabaseServerAdminClient<RecipeSchema>();

  const { error } = await admin
    .from('recipe_questions')
    .update({
      answer,
      answered_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return { ok: false, message: `Không lưu được: ${error.message}` };
  }

  revalidatePath('/admin/hoi-dap');

  return { ok: true };
}

export async function deleteQuestionAction(
  _prev: AnswerActionResult,
  formData: FormData,
): Promise<AnswerActionResult> {
  await requireAdminUser();

  const id = Number(formData.get('id'));

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: 'Câu hỏi không hợp lệ.' };
  }

  const admin = getSupabaseServerAdminClient<RecipeSchema>();

  const { error } = await admin.from('recipe_questions').delete().eq('id', id);

  if (error) {
    return { ok: false, message: `Không xóa được: ${error.message}` };
  }

  revalidatePath('/admin/hoi-dap');

  return { ok: true };
}
