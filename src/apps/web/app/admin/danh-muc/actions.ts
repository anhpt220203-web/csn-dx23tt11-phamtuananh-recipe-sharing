'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import type { CategoryActionResult } from './category-constants';
import type { RecipeSchema } from '~/lib/recipes/database';
import { slugify } from '~/lib/recipes/slugify';
import { requireAdminUser } from '~/lib/server/require-admin-action';
import {
  normalizeDirectImageUrl,
  removeStorageImage,
  uploadStorageImage,
} from '~/lib/server/storage-images';


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
      imageFile: File | null;
      imageUrlText: string;
      existingImageUrl: string;
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
  const imageUrlText = String(formData.get('image_url') ?? '').trim();
  const existingImageUrl = String(
    formData.get('existing_image_url') ?? '',
  ).trim();

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
    imageFile:
      formData.get('image_file') instanceof File
        ? (formData.get('image_file') as File)
        : null,
    imageUrlText,
    existingImageUrl,
  };
}

/**
 * Chốt URL ảnh đại diện của danh mục:
 * - có file mới -> upload vào thư mục `categories/`, dọn ảnh cũ trong Storage;
 * - không file nhưng có URL dán tay -> dùng URL, dọn ảnh cũ trong Storage;
 * - còn lại -> giữ ảnh cũ (hoặc null khi tạo mới/xóa ảnh).
 */
async function resolveCategoryImageUrl(
  imageFile: File | null,
  imageUrlText: string,
  existingImageUrl: string,
): Promise<string | null> {
  if (imageFile && imageFile.size > 0) {
    const uploadedUrl = await uploadStorageImage(imageFile, 'categories');

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

    if (parsed.imageUrlText && !normalizeDirectImageUrl(parsed.imageUrlText)) {
      return {
        ok: false,
        message: 'Link ảnh đại diện phải bắt đầu bằng http:// hoặc https://.',
      };
    }

    const imageUrl = await resolveCategoryImageUrl(
      parsed.imageFile,
      parsed.imageUrlText,
      '',
    );

    const { data: inserted, error } = await getAdmin()
      .from('categories')
      .insert({ ...parsed.data, image_url: imageUrl })
      .select('id,name,slug,description,dimension,image_url')
      .single();

    if (error) {
      // Upload ảnh xong mà insert lỗi -> dọn ảnh vừa upload.
      await removeStorageImage(imageUrl);

      if (error.code === '23505') {
        return { ok: false, message: 'Slug này đã tồn tại, hãy đổi tên khác.' };
      }

      return { ok: false, message: `Không thêm được: ${error.message}` };
    }

    revalidatePath('/admin/danh-muc');
    revalidatePath('/admin/cong-thuc');

    return { ok: true, category: inserted };
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

    if (parsed.imageUrlText && !normalizeDirectImageUrl(parsed.imageUrlText)) {
      return {
        ok: false,
        message: 'Link ảnh đại diện phải bắt đầu bằng http:// hoặc https://.',
      };
    }

    const imageUrl = await resolveCategoryImageUrl(
      parsed.imageFile,
      parsed.imageUrlText,
      parsed.existingImageUrl,
    );

    const { error } = await getAdmin()
      .from('categories')
      .update({ ...parsed.data, image_url: imageUrl })
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
