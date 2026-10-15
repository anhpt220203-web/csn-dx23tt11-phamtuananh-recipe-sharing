'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import type { RecipeSchema } from '~/lib/recipes/database';
import { slugify } from '~/lib/recipes/slugify';
import { requireAdminUser } from '~/lib/server/require-admin-action';

export type RecipeActionResult =
  | { ok: true }
  | { ok: false; message: string };

const INITIAL: RecipeActionResult = { ok: true };

const IMAGE_BUCKET = 'recipe-images';
const IMAGE_FOLDER = 'recipes';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const DIFFICULTIES = ['Dễ', 'Trung bình', 'Khó'] as const;

const STATUSES = ['draft', 'published'] as const;

/** Trạng thái xuất bản hợp lệ của công thức. */
type RecipeStatus = (typeof STATUSES)[number];

type AdminClient = ReturnType<typeof getSupabaseServerAdminClient<RecipeSchema>>;

/**
 * Tải ảnh lên Supabase Storage (bucket `recipe-images`).
 * Tên file sinh ngẫu nhiên (UUID) để không bao giờ trùng.
 * Trả về public URL của ảnh.
 */
async function uploadRecipeImage(
  admin: AdminClient,
  file: File,
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Ảnh phải có định dạng JPG, PNG, WEBP hoặc GIF.');
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Ảnh quá lớn — tối đa 5MB.');
  }

  const extension = file.type.split('/')[1] ?? 'jpg';
  const fileName = `${IMAGE_FOLDER}/${crypto.randomUUID()}.${extension}`;

  const { error } = await admin.storage
    .from(IMAGE_BUCKET)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Không tải được ảnh lên kho lưu trữ: ${error.message}`);
  }

  return admin.storage.from(IMAGE_BUCKET).getPublicUrl(fileName).data.publicUrl;
}

/**
 * Xóa file ảnh trong bucket khi công thức bị xóa / thay ảnh mới.
 * Lấy path từ public URL — thất bại thì bỏ qua (best-effort).
 */
async function removeRecipeImage(admin: AdminClient, imageUrl: string | null) {
  if (!imageUrl) {
    return;
  }

  const marker = `/${IMAGE_BUCKET}/`;
  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    return;
  }

  const path = imageUrl.slice(index + marker.length);

  await admin.storage.from(IMAGE_BUCKET).remove([path]);
}

function splitLines(value: FormDataEntryValue | null): string[] {
  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function parsePositiveInt(value: FormDataEntryValue | null): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseNonNegativeInt(value: FormDataEntryValue | null): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

/**
 * Thêm mới / cập nhật công thức (kèm nguyên liệu, các bước và ảnh đại diện).
 * Form gửi `id` khi sửa; không có `id` là thêm mới.
 * Thành công -> chuyển về danh sách công thức.
 */
export async function saveRecipeAction(
  _prev: RecipeActionResult,
  formData: FormData,
): Promise<RecipeActionResult> {
  try {
    const { adminClient: admin } = await requireAdminUser();

    const idRaw = formData.get('id');
    const id =
      typeof idRaw === 'string' && idRaw.length > 0 ? Number(idRaw) : null;

    if (id !== null && (!Number.isInteger(id) || id <= 0)) {
      return { ok: false, message: 'Mã công thức không hợp lệ.' };
    }

    const title = String(formData.get('title') ?? '').trim();

    if (title.length === 0) {
      return { ok: false, message: 'Vui lòng nhập tên món ăn.' };
    }

    const slug = slugify(String(formData.get('slug') ?? '').trim() || title);

    if (slug.length === 0) {
      return { ok: false, message: 'Không tạo được slug từ tên món.' };
    }

    const categoryId = parsePositiveInt(formData.get('category_id'));

    if (categoryId === null) {
      return { ok: false, message: 'Vui lòng chọn danh mục.' };
    }

    const description = String(formData.get('description') ?? '').trim();
    const sourceName = String(formData.get('source_name') ?? '').trim();
    const sourceUrl = String(formData.get('source_url') ?? '').trim();
    const servings = parsePositiveInt(formData.get('servings'));
    const cookTime = parseNonNegativeInt(formData.get('cook_time'));

    const difficultyRaw = String(formData.get('difficulty') ?? '');
    const difficulty = (
      DIFFICULTIES as readonly string[]
    ).includes(difficultyRaw)
      ? difficultyRaw
      : 'Trung bình';

    // Trạng thái chỉ chấp nhận 2 giá trị hợp lệ; mặc định là Nháp để
    // công thức mới không bị public ngay lập tức.
    const statusRaw = String(formData.get('status') ?? '').trim();

    if (
      statusRaw.length > 0 &&
      !(STATUSES as readonly string[]).includes(statusRaw)
    ) {
      return { ok: false, message: 'Trạng thái công thức không hợp lệ.' };
    }

    const status: RecipeStatus =
      statusRaw === 'published' ? 'published' : 'draft';

    const ingredients = splitLines(formData.get('ingredients'));
    const steps = splitLines(formData.get('steps'));

    // Ảnh: file mới (nếu có) -> upload; không thì giữ ảnh cũ.
    const imageFile = formData.get('image');
    const existingImageUrl = String(formData.get('existing_image_url') ?? '');

    let imageUrl: string | null =
      existingImageUrl.length > 0 ? existingImageUrl : null;

    if (imageFile instanceof File && imageFile.size > 0) {
      imageUrl = await uploadRecipeImage(admin, imageFile);

      // Sửa công thức + đổi ảnh: xóa ảnh cũ cho gọn kho lưu trữ.
      if (id !== null && existingImageUrl && existingImageUrl !== imageUrl) {
        await removeRecipeImage(admin, existingImageUrl);
      }
    }

    const recipePayload = {
      category_id: categoryId,
      title,
      slug,
      description: description.length > 0 ? description : null,
      image_url: imageUrl,
      source_name: sourceName.length > 0 ? sourceName : null,
      source_url: sourceUrl.length > 0 ? sourceUrl : null,
      servings,
      cook_time: cookTime,
      difficulty,
      status,
    };

    let recipeId = id;

    if (recipeId === null) {
      const { data, error } = await admin
        .from('recipes')
        .insert(recipePayload)
        .select('id')
        .single();

      if (error || !data) {
        // Nếu upload ảnh xong mà insert lỗi -> dọn ảnh vừa upload.
        await removeRecipeImage(admin, imageUrl);

        return {
          ok: false,
          message:
            error?.code === '23505'
              ? 'Slug này đã tồn tại, hãy đổi tên món khác.'
              : `Không thêm được công thức: ${error?.message ?? 'lỗi không rõ'}`,
        };
      }

      recipeId = data.id;
    } else {
      const { error } = await admin
        .from('recipes')
        .update(recipePayload)
        .eq('id', recipeId);

      if (error) {
        return {
          ok: false,
          message:
            error.code === '23505'
              ? 'Slug này đã tồn tại, hãy đổi tên món khác.'
              : `Không lưu được công thức: ${error.message}`,
        };
      }

      // Thay toàn bộ nguyên liệu + các bước cũ.
      await admin.from('recipe_ingredients').delete().eq('recipe_id', recipeId);
      await admin.from('recipe_steps').delete().eq('recipe_id', recipeId);
    }

    if (ingredients.length > 0) {
      const { error } = await admin.from('recipe_ingredients').insert(
        ingredients.map((name, index) => ({
          recipe_id: recipeId as number,
          name,
          position: index,
        })),
      );

      if (error) {
        return { ok: false, message: `Không lưu được nguyên liệu: ${error.message}` };
      }
    }

    if (steps.length > 0) {
      const { error } = await admin.from('recipe_steps').insert(
        steps.map((step, index) => ({
          recipe_id: recipeId as number,
          step,
          position: index,
        })),
      );

      if (error) {
        return { ok: false, message: `Không lưu được các bước: ${error.message}` };
      }
    }

    revalidatePath('/admin/cong-thuc');
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra.',
    };
  }

  redirect('/admin/cong-thuc');
}

/**
 * Xóa công thức (nguyên liệu + các bước bị xóa theo nhờ ON DELETE CASCADE).
 * Ảnh đại diện trong Storage cũng được dọn (best-effort).
 */
export async function deleteRecipeAction(
  _prev: RecipeActionResult,
  formData: FormData,
): Promise<RecipeActionResult> {
  try {
    const { adminClient: admin } = await requireAdminUser();

    const id = Number(formData.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      return { ok: false, message: 'Mã công thức không hợp lệ.' };
    }

    const { data: existing } = await admin
      .from('recipes')
      .select('image_url')
      .eq('id', id)
      .maybeSingle();

    const { error } = await admin.from('recipes').delete().eq('id', id);

    if (error) {
      return { ok: false, message: `Không xóa được: ${error.message}` };
    }

    await removeRecipeImage(admin, existing?.image_url ?? null);

    revalidatePath('/admin/cong-thuc');

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra.',
    };
  }
}

export { INITIAL as RECIPE_ACTION_INITIAL };
