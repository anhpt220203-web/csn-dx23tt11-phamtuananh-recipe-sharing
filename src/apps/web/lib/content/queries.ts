import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { BannerRow, ContentSchema, TipRow } from './database';

function getClient() {
  return getSupabaseServerClient<ContentSchema>();
}

/**
 * Danh sách banner đang hoạt động cho carousel trang chủ,
 * sắp xếp theo sort_order.
 */
export async function getActiveBanners(): Promise<BannerRow[]> {
  const client = getClient();

  const { data, error } = await client
    .from('banners')
    .select('id,title,subtitle,image_url,link_url,sort_order,is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    throw new Error(`Không tải được banner: ${error.message}`);
  }

  return (data ?? []) as BannerRow[];
}

/**
 * Bài viết mẹo vặt đã xuất bản, mới nhất trước.
 */
export async function getPublishedTips(limit = 10): Promise<TipRow[]> {
  const client = getClient();

  const { data, error } = await client
    .from('tips')
    .select('id,title,slug,excerpt,image_url,created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Không tải được mẹo vặt: ${error.message}`);
  }

  return (data ?? []) as TipRow[];
}

/**
 * Chi tiết một bài viết mẹo vặt đã xuất bản theo slug.
 */
export async function getTipBySlug(slug: string): Promise<TipRow | null> {
  const client = getClient();

  const { data, error } = await client
    .from('tips')
    .select('id,title,slug,excerpt,content,image_url,created_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    throw new Error(`Không tải được bài viết: ${error.message}`);
  }

  return (data ?? null) as TipRow | null;
}
