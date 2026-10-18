vi.mock('server-only', () => ({}));

vi.mock('@kit/supabase/server-client', () => ({
  getSupabaseServerClient: () => (globalThis as any).__mockSupabase,
}));

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createSupabaseServerMock,
  hasEqCall,
  type SupabaseMockConfig,
} from '../../__tests__/mocks/supabase-server';

import { getActiveBanners, getPublishedTips, getTipBySlug } from './queries';

let mock: ReturnType<typeof createSupabaseServerMock>;

function setMock(config: SupabaseMockConfig = {}) {
  mock = createSupabaseServerMock(config);
  (globalThis as any).__mockSupabase = mock.client;
}

beforeEach(() => {
  setMock();
});

describe('getActiveBanners', () => {
  it('chỉ lấy banner đang hoạt động, sắp theo sort_order', async () => {
    const rows = [
      {
        id: 1,
        title: 'Banner 1',
        subtitle: null,
        image_url: null,
        link_url: null,
        sort_order: 1,
        is_active: true,
      },
    ];

    setMock({ tables: { banners: { data: rows } } });

    expect(await getActiveBanners()).toEqual(rows);
    expect(hasEqCall(mock.calls, 'is_active', true, 'banners')).toBe(true);
    expect(
      mock.calls.some(
        (call) =>
          call.table === 'banners' &&
          call.method === 'order' &&
          call.args[0] === 'sort_order' &&
          (call.args[1] as { ascending: boolean }).ascending === true,
      ),
    ).toBe(true);
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({ tables: { banners: { error: { message: 'db down' } } } });

    await expect(getActiveBanners()).rejects.toThrow(
      'Không tải được banner',
    );
  });

  it('trả về mảng rỗng khi data null', async () => {
    expect(await getActiveBanners()).toEqual([]);
  });
});

describe('getPublishedTips', () => {
  it('mặc định limit 10, chỉ lấy bài đã xuất bản, mới nhất trước', async () => {
    const rows = [
      {
        id: 1,
        title: 'Mẹo 1',
        slug: 'meo-1',
        excerpt: null,
        image_url: null,
        created_at: '2026-10-18T00:00:00Z',
      },
    ];

    setMock({ tables: { tips: { data: rows } } });

    expect(await getPublishedTips()).toEqual(rows);
    expect(hasEqCall(mock.calls, 'is_published', true, 'tips')).toBe(true);
    expect(
      mock.calls.some(
        (call) =>
          call.table === 'tips' &&
          call.method === 'limit' &&
          call.args[0] === 10,
      ),
    ).toBe(true);
    expect(
      mock.calls.some(
        (call) =>
          call.table === 'tips' &&
          call.method === 'order' &&
          call.args[0] === 'created_at' &&
          (call.args[1] as { ascending: boolean }).ascending === false,
      ),
    ).toBe(true);
  });

  it('tôn trọng limit truyền vào', async () => {
    setMock({ tables: { tips: { data: [] } } });

    await getPublishedTips(3);

    expect(
      mock.calls.some(
        (call) =>
          call.table === 'tips' && call.method === 'limit' && call.args[0] === 3,
      ),
    ).toBe(true);
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({ tables: { tips: { error: { message: 'db down' } } } });

    await expect(getPublishedTips()).rejects.toThrow(
      'Không tải được mẹo vặt',
    );
  });
});

describe('getTipBySlug', () => {
  const row = {
    id: 1,
    title: 'Mẹo 1',
    slug: 'meo-1',
    excerpt: null,
    content: 'Nội dung',
    image_url: null,
    created_at: '2026-10-18T00:00:00Z',
  };

  it('trả về bài viết khi tìm thấy', async () => {
    setMock({ tables: { tips: { data: [row] } } });

    expect(await getTipBySlug('meo-1')).toEqual(row);
    expect(hasEqCall(mock.calls, 'slug', 'meo-1', 'tips')).toBe(true);
    expect(hasEqCall(mock.calls, 'is_published', true, 'tips')).toBe(true);
  });

  it('trả về null khi không tồn tại', async () => {
    setMock({ tables: { tips: { data: [] } } });

    expect(await getTipBySlug('khong-co')).toBeNull();
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({ tables: { tips: { error: { message: 'db down' } } } });

    await expect(getTipBySlug('meo-1')).rejects.toThrow(
      'Không tải được bài viết',
    );
  });
});
