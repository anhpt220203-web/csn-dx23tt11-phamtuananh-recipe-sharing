vi.mock('server-only', () => ({}));

vi.mock('@kit/supabase/server-client', () => ({
  getSupabaseServerClient: () => (globalThis as any).__mockSupabase,
}));

// getRecipeFavoriteCounts import động server-admin-client trong try/catch —
// trỏ về fake client riêng để assert độc lập với client thường.
vi.mock('@kit/supabase/server-admin-client', () => ({
  getSupabaseServerAdminClient: () => (globalThis as any).__mockSupabaseAdmin,
}));

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createSupabaseServerMock,
  hasEqCall,
  type SupabaseMockConfig,
} from '../../__tests__/mocks/supabase-server';

import {
  getCurrentUserId,
  getFavoriteRecipeIds,
  getMyFavoriteRecipes,
  getRecipeFavoriteCounts,
  isRecipeFavorited,
} from './favorites';

let mock: ReturnType<typeof createSupabaseServerMock>;
let adminMock: ReturnType<typeof createSupabaseServerMock>;

function setMock(config: SupabaseMockConfig = {}) {
  mock = createSupabaseServerMock(config);
  (globalThis as any).__mockSupabase = mock.client;
}

beforeEach(() => {
  setMock();
  adminMock = createSupabaseServerMock();
  (globalThis as any).__mockSupabaseAdmin = adminMock.client;
});

describe('getCurrentUserId', () => {
  it('trả về id khi đã đăng nhập', async () => {
    setMock({ authUser: { id: 'user-1' } });

    expect(await getCurrentUserId()).toBe('user-1');
  });

  it('trả về null khi chưa đăng nhập', async () => {
    setMock({ authUser: null });

    expect(await getCurrentUserId()).toBeNull();
  });
});

describe('isRecipeFavorited', () => {
  it('chưa đăng nhập -> false, không query', async () => {
    setMock({ authUser: null });

    expect(await isRecipeFavorited(1)).toBe(false);
    expect(mock.calls).toHaveLength(0);
  });

  it('đã yêu thích -> true', async () => {
    setMock({
      authUser: { id: 'user-1' },
      tables: { favorites: { data: [{ recipe_id: 1 }] } },
    });

    expect(await isRecipeFavorited(1)).toBe(true);
    expect(hasEqCall(mock.calls, 'user_id', 'user-1', 'favorites')).toBe(true);
    expect(hasEqCall(mock.calls, 'recipe_id', 1, 'favorites')).toBe(true);
  });

  it('chưa yêu thích -> false', async () => {
    setMock({
      authUser: { id: 'user-1' },
      tables: { favorites: { data: [] } },
    });

    expect(await isRecipeFavorited(1)).toBe(false);
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({
      authUser: { id: 'user-1' },
      tables: { favorites: { error: { message: 'db down' } } },
    });

    await expect(isRecipeFavorited(1)).rejects.toThrow(
      'Không kiểm tra được trạng thái yêu thích',
    );
  });
});

describe('getFavoriteRecipeIds', () => {
  it('chưa đăng nhập -> tập rỗng, không query', async () => {
    setMock({ authUser: null });

    expect(await getFavoriteRecipeIds([1, 2])).toEqual(new Set());
    expect(mock.calls).toHaveLength(0);
  });

  it('danh sách rỗng -> tập rỗng, không query', async () => {
    setMock({ authUser: { id: 'user-1' } });

    expect(await getFavoriteRecipeIds([])).toEqual(new Set());
    expect(mock.calls).toHaveLength(0);
  });

  it('trả về Set id đã yêu thích', async () => {
    setMock({
      authUser: { id: 'user-1' },
      tables: { favorites: { data: [{ recipe_id: 1 }, { recipe_id: 3 }] } },
    });

    const result = await getFavoriteRecipeIds([1, 2, 3]);

    expect(result).toEqual(new Set([1, 3]));
    expect(
      mock.calls.some(
        (call) =>
          call.table === 'favorites' &&
          call.method === 'in' &&
          call.args[0] === 'recipe_id' &&
          JSON.stringify(call.args[1]) === JSON.stringify([1, 2, 3]),
      ),
    ).toBe(true);
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({
      authUser: { id: 'user-1' },
      tables: { favorites: { error: { message: 'db down' } } },
    });

    await expect(getFavoriteRecipeIds([1])).rejects.toThrow(
      'Không kiểm tra được trạng thái yêu thích',
    );
  });
});

describe('getRecipeFavoriteCounts', () => {
  it('danh sách rỗng -> Map rỗng, không query', async () => {
    expect(await getRecipeFavoriteCounts([])).toEqual(new Map());
    expect(adminMock.calls).toHaveLength(0);
  });

  it('đếm lượt yêu thích theo từng món', async () => {
    adminMock = createSupabaseServerMock({
      tables: {
        favorites: {
          data: [{ recipe_id: 1 }, { recipe_id: 1 }, { recipe_id: 2 }],
        },
      },
    });
    (globalThis as any).__mockSupabaseAdmin = adminMock.client;

    const result = await getRecipeFavoriteCounts([1, 2, 3]);

    expect(result).toEqual(
      new Map([
        [1, 2],
        [2, 1],
      ]),
    );
  });

  it('lỗi DB -> Map rỗng (không ném)', async () => {
    adminMock = createSupabaseServerMock({
      tables: { favorites: { error: { message: 'db down' } } },
    });
    (globalThis as any).__mockSupabaseAdmin = adminMock.client;

    expect(await getRecipeFavoriteCounts([1])).toEqual(new Map());
  });
});

describe('getMyFavoriteRecipes', () => {
  it('chưa đăng nhập -> mảng rỗng, không query', async () => {
    setMock({ authUser: null });

    expect(await getMyFavoriteRecipes()).toEqual([]);
    expect(mock.calls).toHaveLength(0);
  });

  it('map món từ join, bỏ dòng recipes null', async () => {
    setMock({
      authUser: { id: 'user-1' },
      tables: {
        favorites: {
          data: [
            {
              recipe_id: 1,
              created_at: '2026-10-18T00:00:00Z',
              recipes: {
                id: 1,
                title: 'Gà rán',
                slug: 'ga-ran',
                description: 'Ngon',
                image_url: 'recipe-images/ga-ran.png',
              },
            },
            {
              recipe_id: 2,
              created_at: '2026-10-18T00:00:00Z',
              recipes: null,
            },
          ],
        },
      },
    });

    const result = await getMyFavoriteRecipes();

    expect(result).toEqual([
      {
        recipe_id: 1,
        favorited_at: '2026-10-18T00:00:00Z',
        title: 'Gà rán',
        slug: 'ga-ran',
        description: 'Ngon',
        image_url: 'recipe-images/ga-ran.png',
      },
    ]);
    expect(hasEqCall(mock.calls, 'user_id', 'user-1', 'favorites')).toBe(true);
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({
      authUser: { id: 'user-1' },
      tables: { favorites: { error: { message: 'db down' } } },
    });

    await expect(getMyFavoriteRecipes()).rejects.toThrow(
      'Không tải được danh sách yêu thích',
    );
  });
});
