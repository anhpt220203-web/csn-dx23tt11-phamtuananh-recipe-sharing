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

import { getMyRating, getRatingSummary } from './ratings';

let mock: ReturnType<typeof createSupabaseServerMock>;

function setMock(config: SupabaseMockConfig = {}) {
  mock = createSupabaseServerMock(config);
  (globalThis as any).__mockSupabase = mock.client;
}

beforeEach(() => {
  setMock();
});

describe('getRatingSummary', () => {
  it('chưa có đánh giá -> average null', async () => {
    setMock({ tables: { ratings: { data: [] } } });

    expect(await getRatingSummary(1)).toEqual({ average: null, count: 0 });
  });

  it('tính trung bình đúng', async () => {
    setMock({
      tables: {
        ratings: { data: [{ rating: 5 }, { rating: 3 }, { rating: 4 }] },
      },
    });

    expect(await getRatingSummary(1)).toEqual({ average: 4, count: 3 });
    expect(hasEqCall(mock.calls, 'recipe_id', 1, 'ratings')).toBe(true);
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({ tables: { ratings: { error: { message: 'db down' } } } });

    await expect(getRatingSummary(1)).rejects.toThrow(
      'Không tải được đánh giá',
    );
  });
});

describe('getMyRating', () => {
  it('chưa đăng nhập -> null, không query', async () => {
    setMock({ authUser: null });

    expect(await getMyRating(1)).toBeNull();
    // getCurrentUserId vẫn gọi auth.getUser nhưng không query bảng ratings.
    expect(
      mock.calls.filter((call) => call.table === 'ratings'),
    ).toHaveLength(0);
  });

  it('trả về số sao đã đánh giá', async () => {
    setMock({
      authUser: { id: 'user-1' },
      tables: { ratings: { data: [{ rating: 4 }] } },
    });

    expect(await getMyRating(1)).toBe(4);
    expect(hasEqCall(mock.calls, 'user_id', 'user-1', 'ratings')).toBe(true);
    expect(hasEqCall(mock.calls, 'recipe_id', 1, 'ratings')).toBe(true);
  });

  it('chưa đánh giá -> null', async () => {
    setMock({
      authUser: { id: 'user-1' },
      tables: { ratings: { data: [] } },
    });

    expect(await getMyRating(1)).toBeNull();
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({
      authUser: { id: 'user-1' },
      tables: { ratings: { error: { message: 'db down' } } },
    });

    await expect(getMyRating(1)).rejects.toThrow(
      'Không tải được đánh giá của bạn',
    );
  });
});
