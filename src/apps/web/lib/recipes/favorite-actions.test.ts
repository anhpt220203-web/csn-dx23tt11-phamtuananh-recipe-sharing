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
  type SupabaseMockConfig,
} from '../../__tests__/mocks/supabase-server';

import { toggleFavoriteAction } from './favorite-actions';

let mock: ReturnType<typeof createSupabaseServerMock>;

function setMock(config: SupabaseMockConfig = {}) {
  mock = createSupabaseServerMock(config);
  (globalThis as any).__mockSupabase = mock.client;
}

beforeEach(() => {
  setMock();
  requireUserMock.mockReset();
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
