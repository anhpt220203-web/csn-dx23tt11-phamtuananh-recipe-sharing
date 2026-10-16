'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import type { RecipeSchema } from '~/lib/recipes/database';
import { slugify } from '~/lib/recipes/slugify';
import { requireAdminUser } from '~/lib/server/require-admin-action';

export type CategoryActionResult =
  | { ok: true }
  | { ok: false; message: string };

const INITIAL: CategoryActionResult = { ok: true };

function getAdmin() {
  return getSupabaseServerAdminClient<RecipeSchema>();
}

const VALID_DIMENSIONS = [
  'nhom-mon',
  'nguyen-lieu-chinh',
  'phuong-phap-che-bien',
  'bua-an',
  'phong-cach-am-thuc',
] as const;

type ParsedCategory =
  | {
      ok: true;
      data: {
        name: string;
        slug: string;
        description: string | null;
        dimension: string;
      };
    }
  | { ok: false; error: string };

function parseCategory(formData: FormData): ParsedCategory {
  const name = String(formData.get('name') ?? '').trim();
  const rawSlug = String(formData.get('slug') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const rawDimension = String(formData.get('dimension') ?? 'nhom-mon').trim();
  const dimension = (VALID_DIMENSIONS as readonly string[]).includes(rawDimension)
    ? rawDimension
    : 'nhom-mon';

  if (name.length === 0) {
    return { ok: false, error: 'Vui lòng nhập tên danh mục.' };
  }

  const slug = slugify(rawSlug || name);

  if (slug.length === 0) {
    return { ok: false, error: 'Không tạo được slug từ tên đã nhập.' };
  }

  return {
    ok: true,
    data: {
      name,
      slug,
      description: description.length > 0 ? description : null,
      dimension,
    },
  };
}

export async function createCategoryAction(
  _prev: CategoryActionResult,
  formData: FormData,
): Promise<CategoryActionResult> {
  try {
    await requireAdminUser();

    const parsed = parseCategory(formData);

    if (!parsed.ok) {
      return { ok: false, message: parsed.error };
    }

    const { error } = await getAdmin().from('categories').insert(parsed.data);

    if (error) {
      if (error.code === '23505') {
        return { ok: false, message: 'Slug này đã tồn tại, hãy đổi tên khác.' };
      }

      return { ok: false, message: `Không thêm được: ${error.message}` };
    }

    revalidatePath('/admin/danh-muc');

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra.',
    };
  }
}

export async function updateCategoryAction(
  _prev: CategoryActionResult,
  formData: FormData,
): Promise<CategoryActionResult> {
  try {
    await requireAdminUser();

    const id = Number(formData.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      return { ok: false, message: 'Mã danh mục không hợp lệ.' };
    }

    const parsed = parseCategory(formData);

    if (!parsed.ok) {
      return { ok: false, message: parsed.error };
    }

    const { error } = await getAdmin()
      .from('categories')
      .update(parsed.data)
      .eq('id', id);

    if (error) {
      if (error.code === '23505') {
        return { ok: false, message: 'Slug này đã tồn tại, hãy đổi tên khác.' };
      }

      return { ok: false, message: `Không lưu được: ${error.message}` };
    }

    revalidatePath('/admin/danh-muc');

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra.',
    };
  }
}

export async function deleteCategoryAction(
  _prev: CategoryActionResult,
  formData: FormData,
): Promise<CategoryActionResult> {
  try {
    await requireAdminUser();

    const id = Number(formData.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      return { ok: false, message: 'Mã danh mục không hợp lệ.' };
    }

    const { error } = await getAdmin().from('categories').delete().eq('id', id);

    if (error) {
      // RLS/FK: on delete restrict — còn công thức thì không xóa được.
      return {
        ok: false,
        message:
          'Không xóa được danh mục (có thể vẫn còn công thức thuộc danh mục này).',
      };
    }

    revalidatePath('/admin/danh-muc');

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra.',
    };
  }
}

export { INITIAL as CATEGORY_ACTION_INITIAL };
