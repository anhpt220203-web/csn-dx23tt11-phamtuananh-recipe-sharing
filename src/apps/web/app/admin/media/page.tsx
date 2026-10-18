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
const MEDIA_FOLDERS = ['recipes', 'tips', 'categories', 'uploads', 'avatars'] as const;

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
    case 'banners':
      return 'banners';
    case 'avatars':
      return 'avatars';
    case 'uploads':
      return 'uploads';
    default:
      return 'khac';
  }
}

/**
 * Liệt kê toàn bộ file trong một bucket và prefix (phân trang bằng offset).
 */
async function listFolder(bucket: string, prefix: string): Promise<MediaItem[]> {
  const admin = getSupabaseServerAdminClient();
  const items: MediaItem[] = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const { data, error } = await admin.storage
      .from(bucket)
      .list(prefix, { limit: PAGE_SIZE, offset: page * PAGE_SIZE });

    if (error) {
      console.warn(`Không liệt kê được ảnh (${bucket}/${prefix}): ${error.message}`);
      return [];
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
        bucket,
        source: bucket === 'account_image' ? 'avatars' : toSourceLabel(prefix),
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

function normalizePath(url: string | null | undefined): string {
  if (!url) return '';
  const marker = '/recipe-images/';
  const idx = url.indexOf(marker);
  if (idx !== -1) {
    return url.slice(idx + marker.length).split('?')[0] ?? '';
  }
  if (url.startsWith('recipe-images/')) {
    return url.slice('recipe-images/'.length).split('?')[0] ?? '';
  }
  return url.split('?')[0] ?? '';
}

export default async function MediaAdminPage() {
  // Trang admin đọc Storage mỗi request, không prerender lúc build
  // (tránh gọi service-role key khi biến môi trường chưa có).
  await connection();

  const admin = getSupabaseServerAdminClient();

  const [
    recipeImageFolders,
    recipeImageRootItems,
    avatarBucketItems,
    recipesRes,
    tipsRes,
    categoriesRes,
    bannersRes,
    accountsRes,
  ] = await Promise.all([
    Promise.all(MEDIA_FOLDERS.map((f) => listFolder(MEDIA_BUCKET, f))),
    listFolder(MEDIA_BUCKET, ''),
    listFolder('account_image', ''),
    admin
      .from('recipes')
      .select('image_url, title')
      .not('image_url', 'is', null),
    admin.from('tips').select('image_url, title').not('image_url', 'is', null),
    admin
      .from('categories')
      .select('image_url, name')
      .not('image_url', 'is', null),
    admin
      .from('banners')
      .select('image_url, title')
      .not('image_url', 'is', null),
    admin
      .from('accounts')
      .select('id, name, email, picture_url'),
  ]);

  const recipeMap = new Map<string, string>();
  for (const r of recipesRes.data ?? []) {
    if (r.image_url) {
      const p = normalizePath(r.image_url);
      const name = p.split('/').pop() ?? '';
      recipeMap.set(p, r.title);
      recipeMap.set(name, r.title);
    }
  }

  const tipMap = new Map<string, string>();
  for (const t of tipsRes.data ?? []) {
    if (t.image_url) {
      const p = normalizePath(t.image_url);
      const name = p.split('/').pop() ?? '';
      tipMap.set(p, t.title);
      tipMap.set(name, t.title);
    }
  }

  const categoryMap = new Map<string, string>();
  for (const c of categoriesRes.data ?? []) {
    if (c.image_url) {
      const p = normalizePath(c.image_url);
      const name = p.split('/').pop() ?? '';
      categoryMap.set(p, c.name);
      categoryMap.set(name, c.name);
    }
  }

  const bannerMap = new Map<string, string>();
  for (const b of bannersRes.data ?? []) {
    if (b.image_url) {
      const p = normalizePath(b.image_url);
      const name = p.split('/').pop() ?? '';
      bannerMap.set(p, b.title);
      bannerMap.set(name, b.title);
    }
  }

  const accountMap = new Map<string, string>();
  for (const a of accountsRes.data ?? []) {
    const displayName = a.name
      ? `${a.name}${a.email ? ` (${a.email})` : ''}`
      : (a.email ?? 'Tài khoản người dùng');
    accountMap.set(a.id, displayName);
    if (a.picture_url) {
      const p = normalizePath(a.picture_url);
      const name = p.split('/').pop()?.split('?')[0] ?? '';
      accountMap.set(p, displayName);
      accountMap.set(name, displayName);
    }
  }

  // Bỏ các mục trùng tên thư mục đã liệt kê ở root của recipe-images.
  const knownFolders = new Set<string>(MEDIA_FOLDERS);
  const extraItems = recipeImageRootItems.filter(
    (item) => !knownFolders.has(item.name.split('/')[0] ?? ''),
  );

  const rawItems = [
    ...recipeImageFolders.flat(),
    ...extraItems,
    ...avatarBucketItems,
  ];

  const items: MediaItem[] = rawItems
    .map((item) => {
      let source = item.source;
      let usedIn: string | null = null;

      if (
        item.bucket === 'account_image' ||
        source === 'avatars' ||
        item.path.startsWith('avatars/')
      ) {
        source = 'avatars';
        const userId = item.name.split('.')[0] ?? '';
        usedIn =
          accountMap.get(userId) ||
          accountMap.get(item.path) ||
          accountMap.get(item.name) ||
          'Tài khoản người dùng';
      } else if (
        recipeMap.has(item.path) ||
        recipeMap.has(item.name) ||
        item.path.startsWith('recipes/')
      ) {
        source = 'recipes';
        usedIn = recipeMap.get(item.path) || recipeMap.get(item.name) || null;
      } else if (
        tipMap.has(item.path) ||
        tipMap.has(item.name) ||
        item.path.startsWith('tips/')
      ) {
        source = 'tips';
        usedIn = tipMap.get(item.path) || tipMap.get(item.name) || null;
      } else if (
        categoryMap.has(item.path) ||
        categoryMap.has(item.name) ||
        item.path.startsWith('categories/')
      ) {
        source = 'categories';
        usedIn =
          categoryMap.get(item.path) || categoryMap.get(item.name) || null;
      } else if (
        bannerMap.has(item.path) ||
        bannerMap.has(item.name) ||
        item.path.startsWith('banners/')
      ) {
        source = 'banners';
        usedIn = bannerMap.get(item.path) || bannerMap.get(item.name) || null;
      } else if (item.path.startsWith('uploads/')) {
        source = 'uploads';
      }

      return {
        ...item,
        source,
        usedIn,
      };
    })
    .sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;

      return bTime - aTime;
    });

  return (
    <div className={'flex flex-col gap-6'}>
      <div>
        <h1 className={'text-2xl font-bold tracking-tight'}>Quản lý media</h1>

        <p className={'text-muted-foreground mt-1 text-sm'}>
          Toàn bộ ảnh đã tải lên kho lưu trữ (công thức, mẹo vặt, danh mục, banner
          và avatar tài khoản người dùng). Lọc theo nguồn, xem ảnh gốc hoặc xóa ảnh
          không còn dùng.
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
