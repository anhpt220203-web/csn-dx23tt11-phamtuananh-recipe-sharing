'use server';

import type { TipActionResult } from './meo-vat-constants';
import { revalidatePath } from 'next/cache';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import type { ContentSchema } from '~/lib/content/database';
import { slugify } from '~/lib/recipes/slugify';
import { requireAdminUser } from '~/lib/server/require-admin-action';

function getAdmin() {
  return getSupabaseServerAdminClient<ContentSchema>();
}

function parseTip(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const rawSlug = String(formData.get('slug') ?? '').trim();
  const excerpt = String(formData.get('excerpt') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const imageUrl = String(formData.get('image_url') ?? '').trim();
  const isPublished = formData.get('is_published') === 'on';

  if (title.length === 0) {
    return { ok: false as const, error: 'Vui lòng nhập tiêu đề bài viết.' };
  }

  if (content.length === 0) {
    return { ok: false as const, error: 'Vui lòng nhập nội dung bài viết.' };
  }

  const slug = slugify(rawSlug || title);

  if (slug.length === 0) {
    return { ok: false as const, error: 'Không tạo được slug từ tiêu đề.' };
  }

  return {
    ok: true as const,
    data: {
      title,
      slug,
      excerpt: excerpt.length > 0 ? excerpt : null,
      content,
      image_url: imageUrl.length > 0 ? imageUrl : null,
      is_published: isPublished,
    },
  };
}

export async function createTipAction(
  _prev: TipActionResult,
  formData: FormData,
): Promise<TipActionResult> {
  await requireAdminUser();

  const parsed = parseTip(formData);

  if (!parsed.ok) {
    return { ok: false, message: parsed.error };
  }

  const admin = getAdmin();
  const { error } = await admin.from('tips').insert(parsed.data);

  if (error) {
    return { ok: false, message: `Không tạo được bài viết: ${error.message}` };
  }

  revalidatePath('/admin/meo-vat');
  revalidatePath('/meo-vat');
  revalidatePath('/');

  return { ok: true };
}

export async function updateTipAction(
  _prev: TipActionResult,
  formData: FormData,
): Promise<TipActionResult> {
  await requireAdminUser();

  const id = Number(formData.get('id'));

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: 'Bài viết không hợp lệ.' };
  }

  const parsed = parseTip(formData);

  if (!parsed.ok) {
    return { ok: false, message: parsed.error };
  }

  const admin = getAdmin();
  const { error } = await admin.from('tips').update(parsed.data).eq('id', id);

  if (error) {
    return { ok: false, message: `Không cập nhật được: ${error.message}` };
  }

  revalidatePath('/admin/meo-vat');
  revalidatePath('/meo-vat');
  revalidatePath('/');

  return { ok: true };
}

export async function deleteTipAction(
  _prev: TipActionResult,
  formData: FormData,
): Promise<TipActionResult> {
  await requireAdminUser();

  const id = Number(formData.get('id'));

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: 'Bài viết không hợp lệ.' };
  }

  const admin = getAdmin();
  const { error } = await admin.from('tips').delete().eq('id', id);

  if (error) {
    return { ok: false, message: `Không xóa được: ${error.message}` };
  }

  revalidatePath('/admin/meo-vat');
  revalidatePath('/meo-vat');
  revalidatePath('/');

  return { ok: true };
}

export async function toggleTipPublishAction(
  _prev: TipActionResult,
  formData: FormData,
): Promise<TipActionResult> {
  await requireAdminUser();

  const id = Number(formData.get('id'));
  const isPublished = formData.get('is_published') === 'on';

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: 'Bài viết không hợp lệ.' };
  }

  const admin = getAdmin();
  const { error } = await admin
    .from('tips')
    .update({ is_published: isPublished })
    .eq('id', id);

  if (error) {
    return { ok: false, message: `Không cập nhật được: ${error.message}` };
  }

  revalidatePath('/admin/meo-vat');
  revalidatePath('/meo-vat');
  revalidatePath('/');

  return { ok: true };
}
