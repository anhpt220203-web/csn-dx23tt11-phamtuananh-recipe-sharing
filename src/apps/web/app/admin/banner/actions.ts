'use server';

import type { BannerActionResult } from './banner-constants';
import { revalidatePath } from 'next/cache';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import type { ContentSchema } from '~/lib/content/database';
import { requireAdminUser } from '~/lib/server/require-admin-action';

function getAdmin() {
  return getSupabaseServerAdminClient<ContentSchema>();
}

function parseBanner(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const subtitle = String(formData.get('subtitle') ?? '').trim();
  const imageUrl = String(formData.get('image_url') ?? '').trim();
  const linkUrl = String(formData.get('link_url') ?? '').trim();
  const sortOrder = Number(formData.get('sort_order') ?? 0);
  const isActive = formData.get('is_active') === 'on';

  if (title.length === 0) {
    return { ok: false as const, error: 'Vui lòng nhập tiêu đề banner.' };
  }

  return {
    ok: true as const,
    data: {
      title,
      subtitle: subtitle.length > 0 ? subtitle : null,
      image_url: imageUrl.length > 0 ? imageUrl : null,
      link_url: linkUrl.length > 0 ? linkUrl : null,
      sort_order: Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0,
      is_active: isActive,
    },
  };
}

export async function createBannerAction(
  _prev: BannerActionResult,
  formData: FormData,
): Promise<BannerActionResult> {
  await requireAdminUser();

  const parsed = parseBanner(formData);

  if (!parsed.ok) {
    return { ok: false, message: parsed.error };
  }

  const admin = getAdmin();
  const { error } = await admin.from('banners').insert(parsed.data);

  if (error) {
    return { ok: false, message: `Không tạo được banner: ${error.message}` };
  }

  revalidatePath('/admin/banner');
  revalidatePath('/');

  return { ok: true };
}

export async function updateBannerAction(
  _prev: BannerActionResult,
  formData: FormData,
): Promise<BannerActionResult> {
  await requireAdminUser();

  const id = Number(formData.get('id'));

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: 'Banner không hợp lệ.' };
  }

  const parsed = parseBanner(formData);

  if (!parsed.ok) {
    return { ok: false, message: parsed.error };
  }

  const admin = getAdmin();
  const { error } = await admin.from('banners').update(parsed.data).eq('id', id);

  if (error) {
    return { ok: false, message: `Không cập nhật được banner: ${error.message}` };
  }

  revalidatePath('/admin/banner');
  revalidatePath('/');

  return { ok: true };
}

export async function deleteBannerAction(
  _prev: BannerActionResult,
  formData: FormData,
): Promise<BannerActionResult> {
  await requireAdminUser();

  const id = Number(formData.get('id'));

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: 'Banner không hợp lệ.' };
  }

  const admin = getAdmin();
  const { error } = await admin.from('banners').delete().eq('id', id);

  if (error) {
    return { ok: false, message: `Không xóa được banner: ${error.message}` };
  }

  revalidatePath('/admin/banner');
  revalidatePath('/');

  return { ok: true };
}
