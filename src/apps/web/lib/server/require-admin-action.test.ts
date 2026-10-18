vi.mock('server-only', () => ({}));

vi.mock('@kit/supabase/server-client', () => ({
  getSupabaseServerClient: () => (globalThis as any).__mockSupabase,
}));

vi.mock('@kit/supabase/server-admin-client', () => ({
  getSupabaseServerAdminClient: () => (globalThis as any).__mockSupabaseAdmin,
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

import { requireAdminUser } from './require-admin-action';

let mock: ReturnType<typeof createSupabaseServerMock>;
let adminMock: ReturnType<typeof createSupabaseServerMock>;

function setMock(config: SupabaseMockConfig = {}) {
  mock = createSupabaseServerMock(config);
  (globalThis as any).__mockSupabase = mock.client;
}

function setAdminMock(config: SupabaseMockConfig = {}) {
  adminMock = createSupabaseServerMock(config);
  (globalThis as any).__mockSupabaseAdmin = adminMock.client;
}

beforeEach(() => {
  setMock();
  setAdminMock();
  requireUserMock.mockReset();
});

describe('requireAdminUser', () => {
  it('chưa đăng nhập -> ném lỗi', async () => {
    requireUserMock.mockResolvedValue({
      error: { message: 'Auth session missing' },
      data: null,
    });

    await expect(requireAdminUser()).rejects.toThrow(
      'Bạn cần đăng nhập để thực hiện thao tác này.',
    );
  });

  it('requireUser không có data -> ném lỗi', async () => {
    requireUserMock.mockResolvedValue({ error: null, data: null });

    await expect(requireAdminUser()).rejects.toThrow(
      'Bạn cần đăng nhập để thực hiện thao tác này.',
    );
  });

  it('không phải admin -> ném lỗi (không lộ chi tiết)', async () => {
    requireUserMock.mockResolvedValue({
      error: null,
      data: { id: 'user-1' },
    });
    setAdminMock({
      authAdminUser: { id: 'user-1', app_metadata: { role: 'member' } },
    });

    await expect(requireAdminUser()).rejects.toThrow(
      'Bạn không có quyền quản trị.',
    );
  });

  it('lỗi khi đọc role từ Auth Admin API -> ném lỗi', async () => {
    requireUserMock.mockResolvedValue({
      error: null,
      data: { id: 'user-1' },
    });
    setAdminMock({
      authAdminUser: null,
      authAdminError: { message: 'admin api down' },
    });

    await expect(requireAdminUser()).rejects.toThrow(
      'Bạn không có quyền quản trị.',
    );
  });

  it('admin hợp lệ -> trả về adminClient, user, userId', async () => {
    const adminUser = {
      id: 'admin-1',
      app_metadata: { role: 'admin' },
    };

    requireUserMock.mockResolvedValue({
      error: null,
      data: { id: 'admin-1' },
    });
    setAdminMock({ authAdminUser: adminUser });

    const result = await requireAdminUser();

    expect(result.userId).toBe('admin-1');
    expect(result.user).toEqual(adminUser);
    expect(result.adminClient).toBe(adminMock.client);
  });
});
