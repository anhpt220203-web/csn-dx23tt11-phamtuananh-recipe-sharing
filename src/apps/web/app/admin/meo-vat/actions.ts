'use server';

import type { TipActionResult } from './meo-vat-constants';
import { revalidatePath } from 'next/cache';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import type { ContentSchema } from '~/lib/content/database';
import { slugify } from '~/lib/recipes/slugify';
import { requireAdminUser } from '~/lib/server/require-admin-action';
import {
  normalizeDirectImageUrl,
  removeStorageImage,
  uploadStorageImage,
} from '~/lib/server/storage-images';

function getAdmin() {
  return getSupabaseServerAdminClient<ContentSchema>();
}

function parseTip(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const rawSlug = String(formData.get('slug') ?? '').trim();
  const excerpt = String(formData.get('excerpt') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const imageUrlText = String(formData.get('image_url') ?? '').trim();
  const existingImageUrl = String(
    formData.get('existing_image_url') ?? '',
  ).trim();
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
      is_published: isPublished,
    },
    imageFile:
      formData.get('image_file') instanceof File
        ? (formData.get('image_file') as File)
        : null,
    imageUrlText,
    existingImageUrl,
  };
}

/**
 * Chốt URL ảnh đại diện của bài mẹo vặt:
 * - có file mới -> upload vào thư mục `tips/`, dọn ảnh cũ trong Storage;
 * - không file nhưng có URL dán tay -> dùng URL, dọn ảnh cũ trong Storage;
 * - còn lại -> giữ ảnh cũ (hoặc null khi tạo mới/xóa ảnh).
 */
async function resolveTipImageUrl(
  imageFile: File | null,
  imageUrlText: string,
  existingImageUrl: string,
): Promise<string | null> {
  if (imageFile && imageFile.size > 0) {
    const uploadedUrl = await uploadStorageImage(imageFile, 'tips');

    if (existingImageUrl && existingImageUrl !== uploadedUrl) {
      await removeStorageImage(existingImageUrl);
    }

    return uploadedUrl;
  }

  const directUrl = normalizeDirectImageUrl(imageUrlText);

  if (directUrl) {
    if (existingImageUrl && existingImageUrl !== directUrl) {
      await removeStorageImage(existingImageUrl);
    }

    return directUrl;
  }

  return existingImageUrl.length > 0 ? existingImageUrl : null;
}

export async function createTipAction(
  _prev: TipActionResult,
  formData: FormData,
): Promise<TipActionResult> {
  try {
    await requireAdminUser();

    const parsed = parseTip(formData);

    if (!parsed.ok) {
      return { ok: false, message: parsed.error };
    }

    if (parsed.imageUrlText && !normalizeDirectImageUrl(parsed.imageUrlText)) {
      return { ok: false, message: 'Link ảnh trực tiếp không hợp lệ.' };
    }

    const imageUrl = await resolveTipImageUrl(
      parsed.imageFile,
      parsed.imageUrlText,
      '',
    );

    const admin = getAdmin();
    const { error } = await admin
      .from('tips')
      .insert({ ...parsed.data, image_url: imageUrl });

    if (error) {
      // Upload ảnh xong mà insert lỗi -> dọn ảnh vừa upload.
      await removeStorageImage(imageUrl);

      return { ok: false, message: `Không tạo được bài viết: ${error.message}` };
    }

    revalidatePath('/admin/meo-vat');
    revalidatePath('/meo-vat');
    revalidatePath('/');

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra.',
    };
  }
}

export async function updateTipAction(
  _prev: TipActionResult,
  formData: FormData,
): Promise<TipActionResult> {
  try {
    await requireAdminUser();

    const id = Number(formData.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      return { ok: false, message: 'Bài viết không hợp lệ.' };
    }

    const parsed = parseTip(formData);

    if (!parsed.ok) {
      return { ok: false, message: parsed.error };
    }

    if (parsed.imageUrlText && !normalizeDirectImageUrl(parsed.imageUrlText)) {
      return { ok: false, message: 'Link ảnh trực tiếp không hợp lệ.' };
    }

    const imageUrl = await resolveTipImageUrl(
      parsed.imageFile,
      parsed.imageUrlText,
      parsed.existingImageUrl,
    );

    const admin = getAdmin();
    const { error } = await admin
      .from('tips')
      .update({ ...parsed.data, image_url: imageUrl })
      .eq('id', id);

    if (error) {
      return { ok: false, message: `Không cập nhật được: ${error.message}` };
    }

    revalidatePath('/admin/meo-vat');
    revalidatePath('/meo-vat');
    revalidatePath('/');

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra.',
    };
  }
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

  const { data: existing } = await admin
    .from('tips')
    .select('image_url')
    .eq('id', id)
    .maybeSingle();

  const { error } = await admin.from('tips').delete().eq('id', id);

  if (error) {
    return { ok: false, message: `Không xóa được: ${error.message}` };
  }

  // Dọn ảnh đại diện trong Storage (best-effort, bỏ qua ảnh URL ngoài).
  await removeStorageImage(existing?.image_url ?? null);

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
