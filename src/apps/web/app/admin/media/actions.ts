'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import type { MediaActionResult } from './media-constants';
import { requireAdminUser } from '~/lib/server/require-admin-action';
import {
  MEDIA_BUCKET,
  MediaFolder,
  extractStoragePath,
  uploadStorageImage,
} from '~/lib/server/storage-images';

/**
 * Xóa một file ảnh trong bucket `recipe-images` hoặc `account_image` (trang /admin/media).
 * Chỉ chấp nhận path tương đối trong bucket — chặn path traversal.
 */
export async function deleteMediaFileAction(
  _prev: MediaActionResult,
  formData: FormData,
): Promise<MediaActionResult> {
  try {
    await requireAdminUser();

    const path = String(formData.get('path') ?? '').trim();
    const rawBucket = String(formData.get('bucket') ?? MEDIA_BUCKET).trim();
    const bucket =
      rawBucket === 'account_image' ? 'account_image' : MEDIA_BUCKET;

    if (
      path.length === 0 ||
      path.startsWith('/') ||
      path.includes('..') ||
      path.includes('\\')
    ) {
      return { ok: false, message: 'Đường dẫn file không hợp lệ.' };
    }

    const admin = getSupabaseServerAdminClient();

    const { error } = await admin.storage.from(bucket).remove([path]);

    if (error) {
      return { ok: false, message: `Không xóa được ảnh: ${error.message}` };
    }

    // Nếu xóa avatar trong bucket account_image, xóa luôn liên kết trong bảng accounts
    if (bucket === 'account_image') {
      const fileName = path.split('/').pop()?.split('?')[0];
      const userId = fileName?.split('.')[0];

      if (userId) {
        await admin
          .from('accounts')
          .update({ picture_url: null })
          .eq('id', userId);
      }
    }

    revalidatePath('/admin/media');

    return { ok: true, message: 'Đã xóa ảnh thành công.' };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Có lỗi xảy ra.',
    };
  }
}

/**
 * Tải một hoặc nhiều file ảnh lên kho lưu trữ `recipe-images`.
 */
export async function uploadMediaFileAction(
  _prev: MediaActionResult,
  formData: FormData,
): Promise<MediaActionResult> {
  try {
    await requireAdminUser();

    const files = formData
      .getAll('files')
      .filter((item): item is File => item instanceof File && item.size > 0);
    const rawFolder = String(formData.get('folder') ?? 'uploads').trim();
    const folder = (
      ['recipes', 'tips', 'categories', 'banners', 'uploads'].includes(rawFolder)
        ? rawFolder
        : 'uploads'
    ) as MediaFolder;

    if (files.length === 0) {
      return { ok: false, message: 'Vui lòng chọn ít nhất một file ảnh.' };
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return {
          ok: false,
          message: `File "${file.name}" không phải là ảnh hợp lệ.`,
        };
      }
      if (file.size > 5 * 1024 * 1024) {
        return {
          ok: false,
          message: `File "${file.name}" vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.`,
        };
      }
    }

    const uploadedItems = [];
    for (const file of files) {
      const publicUrl = await uploadStorageImage(file, folder);
      const storagePath = extractStoragePath(publicUrl);
      const proxyUrl = storagePath
        ? `/api/image/recipe-images/${storagePath}`
        : publicUrl;

      uploadedItems.push({
        name: file.name,
        url: publicUrl,
        proxyUrl,
      });
    }

    revalidatePath('/admin/media');
    revalidatePath('/admin/meo-vat');

    return {
      ok: true,
      message: `Đã tải lên thành công ${files.length} ảnh vào thư mục "${folder}".`,
      uploadedItems,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Tải ảnh thất bại.',
    };
  }
}

/**
 * Đổi tên một file ảnh trong bucket Storage (`recipe-images` hoặc `account_image`).
 * Tự động cập nhật liên kết `image_url` / `picture_url` trong các bảng cơ sở dữ liệu
 * (recipes, tips, categories, banners, accounts) để không bị hỏng ảnh hiển thị.
 */
export async function renameMediaFileAction(
  _prev: MediaActionResult,
  formData: FormData,
): Promise<MediaActionResult> {
  try {
    await requireAdminUser();

    const path = String(formData.get('path') ?? '').trim();
    const rawBucket = String(formData.get('bucket') ?? MEDIA_BUCKET).trim();
    const bucket =
      rawBucket === 'account_image' ? 'account_image' : MEDIA_BUCKET;
    const rawNewName = String(formData.get('newName') ?? '').trim();

    if (
      path.length === 0 ||
      path.startsWith('/') ||
      path.includes('..') ||
      path.includes('\\')
    ) {
      return { ok: false, message: 'Đường dẫn file ban đầu không hợp lệ.' };
    }

    if (
      rawNewName.length === 0 ||
      rawNewName.includes('/') ||
      rawNewName.includes('\\') ||
      rawNewName.includes('..')
    ) {
      return {
        ok: false,
        message: 'Tên file mới không hợp lệ (không chứa ký tự gạch chéo hoặc "..").',
      };
    }

    const lastSlash = path.lastIndexOf('/');
    const folder = lastSlash !== -1 ? path.substring(0, lastSlash) : '';
    const oldFileName = lastSlash !== -1 ? path.substring(lastSlash + 1) : path;

    const oldDotIdx = oldFileName.lastIndexOf('.');
    const oldExt =
      oldDotIdx !== -1 ? oldFileName.slice(oldDotIdx).toLowerCase() : '';

    const newDotIdx = rawNewName.lastIndexOf('.');
    let newBaseName = rawNewName;
    let newExt = oldExt;

    const VALID_EXTS = [
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.gif',
      '.avif',
      '.svg',
    ];

    if (newDotIdx !== -1) {
      const candidateExt = rawNewName.slice(newDotIdx).toLowerCase();
      if (VALID_EXTS.includes(candidateExt)) {
        newExt = candidateExt;
        newBaseName = rawNewName.slice(0, newDotIdx);
      } else {
        newBaseName = rawNewName;
      }
    }

    // Chuẩn hóa tên file: loại bỏ dấu tiếng Việt, chuyển sang ký tự thường an toàn cho URL và S3/Storage
    const cleanBaseName = newBaseName
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!cleanBaseName) {
      return {
        ok: false,
        message: 'Tên file mới không hợp lệ (cần chứa chữ cái hoặc số).',
      };
    }

    const finalNewFileName = `${cleanBaseName}${newExt}`;
    const newPath = folder ? `${folder}/${finalNewFileName}` : finalNewFileName;

    if (newPath === path) {
      return {
        ok: false,
        message: 'Tên file mới trùng với tên file hiện tại.',
      };
    }

    const admin = getSupabaseServerAdminClient();

    // 1. Di chuyển (đổi tên) file trong Supabase Storage
    const { error: moveError } = await admin.storage
      .from(bucket)
      .move(path, newPath);

    if (moveError) {
      return {
        ok: false,
        message: `Không thể đổi tên file: ${moveError.message}`,
      };
    }

    // 2. Cập nhật các bản ghi trong DB tham chiếu đến ảnh cũ
    const replacePath = (val: string | null | undefined): string | null => {
      if (!val) return null;
      let next = val;
      if (next.includes(path)) {
        next = next.split(path).join(newPath);
      }
      if (folder === '' && next.includes(oldFileName)) {
        next = next.split(oldFileName).join(finalNewFileName);
      }
      return next;
    };

    if (bucket === MEDIA_BUCKET) {
      // Helper cập nhật image_url cho từng bảng
      const updateTableImages = async (tableName: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const client = admin as any;
        const { data: rows } = await client
          .from(tableName)
          .select('id, image_url')
          .not('image_url', 'is', null);

        if (rows && rows.length > 0) {
          for (const row of rows) {
            const updated = replacePath(row.image_url);
            if (updated && updated !== row.image_url) {
              await client
                .from(tableName)
                .update({ image_url: updated })
                .eq('id', row.id);
            }
          }
        }
      };

      await Promise.all([
        updateTableImages('recipes'),
        updateTableImages('tips'),
        updateTableImages('categories'),
        updateTableImages('banners'),
      ]);
    } else if (bucket === 'account_image') {
      const { data: accounts } = await admin
        .from('accounts')
        .select('id, picture_url')
        .not('picture_url', 'is', null);

      if (accounts && accounts.length > 0) {
        for (const acc of accounts) {
          const updated = replacePath(acc.picture_url);
          if (updated && updated !== acc.picture_url) {
            await admin
              .from('accounts')
              .update({ picture_url: updated })
              .eq('id', acc.id);
          }
        }
      }
    }

    revalidatePath('/admin/media');
    revalidatePath('/admin/cong-thuc');
    revalidatePath('/admin/meo-vat');
    revalidatePath('/admin/danh-muc');
    revalidatePath('/admin/banner');
    revalidatePath('/danh-muc');
    revalidatePath('/cong-thuc');
    revalidatePath('/');

    return {
      ok: true,
      message: `Đã đổi tên file thành "${finalNewFileName}".`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Đổi tên file thất bại.',
    };
  }
}
