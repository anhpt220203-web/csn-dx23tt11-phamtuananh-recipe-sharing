/**
 * Mock harness dùng chung cho mọi test chạm tới Supabase server client.
 *
 * Điểm cắm mock DUY NHẤT là module `@kit/supabase/server-client`
 * (và `@kit/supabase/server-admin-client` khi code import động).
 * Các file test KHÔNG hand-roll builder riêng lẻ nữa mà dùng
 * `createSupabaseServerMock(config)` rồi gán client vào globalThis:
 *
 * ```ts
 * vi.mock('server-only', () => ({}));
 * vi.mock('@kit/supabase/server-client', () => ({
 *   getSupabaseServerClient: () => (globalThis as any).__mockSupabase,
 * }));
 *
 * let mock: ReturnType<typeof createSupabaseServerMock>;
 *
 * beforeEach(() => {
 *   mock = createSupabaseServerMock({
 *     tables: { categories: { data: [...] } },
 *     authUser: { id: 'user-1' },
 *   });
 *   (globalThis as any).__mockSupabase = mock.client;
 * });
 * ```
 *
 * Lưu ý:
 * - `vi.mock('server-only', () => ({}))` là bắt buộc trong mỗi file test
 *   vì `server-only` throw ngay khi import ngoài request scope của Next.
 * - Query builder là chainable + thenable: mọi mắt xích
 *   `.from().select().eq().neq().in().order().range().limit()...`
 *   trả về cùng object, `await` builder resolve `{ data, error, count }`
 *   theo cấu hình của tên bảng. `.maybeSingle()` lấy phần tử đầu tiên
 *   (hoặc null) đúng semantics của supabase-js.
 * - Mọi lời gọi được ghi vào `mock.calls` để test assert theo
 *   HỢP ĐỒNG HÀNH VI (vd: đã lọc `status='published'`), không assert
 *   chuỗi select nội bộ.
 */

export type MockTableResult = {
  /** Dữ liệu trả về của bảng (mảng cho query thường). */
  data?: unknown;
  /** Lỗi giả lập — code test nhánh `if (error) throw`. */
  error?: { message: string } | null;
  /** Tổng số dòng cho query có `{ count: 'exact' }`. */
  count?: number | null;
};

export type SupabaseMockConfig = {
  /** Kết quả giả lập theo tên bảng, vd: `{ recipes: { data: [...] } }`. */
  tables?: Record<string, MockTableResult>;
  /** Kết quả giả lập cho `client.rpc(fn, params)`, key theo tên hàm. */
  rpcs?: Record<string, MockTableResult>;
  /** User trả về từ `client.auth.getUser()` — null = chưa đăng nhập. */
  authUser?: { id: string } | null;
  /** Lỗi giả lập của `client.auth.getUser()`. */
  authError?: { message: string } | null;
  /** User trả về từ `client.auth.admin.getUserById()` (admin client). */
  authAdminUser?: { id: string; app_metadata?: Record<string, unknown> } | null;
  /** Lỗi giả lập của `client.auth.admin.getUserById()`. */
  authAdminError?: { message: string } | null;
};

export type MockCall = {
  /** Tên bảng của `.from(table)` — null với `rpc`. */
  table: string | null;
  /** Tên phương thức: from | select | eq | neq | in | order | range | limit |
   *  delete | insert | upsert | maybeSingle | rpc */
  method: string;
  args: unknown[];
};

/** Lọc các lời gọi đã ghi theo method (và tên bảng nếu cần). */
export function findCalls(
  calls: MockCall[],
  method: string,
  table?: string,
): MockCall[] {
  return calls.filter(
    (call) =>
      call.method === method && (table === undefined || call.table === table),
  );
}

/** Kiểm tra có lời gọi `.eq(col, value)` (trên bảng cho trước) hay không. */
export function hasEqCall(
  calls: MockCall[],
  col: string,
  value: unknown,
  table?: string,
): boolean {
  return findCalls(calls, 'eq', table).some(
    (call) => call.args[0] === col && call.args[1] === value,
  );
}

type ResolvedTable = {
  data: unknown;
  error: { message: string } | null;
  count: number | null;
};

function firstRow(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.length > 0 ? data[0] : null;
  }

  return data ?? null;
}

/**
 * Dựng một fake Supabase client + bộ ghi lời gọi.
 * Client trả về là `any` có chủ đích — các module app gọi nó qua
 * generic của supabase-js nên ép kiểu chi tiết không có giá trị ở đây.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSupabaseServerMock(config: SupabaseMockConfig = {}): {
  client: any;
  calls: MockCall[];
} {
  const calls: MockCall[] = [];
  const tables = config.tables ?? {};
  const rpcs = config.rpcs ?? {};

  function resolveTable(table: string): ResolvedTable {
    const cfg = tables[table] ?? {};

    return {
      data: cfg.data ?? null,
      error: cfg.error ?? null,
      count: cfg.count ?? null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function makeBuilder(table: string): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builder: any = {};

    const chain = (method: string) => {
      return (...args: unknown[]) => {
        calls.push({ table, method, args });

        return builder;
      };
    };

    builder.select = chain('select');
    builder.eq = chain('eq');
    builder.neq = chain('neq');
    builder.in = chain('in');
    builder.order = chain('order');
    builder.range = chain('range');
    builder.limit = chain('limit');
    builder.delete = chain('delete');
    builder.insert = chain('insert');
    builder.upsert = chain('upsert');

    builder.maybeSingle = () => {
      calls.push({ table, method: 'maybeSingle', args: [] });

      const { data, error } = resolveTable(table);

      return Promise.resolve({ data: firstRow(data), error });
    };

    // Thenable: `await builder` resolve { data, error, count }.
    builder.then = (
      onFulfilled: (value: ResolvedTable) => unknown,
      onRejected: (reason: unknown) => unknown,
    ) => Promise.resolve(resolveTable(table)).then(onFulfilled, onRejected);

    return builder;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client: any = {
    from: (table: string) => {
      calls.push({ table, method: 'from', args: [] });

      return makeBuilder(table);
    },
    rpc: (fn: string, params?: unknown) => {
      calls.push({ table: null, method: 'rpc', args: [fn, params] });

      const cfg = rpcs[fn] ?? {};

      return Promise.resolve({
        data: cfg.data ?? null,
        error: cfg.error ?? null,
      });
    },
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: config.authUser ?? null },
          error: config.authError ?? null,
        }),
      admin: {
        getUserById: (_userId: string) =>
          Promise.resolve({
            data: { user: config.authAdminUser ?? null },
            error: config.authAdminError ?? null,
          }),
      },
    },
  };

  return { client, calls };
}
