vi.mock('server-only', () => ({}));

vi.mock('@kit/supabase/server-client', () => ({
  getSupabaseServerClient: () => (globalThis as any).__mockSupabase,
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// requireUser đọc session từ client — mock để điều khiển nhánh
// authenticated / unauthenticated mà không cần Supabase thật.
const { requireUserMock } = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
}));

vi.mock('@kit/supabase/require-user', () => ({
  requireUser: requireUserMock,
}));

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createSupabaseServerMock,
  findCalls,
  hasEqCall,
  type SupabaseMockConfig,
} from '../../__tests__/mocks/supabase-server';

import { toggleFavoriteAction } from './favorite-actions';

// next/cache đã mock ở trên — import để assert revalidatePath.
import { revalidatePath } from 'next/cache';

let mock: ReturnType<typeof createSupabaseServerMock>;

function setMock(config: SupabaseMockConfig = {}) {
  mock = createSupabaseServerMock(config);
  (globalThis as any).__mockSupabase = mock.client;
}

beforeEach(() => {
  setMock();
  requireUserMock.mockReset();
  vi.mocked(revalidatePath).mockClear();
});

describe('toggleFavoriteAction — validate input sớm', () => {
  it.each([0, -1, 1.5, NaN])(
    'recipeId không hợp lệ (%s) -> invalid, không chạm DB/auth',
    async (recipeId) => {
      const result = await toggleFavoriteAction(recipeId);

      expect(result).toEqual({ ok: false, reason: 'invalid' });
      expect(requireUserMock).not.toHaveBeenCalled();
      expect(mock.calls).toHaveLength(0);
    },
  );
});

describe('toggleFavoriteAction — chưa đăng nhập', () => {
  it('requireUser báo lỗi -> unauthenticated', async () => {
    requireUserMock.mockResolvedValue({
      error: { message: 'Auth session missing' },
      data: null,
    });

    const result = await toggleFavoriteAction(1);

    expect(result).toEqual({ ok: false, reason: 'unauthenticated' });
    // Dừng ngay sau khi xác thực thất bại — không query bảng favorites.
    expect(
      mock.calls.filter((call) => call.table === 'favorites'),
    ).toHaveLength(0);
  });

  it('requireUser không trả về sub -> unauthenticated', async () => {
    requireUserMock.mockResolvedValue({ error: null, data: {} });

    expect(await toggleFavoriteAction(1)).toEqual({
      ok: false,
      reason: 'unauthenticated',
    });
  });
});

describe('toggleFavoriteAction — happy path', () => {
  beforeEach(() => {
    requireUserMock.mockResolvedValue({ error: null, data: { sub: 'user-1' } });
  });

  it('bản ghi đã tồn tại -> gọi delete, trả favorited=false, revalidate', async () => {
    setMock({ tables: { favorites: { data: [{ recipe_id: 7 }] } } });

    const result = await toggleFavoriteAction(7, 'ga-ran');

    expect(result).toEqual({ ok: true, favorited: false });
    // Nhánh delete được gọi, nhánh insert không chạy.
    expect(findCalls(mock.calls, 'delete', 'favorites')).toHaveLength(1);
    expect(findCalls(mock.calls, 'insert', 'favorites')).toHaveLength(0);
    expect(hasEqCall(mock.calls, 'user_id', 'user-1', 'favorites')).toBe(true);
    expect(hasEqCall(mock.calls, 'recipe_id', 7, 'favorites')).toBe(true);
    // Revalidate sau khi xóa thành công: trang chi tiết + trang yêu thích + trang chủ.
    expect(revalidatePath).toHaveBeenCalledWith('/cong-thuc/ga-ran');
    expect(revalidatePath).toHaveBeenCalledWith('/yeu-thich');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('chưa có bản ghi -> gọi insert đúng payload, trả favorited=true, revalidate', async () => {
    setMock({ tables: { favorites: { data: [] } } });

    const result = await toggleFavoriteAction(7, 'ga-ran');

    expect(result).toEqual({ ok: true, favorited: true });
    // Nhánh insert được gọi, nhánh delete không chạy.
    expect(findCalls(mock.calls, 'insert', 'favorites')).toHaveLength(1);
    expect(findCalls(mock.calls, 'delete', 'favorites')).toHaveLength(0);
    const insertCall = findCalls(mock.calls, 'insert', 'favorites')[0]!;
    expect(insertCall.args[0]).toEqual({
      user_id: 'user-1',
      recipe_id: 7,
    });
    expect(revalidatePath).toHaveBeenCalledWith('/cong-thuc/ga-ran');
    expect(revalidatePath).toHaveBeenCalledWith('/yeu-thich');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('không truyền slug -> không revalidate trang chi tiết', async () => {
    setMock({ tables: { favorites: { data: [] } } });

    const result = await toggleFavoriteAction(7);

    expect(result).toEqual({ ok: true, favorited: true });
    expect(findCalls(mock.calls, 'insert', 'favorites')).toHaveLength(1);
    expect(revalidatePath).not.toHaveBeenCalledWith('/cong-thuc/ga-ran');
    expect(revalidatePath).toHaveBeenCalledWith('/yeu-thich');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });
});

describe('toggleFavoriteAction — nhánh lỗi DB', () => {
  beforeEach(() => {
    requireUserMock.mockResolvedValue({ error: null, data: { sub: 'user-1' } });
  });

  it('readError khi đọc favorites -> error, không revalidate', async () => {
    setMock({ tables: { favorites: { error: { message: 'db down' } } } });

    const result = await toggleFavoriteAction(7, 'ga-ran');

    expect(result).toEqual({ ok: false, reason: 'error' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
