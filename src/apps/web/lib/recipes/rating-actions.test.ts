vi.mock('server-only', () => ({}));

vi.mock('@kit/supabase/server-client', () => ({
  getSupabaseServerClient: () => (globalThis as any).__mockSupabase,
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

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

import { removeRatingAction, setRatingAction } from './rating-actions';

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

describe('setRatingAction — validate input sớm', () => {
  it.each([
    [0, 'slug', 5],
    [-2, 'slug', 5],
    [1.5, 'slug', 5],
    [1, 'slug', 0],
    [1, 'slug', 6],
    [1, 'slug', 2.5],
    [1, 'slug', NaN],
  ])(
    'input không hợp lệ (recipeId=%s, score=%s) -> invalid, không chạm DB/auth',
    async (recipeId, slug, score) => {
      const result = await setRatingAction(recipeId, slug, score);

      expect(result).toEqual({ ok: false, reason: 'invalid' });
      expect(requireUserMock).not.toHaveBeenCalled();
      expect(mock.calls).toHaveLength(0);
    },
  );
});

describe('setRatingAction — chưa đăng nhập', () => {
  it('requireUser báo lỗi -> unauthenticated', async () => {
    requireUserMock.mockResolvedValue({
      error: { message: 'Auth session missing' },
      data: null,
    });

    const result = await setRatingAction(1, 'ga-ran', 5);

    expect(result).toEqual({ ok: false, reason: 'unauthenticated' });
    expect(
      mock.calls.filter((call) => call.table === 'ratings'),
    ).toHaveLength(0);
  });
});

describe('removeRatingAction — validate input sớm', () => {
  it.each([0, -1, 2.5])(
    'recipeId không hợp lệ (%s) -> invalid, không chạm DB/auth',
    async (recipeId) => {
      const result = await removeRatingAction(recipeId, 'ga-ran');

      expect(result).toEqual({ ok: false, reason: 'invalid' });
      expect(requireUserMock).not.toHaveBeenCalled();
      expect(mock.calls).toHaveLength(0);
    },
  );
});

describe('removeRatingAction — chưa đăng nhập', () => {
  it('requireUser báo lỗi -> unauthenticated', async () => {
    requireUserMock.mockResolvedValue({
      error: { message: 'Auth session missing' },
      data: null,
    });

    expect(await removeRatingAction(1, 'ga-ran')).toEqual({
      ok: false,
      reason: 'unauthenticated',
    });
    expect(
      mock.calls.filter((call) => call.table === 'ratings'),
    ).toHaveLength(0);
  });
});

describe('setRatingAction — happy path', () => {
  beforeEach(() => {
    requireUserMock.mockResolvedValue({ error: null, data: { sub: 'user-1' } });
  });

  it('upsert thành công, tính lại summary, revalidate đúng path', async () => {
    setMock({ tables: { ratings: { data: [{ rating: 4 }, { rating: 5 }] } } });

    const result = await setRatingAction(7, 'ga-ran', 5);

    expect(result).toEqual({
      ok: true,
      userRating: 5,
      summary: { average: 4.5, count: 2 },
    });

    // Upsert đúng payload + onConflict UNIQUE(user_id, recipe_id).
    const upsertCalls = findCalls(mock.calls, 'upsert', 'ratings');
    expect(upsertCalls).toHaveLength(1);
    const upsertCall = upsertCalls[0]!;
    expect(upsertCall.args[0]).toEqual({
      user_id: 'user-1',
      recipe_id: 7,
      rating: 5,
    });
    expect(upsertCall.args[1]).toEqual({ onConflict: 'user_id,recipe_id' });

    // Summary được tính lại từ bảng ratings sau khi ghi.
    expect(hasEqCall(mock.calls, 'recipe_id', 7, 'ratings')).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith('/cong-thuc/ga-ran');
  });

  it('upsert lỗi -> error, không revalidate', async () => {
    setMock({ tables: { ratings: { error: { message: 'db down' } } } });

    expect(await setRatingAction(7, 'ga-ran', 5)).toEqual({
      ok: false,
      reason: 'error',
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe('removeRatingAction — happy path', () => {
  beforeEach(() => {
    requireUserMock.mockResolvedValue({ error: null, data: { sub: 'user-1' } });
  });

  it('delete thành công, summary tính lại, revalidate đúng path', async () => {
    setMock({ tables: { ratings: { data: [{ rating: 4 }] } } });

    const result = await removeRatingAction(7, 'ga-ran');

    expect(result).toEqual({
      ok: true,
      summary: { average: 4, count: 1 },
    });

    const deleteCalls = findCalls(mock.calls, 'delete', 'ratings');
    expect(deleteCalls).toHaveLength(1);
    expect(hasEqCall(mock.calls, 'user_id', 'user-1', 'ratings')).toBe(true);
    expect(hasEqCall(mock.calls, 'recipe_id', 7, 'ratings')).toBe(true);

    // Summary được tính lại từ bảng ratings sau khi xóa.
    expect(revalidatePath).toHaveBeenCalledWith('/cong-thuc/ga-ran');
  });

  it('delete lỗi -> error, không revalidate', async () => {
    setMock({ tables: { ratings: { error: { message: 'db down' } } } });

    expect(await removeRatingAction(7, 'ga-ran')).toEqual({
      ok: false,
      reason: 'error',
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
