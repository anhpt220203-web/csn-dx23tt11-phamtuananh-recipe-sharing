import type { Metadata } from 'next';
import { connection } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import type { MediaItem } from './_components/media-browser';
import { MediaBrowser } from './_components/media-browser';
import { MEDIA_BUCKET } from '~/lib/server/storage-images';

export const metadata: Metadata = {
  title: 'Quản lý media',
};

export const instant = false;

/**
 * Các thư mục nguồn trong bucket `recipe-images` (khớp với
 * `MediaFolder` trong lib/server/storage-images).
 */
const MEDIA_FOLDERS = ['recipes', 'tips', 'categories', 'uploads'] as const;

const PAGE_SIZE = 100;
const MAX_PAGES = 5; // giới hạn 500 file/thư mục để trang không quá nặng

function toSourceLabel(folder: string): string {
  switch (folder) {
    case 'recipes':
      return 'recipes';
    case 'tips':
      return 'tips';
    case 'categories':
      return 'categories';
    case 'uploads':
      return 'uploads';
    default:
      return 'khac';
  }
}

/**
 * Liệt kê toàn bộ file trong một prefix của bucket (phân trang bằng offset).
 */
async function listFolder(prefix: string): Promise<MediaItem[]> {
  const admin = getSupabaseServerAdminClient();
  const items: MediaItem[] = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const { data, error } = await admin.storage
      .from(MEDIA_BUCKET)
      .list(prefix, { limit: PAGE_SIZE, offset: page * PAGE_SIZE });

    if (error) {
      throw new Error(`Không liệt kê được ảnh (${prefix}): ${error.message}`);
    }

    const files = data ?? [];

    for (const file of files) {
      // Bỏ qua các mục thư mục con (Supabase trả về với id null).
      if (!file.id) {
        continue;
      }

      items.push({
        path: prefix ? `${prefix}/${file.name}` : file.name,
        name: file.name,
        source: toSourceLabel(prefix),
        createdAt: file.created_at ?? null,
        size: file.metadata?.size ?? null,
      });
    }

    if (files.length < PAGE_SIZE) {
      break;
    }
  }

  return items;
}

export default async function MediaAdminPage() {
  // Trang admin đọc Storage mỗi request, không prerender lúc build
  // (tránh gọi service-role key khi biến môi trường chưa có).
  await connection();

  const folders = await Promise.all(MEDIA_FOLDERS.map(listFolder));

  const rootItems = await listFolder('');

  // Bỏ các mục trùng tên thư mục đã liệt kê ở root.
  const knownFolders = new Set<string>(MEDIA_FOLDERS);
  const extraItems = rootItems.filter(
    (item) => !knownFolders.has(item.name.split('/')[0] ?? ''),
  );

  const items: MediaItem[] = [...folders.flat(), ...extraItems].sort(
    (a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;

      return bTime - aTime;
    },
  );

  return (
    <div className={'flex flex-col gap-6'}>
      <div>
        <h1 className={'text-2xl font-bold tracking-tight'}>Quản lý media</h1>

        <p className={'text-muted-foreground mt-1 text-sm'}>
          Toàn bộ ảnh đã tải lên kho lưu trữ (bucket “recipe-images”). Lọc
          theo nguồn, xem ảnh gốc hoặc xóa ảnh không còn dùng.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={'text-base'}>
            Thư viện ảnh ({items.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          <MediaBrowser items={items} />
        </CardContent>
      </Card>
    </div>
  );
}
