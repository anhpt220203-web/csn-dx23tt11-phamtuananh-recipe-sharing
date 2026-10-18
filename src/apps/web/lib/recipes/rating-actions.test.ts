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
  type SupabaseMockConfig,
} from '../../__tests__/mocks/supabase-server';

import { removeRatingAction, setRatingAction } from './rating-actions';

let mock: ReturnType<typeof createSupabaseServerMock>;

function setMock(config: SupabaseMockConfig = {}) {
  mock = createSupabaseServerMock(config);
  (globalThis as any).__mockSupabase = mock.client;
}

beforeEach(() => {
  setMock();
  requireUserMock.mockReset();
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
