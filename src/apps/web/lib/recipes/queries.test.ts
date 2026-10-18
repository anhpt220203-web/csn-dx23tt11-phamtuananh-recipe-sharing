// `server-only` throw ngay khi import ngoài request scope của Next —
// mock thành module rỗng trước mọi import của module app.
vi.mock('server-only', () => ({}));

// Điểm cắm mock duy nhất: trỏ getSupabaseServerClient về fake client
// được gán vào globalThis trong beforeEach (đọc tại thời điểm GỌI hàm,
// nên không vướng hoisting của vi.mock).
vi.mock('@kit/supabase/server-client', () => ({
  getSupabaseServerClient: () => (globalThis as any).__mockSupabase,
}));

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createSupabaseServerMock,
  findCalls,
  hasEqCall,
  type SupabaseMockConfig,
} from '../../__tests__/mocks/supabase-server';

import {
  getCategories,
  getCategoriesByDimension,
  getCategoryBySlug,
  getFavoriteRecipes,
  getLatestRecipes,
  getMyRatingsWithRecipes,
  getRatingSummary,
  getRecipeBySlug,
  getRecipeQuestions,
  getRecipesByCategorySlug,
  getRecipesByTagSlug,
  getRelatedRecipes,
  getTags,
  getTopRatedRecipes,
  getUserRating,
  isFavorite,
  listPublishedRecipes,
  parseSearchSort,
  searchRecipes,
} from './queries';

let mock: ReturnType<typeof createSupabaseServerMock>;

/** Dựng lại mock với config riêng cho từng test. */
function setMock(config: SupabaseMockConfig = {}) {
  mock = createSupabaseServerMock(config);
  (globalThis as any).__mockSupabase = mock.client;
}

beforeEach(() => {
  setMock();
});

/** Một dòng recipes kèm join categories — đúng shape PostgREST trả về. */
function makeRecipeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    category_id: 2,
    title: 'Gà rán sốt bơ tỏi',
    slug: 'ga-ran-sot-bo-toi',
    description: 'Gà rán giòn rụm.',
    image_url: 'recipe-images/ga-ran.png',
    status: 'published',
    source_name: null,
    source_url: null,
    servings: 4,
    cook_time: 45,
    prep_time: 15,
    difficulty: 'Dễ',
    created_by: null,
    calories: null,
    protein_g: null,
    carbs_g: null,
    sugar_g: null,
    fat_g: null,
    fiber_g: null,
    categories: { name: 'Món chiên', slug: 'mon-chien' },
    ...overrides,
  };
}

describe('parseSearchSort', () => {
  it("giữ nguyên 'danh-gia-cao'", () => {
    expect(parseSearchSort('danh-gia-cao')).toBe('danh-gia-cao');
  });

  it("giá trị lạ / thiếu -> 'moi-nhat'", () => {
    expect(parseSearchSort(undefined)).toBe('moi-nhat');
    expect(parseSearchSort('')).toBe('moi-nhat');
    expect(parseSearchSort('abc')).toBe('moi-nhat');
  });
});

describe('getCategories', () => {
  it('trả về danh mục, order theo id tăng dần', async () => {
    const rows = [
      {
        id: 1,
        name: 'Món khai vị',
        slug: 'mon-khai-vi',
        description: null,
        dimension: 'nhom-mon',
      },
    ];

    setMock({ tables: { categories: { data: rows } } });

    expect(await getCategories()).toEqual(rows);
    expect(
      mock.calls.some(
        (call) =>
          call.method === 'order' &&
          call.args[0] === 'id' &&
          (call.args[1] as { ascending: boolean }).ascending === true,
      ),
    ).toBe(true);
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({ tables: { categories: { error: { message: 'db down' } } } });

    await expect(getCategories()).rejects.toThrow('Không tải được danh mục');
  });

  it('trả về mảng rỗng khi data null', async () => {
    expect(await getCategories()).toEqual([]);
  });
});

describe('getCategoryBySlug', () => {
  const row = {
    id: 2,
    name: 'Món chiên',
    slug: 'mon-chien',
    description: null,
    dimension: 'nhom-mon',
  };

  it('trả về danh mục khi tìm thấy', async () => {
    setMock({ tables: { categories: { data: [row] } } });

    expect(await getCategoryBySlug('mon-chien')).toEqual(row);
    expect(hasEqCall(mock.calls, 'slug', 'mon-chien', 'categories')).toBe(
      true,
    );
  });

  it('trả về null khi không tồn tại', async () => {
    setMock({ tables: { categories: { data: [] } } });

    expect(await getCategoryBySlug('khong-co')).toBeNull();
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({ tables: { categories: { error: { message: 'db down' } } } });

    await expect(getCategoryBySlug('mon-chien')).rejects.toThrow(
      'Không tải được danh mục',
    );
  });
});

describe('listPublishedRecipes', () => {
  it('mặc định: trang 1, 12 món, chỉ lấy món đã xuất bản', async () => {
    setMock({
      tables: {
        recipes: { data: [makeRecipeRow(), makeRecipeRow({ id: 2 })], count: 2 },
      },
    });

    const { recipes, total } = await listPublishedRecipes({});

    expect(total).toBe(2);
    expect(recipes).toHaveLength(2);
    // Hợp đồng cốt lõi: luôn lọc status='published'.
    expect(hasEqCall(mock.calls, 'status', 'published', 'recipes')).toBe(true);
    // Phân trang mặc định: range(0, 11).
    const rangeCalls = findCalls(mock.calls, 'range', 'recipes');

    expect(rangeCalls[0]!.args).toEqual([0, 11]);
    // Sort mặc định: rating rỗng.
    expect(recipes[0]!.rating).toEqual({ average: null, count: 0 });
  });

  it('kẹp page < 1 về 1 và perPage > 100 về 100', async () => {
    setMock({ tables: { recipes: { data: [], count: 0 } } });

    await listPublishedRecipes({ page: 0, perPage: 500 });

    const rangeCalls = findCalls(mock.calls, 'range', 'recipes');

    expect(rangeCalls[0]!.args).toEqual([0, 99]);
  });

  it('trang 3 với perPage 10 -> range(20, 29)', async () => {
    setMock({ tables: { recipes: { data: [], count: 0 } } });

    await listPublishedRecipes({ page: 3, perPage: 10 });

    expect(findCalls(mock.calls, 'range', 'recipes')[0]!.args).toEqual([
      20, 29,
    ]);
  });

  it('danh mục không tồn tại -> rỗng, không thực thi query recipes', async () => {
    setMock({ tables: { categories: { data: [] } } });

    const result = await listPublishedRecipes({ categorySlug: 'khong-co' });

    expect(result).toEqual({ recipes: [], total: 0 });
    // Builder được dựng trước khi tra danh mục, nhưng query không bao giờ
    // được await (không có lời gọi order/select thực thi trên bảng recipes).
    expect(findCalls(mock.calls, 'order', 'recipes')).toHaveLength(0);
  });

  it('lọc theo category_id khi danh mục tồn tại', async () => {
    setMock({
      tables: {
        categories: {
          data: [{ id: 7, name: 'X', slug: 'mon-x', description: null, dimension: 'nhom-mon' }],
        },
        recipes: { data: [makeRecipeRow({ category_id: 7 })], count: 1 },
      },
    });

    const { recipes } = await listPublishedRecipes({ categorySlug: 'mon-x' });

    expect(hasEqCall(mock.calls, 'category_id', 7, 'recipes')).toBe(true);
    expect(recipes).toHaveLength(1);
  });

  it('ép numeric dạng string về number, giữ null', async () => {
    setMock({
      tables: {
        recipes: {
          data: [
            makeRecipeRow({
              calories: '12.5',
              protein_g: '3',
              carbs_g: null,
              categories: null,
            }),
          ],
          count: 1,
        },
      },
    });

    const { recipes } = await listPublishedRecipes({});

    expect(recipes[0]!.calories).toBe(12.5);
    expect(recipes[0]!.protein_g).toBe(3);
    expect(recipes[0]!.carbs_g).toBeNull();
    // Join categories null -> chuỗi rỗng.
    expect(recipes[0]!.category_name).toBe('');
    expect(recipes[0]!.category_slug).toBe('');
  });

  it("sort 'danh-gia-cao': tổng hợp rating và sắp giảm dần", async () => {
    setMock({
      tables: {
        recipes: {
          data: [
            makeRecipeRow({ id: 1 }),
            makeRecipeRow({ id: 2 }),
            makeRecipeRow({ id: 3 }),
          ],
          count: 3,
        },
        ratings: {
          data: [
            { recipe_id: 1, rating: 5 },
            { recipe_id: 1, rating: 3 },
            { recipe_id: 2, rating: 5 },
            { recipe_id: 2, rating: 5 },
          ],
        },
      },
    });

    const { recipes } = await listPublishedRecipes({
      sort: 'danh-gia-cao',
    });

    // id 2: avg 5; id 1: avg 4; id 3: chưa có đánh giá -> null.
    expect(recipes.map((r) => r.id)).toEqual([2, 1, 3]);
    expect(recipes[0]!.rating).toEqual({ average: 5, count: 2 });
    expect(recipes[1]!.rating).toEqual({ average: 4, count: 2 });
    expect(recipes[2]!.rating).toEqual({ average: null, count: 0 });
  });

  it('ném lỗi khi query recipes thất bại', async () => {
    setMock({ tables: { recipes: { error: { message: 'db down' } } } });

    await expect(listPublishedRecipes({})).rejects.toThrow(
      'Không tải được danh sách công thức',
    );
  });

  it("ném lỗi khi query ratings thất bại ở sort 'danh-gia-cao'", async () => {
    setMock({
      tables: {
        recipes: { data: [makeRecipeRow()], count: 1 },
        ratings: { error: { message: 'db down' } },
      },
    });

    await expect(
      listPublishedRecipes({ sort: 'danh-gia-cao' }),
    ).rejects.toThrow('Không tải được đánh giá');
  });
});

describe('getRecipesByCategorySlug', () => {
  it('danh mục không tồn tại -> mảng rỗng', async () => {
    setMock({ tables: { categories: { data: [] } } });

    expect(await getRecipesByCategorySlug('khong-co')).toEqual([]);
  });

  it('lọc category_id + published, mới nhất trước', async () => {
    setMock({
      tables: {
        categories: {
          data: [{ id: 7, name: 'X', slug: 'mon-x', description: null, dimension: 'nhom-mon' }],
        },
        recipes: { data: [makeRecipeRow({ category_id: 7 })] },
      },
    });

    const result = await getRecipesByCategorySlug('mon-x');

    expect(hasEqCall(mock.calls, 'category_id', 7, 'recipes')).toBe(true);
    expect(hasEqCall(mock.calls, 'status', 'published', 'recipes')).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0]!.title).toBe('Gà rán sốt bơ tỏi');
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({
      tables: {
        categories: {
          data: [{ id: 7, name: 'X', slug: 'mon-x', description: null, dimension: 'nhom-mon' }],
        },
        recipes: { error: { message: 'db down' } },
      },
    });

    await expect(getRecipesByCategorySlug('mon-x')).rejects.toThrow(
      'Không tải được công thức',
    );
  });
});

describe('searchRecipes', () => {
  it('từ khóa trống -> [] và không gọi rpc', async () => {
    expect(await searchRecipes({ q: '' })).toEqual([]);
    expect(await searchRecipes({ q: '   ' })).toEqual([]);
    expect(findCalls(mock.calls, 'rpc')).toHaveLength(0);
  });

  it('trim từ khóa và truyền đúng params cho rpc search_recipes', async () => {
    setMock({ rpcs: { search_recipes: { data: [] } } });

    await searchRecipes({ q: '  gà rán  ' });

    const rpcCalls = findCalls(mock.calls, 'rpc');

    expect(rpcCalls).toHaveLength(1);
    expect(rpcCalls[0]!.args[0]).toBe('search_recipes');
    expect(rpcCalls[0]!.args[1]).toEqual({
      p_query: 'gà rán',
      p_category_slug: null,
      p_sort: 'moi-nhat',
    });
  });

  it('truyền categorySlug và sort qua rpc', async () => {
    setMock({ rpcs: { search_recipes: { data: [] } } });

    await searchRecipes({
      q: 'gà',
      categorySlug: 'mon-chien',
      sort: 'danh-gia-cao',
    });

    expect(findCalls(mock.calls, 'rpc')[0]!.args[1]).toEqual({
      p_query: 'gà',
      p_category_slug: 'mon-chien',
      p_sort: 'danh-gia-cao',
    });
  });

  it('ép rating_average/rating_count dạng string về number', async () => {
    setMock({
      rpcs: {
        search_recipes: {
          data: [
            {
              id: 1,
              category_id: 2,
              title: 'Gà rán',
              slug: 'ga-ran',
              description: null,
              image_url: null,
              status: 'published',
              source_name: null,
              source_url: null,
              servings: null,
              cook_time: null,
              prep_time: null,
              difficulty: null,
              created_by: null,
              category_name: 'Món chiên',
              category_slug: 'mon-chien',
              rating_average: '4.5',
              rating_count: '12',
            },
            {
              id: 2,
              category_id: 2,
              title: 'Gà luộc',
              slug: 'ga-luoc',
              description: null,
              image_url: null,
              status: 'published',
              source_name: null,
              source_url: null,
              servings: null,
              cook_time: null,
              prep_time: null,
              difficulty: null,
              created_by: null,
              category_name: 'Món chiên',
              category_slug: 'mon-chien',
              rating_average: null,
              rating_count: '0',
            },
          ],
        },
      },
    });

    const result = await searchRecipes({ q: 'gà' });

    expect(result[0]!.rating).toEqual({ average: 4.5, count: 12 });
    // Chưa có đánh giá -> average null (để RecipeCard không crash toFixed).
    expect(result[1]!.rating).toEqual({ average: null, count: 0 });
  });

  it('ném lỗi khi rpc thất bại', async () => {
    setMock({ rpcs: { search_recipes: { error: { message: 'rpc down' } } } });

    await expect(searchRecipes({ q: 'gà' })).rejects.toThrow(
      'Tìm kiếm công thức thất bại',
    );
  });
});

describe('getRecipeBySlug', () => {
  function detailRow(overrides: Record<string, unknown> = {}) {
    return {
      ...makeRecipeRow(),
      recipe_ingredients: [
        { name: 'Gà', position: 1 },
        { name: 'Bơ', position: 2 },
      ],
      recipe_steps: [
        { step: 'Ướp gà', position: 1 },
        { step: 'Chiên', position: 2 },
      ],
      ...overrides,
    };
  }

  it('trả về null khi không tìm thấy', async () => {
    setMock({ tables: { recipes: { data: [] } } });

    expect(await getRecipeBySlug('khong-co')).toBeNull();
  });

  it('map nguyên liệu và các bước theo tên', async () => {
    setMock({ tables: { recipes: { data: [detailRow()] } } });

    const result = await getRecipeBySlug('ga-ran-sot-bo-toi');

    expect(hasEqCall(mock.calls, 'slug', 'ga-ran-sot-bo-toi', 'recipes')).toBe(
      true,
    );
    expect(hasEqCall(mock.calls, 'status', 'published', 'recipes')).toBe(true);
    expect(result?.ingredients).toEqual(['Gà', 'Bơ']);
    expect(result?.steps).toEqual(['Ướp gà', 'Chiên']);
    expect(result?.category_name).toBe('Món chiên');
  });

  it('nguyên liệu/bước null -> mảng rỗng', async () => {
    setMock({
      tables: {
        recipes: { data: [detailRow({ recipe_ingredients: null, recipe_steps: null })] },
      },
    });

    const result = await getRecipeBySlug('ga-ran-sot-bo-toi');

    expect(result?.ingredients).toEqual([]);
    expect(result?.steps).toEqual([]);
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({ tables: { recipes: { error: { message: 'db down' } } } });

    await expect(getRecipeBySlug('ga-ran')).rejects.toThrow(
      'Không tải được công thức',
    );
  });
});

describe('getRelatedRecipes', () => {
  it('cùng danh mục, loại trừ món hiện tại, mặc định 4 món', async () => {
    setMock({ tables: { recipes: { data: [makeRecipeRow({ id: 2 })] } } });

    const result = await getRelatedRecipes({ id: 1, category_id: 2 });

    expect(hasEqCall(mock.calls, 'category_id', 2, 'recipes')).toBe(true);
    expect(
      mock.calls.some(
        (call) =>
          call.table === 'recipes' &&
          call.method === 'neq' &&
          call.args[0] === 'id' &&
          call.args[1] === 1,
      ),
    ).toBe(true);
    expect(findCalls(mock.calls, 'limit', 'recipes')[0]!.args).toEqual([4]);
    expect(result).toHaveLength(1);
  });

  it('tôn trọng limit truyền vào', async () => {
    setMock({ tables: { recipes: { data: [] } } });

    await getRelatedRecipes({ id: 1, category_id: 2 }, 8);

    expect(findCalls(mock.calls, 'limit', 'recipes')[0]!.args).toEqual([8]);
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({ tables: { recipes: { error: { message: 'db down' } } } });

    await expect(
      getRelatedRecipes({ id: 1, category_id: 2 }),
    ).rejects.toThrow('Không tải được công thức liên quan');
  });
});

describe('getLatestRecipes', () => {
  it('mặc định 8 món đã xuất bản, mới nhất trước', async () => {
    setMock({ tables: { recipes: { data: [makeRecipeRow()] } } });

    const result = await getLatestRecipes();

    expect(hasEqCall(mock.calls, 'status', 'published', 'recipes')).toBe(true);
    expect(findCalls(mock.calls, 'limit', 'recipes')[0]!.args).toEqual([8]);
    expect(
      mock.calls.some(
        (call) =>
          call.method === 'order' &&
          call.args[0] === 'created_at' &&
          (call.args[1] as { ascending: boolean }).ascending === false,
      ),
    ).toBe(true);
    expect(result).toHaveLength(1);
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({ tables: { recipes: { error: { message: 'db down' } } } });

    await expect(getLatestRecipes()).rejects.toThrow(
      'Không tải được công thức mới',
    );
  });
});

describe('getTopRatedRecipes', () => {
  it('chưa có đánh giá nào -> mảng rỗng', async () => {
    setMock({ tables: { ratings: { data: [] } } });

    expect(await getTopRatedRecipes()).toEqual([]);
    expect(findCalls(mock.calls, 'from', 'recipes')).toHaveLength(0);
  });

  it('tổng hợp điểm, sắp theo avg rồi count, chỉ lấy published', async () => {
    setMock({
      tables: {
        ratings: {
          data: [
            { recipe_id: 1, rating: 5 },
            { recipe_id: 2, rating: 4 },
            { recipe_id: 2, rating: 4 },
            { recipe_id: 3, rating: 5 },
            { recipe_id: 3, rating: 5 },
            { recipe_id: 3, rating: 5 },
          ],
        },
        recipes: {
          data: [
            makeRecipeRow({ id: 1 }),
            makeRecipeRow({ id: 2 }),
            makeRecipeRow({ id: 3 }),
          ],
        },
      },
    });

    const result = await getTopRatedRecipes();

    // id 3: avg 5 (3 lượt) > id 1: avg 5 (1 lượt) > id 2: avg 4.
    expect(result.map((r) => r.id)).toEqual([3, 1, 2]);
    expect(result[0]!.rating).toEqual({ average: 5, count: 3 });
    expect(result[1]!.rating).toEqual({ average: 5, count: 1 });
    // Query món theo đúng topIds.
    expect(findCalls(mock.calls, 'in', 'recipes')[0]!.args).toEqual([
      'id',
      [3, 1, 2],
    ]);
    expect(hasEqCall(mock.calls, 'status', 'published', 'recipes')).toBe(true);
  });

  it('tôn trọng limit', async () => {
    setMock({
      tables: {
        ratings: {
          data: [
            { recipe_id: 1, rating: 5 },
            { recipe_id: 2, rating: 4 },
          ],
        },
        recipes: { data: [makeRecipeRow({ id: 1 })] },
      },
    });

    const result = await getTopRatedRecipes(1);

    expect(result.map((r) => r.id)).toEqual([1]);
    expect(findCalls(mock.calls, 'in', 'recipes')[0]!.args).toEqual([
      'id',
      [1],
    ]);
  });

  it('ném lỗi khi query ratings thất bại', async () => {
    setMock({ tables: { ratings: { error: { message: 'db down' } } } });

    await expect(getTopRatedRecipes()).rejects.toThrow(
      'Không tải được đánh giá',
    );
  });

  it('ném lỗi khi query recipes thất bại', async () => {
    setMock({
      tables: {
        ratings: { data: [{ recipe_id: 1, rating: 5 }] },
        recipes: { error: { message: 'db down' } },
      },
    });

    await expect(getTopRatedRecipes()).rejects.toThrow(
      'Không tải được công thức đánh giá cao',
    );
  });
});

describe('getRatingSummary (queries.ts)', () => {
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

describe('getUserRating', () => {
  it('chưa đăng nhập -> null, không query', async () => {
    expect(await getUserRating(null, 1)).toBeNull();
    expect(mock.calls).toHaveLength(0);
  });

  it('trả về điểm đã đánh giá', async () => {
    setMock({ tables: { ratings: { data: [{ rating: 4 }] } } });

    expect(await getUserRating('user-1', 1)).toBe(4);
  });

  it('chưa đánh giá -> null', async () => {
    setMock({ tables: { ratings: { data: [] } } });

    expect(await getUserRating('user-1', 1)).toBeNull();
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({ tables: { ratings: { error: { message: 'db down' } } } });

    await expect(getUserRating('user-1', 1)).rejects.toThrow(
      'Không tải được đánh giá của bạn',
    );
  });
});

describe('isFavorite', () => {
  it('chưa đăng nhập -> false, không query', async () => {
    expect(await isFavorite(null, 1)).toBe(false);
    expect(mock.calls).toHaveLength(0);
  });

  it('đã yêu thích -> true', async () => {
    setMock({ tables: { favorites: { data: [{ recipe_id: 1 }] } } });

    expect(await isFavorite('user-1', 1)).toBe(true);
    expect(hasEqCall(mock.calls, 'user_id', 'user-1', 'favorites')).toBe(true);
    expect(hasEqCall(mock.calls, 'recipe_id', 1, 'favorites')).toBe(true);
  });

  it('chưa yêu thích -> false', async () => {
    setMock({ tables: { favorites: { data: [] } } });

    expect(await isFavorite('user-1', 1)).toBe(false);
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({ tables: { favorites: { error: { message: 'db down' } } } });

    await expect(isFavorite('user-1', 1)).rejects.toThrow(
      'Không kiểm tra được yêu thích',
    );
  });
});

describe('getFavoriteRecipes', () => {
  it('map món từ join, bỏ dòng recipes null', async () => {
    setMock({
      tables: {
        favorites: {
          data: [
            { created_at: '2026-10-18T00:00:00Z', recipes: makeRecipeRow({ id: 1 }) },
            { created_at: '2026-10-18T00:00:00Z', recipes: null },
          ],
        },
      },
    });

    const result = await getFavoriteRecipes('user-1');

    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(1);
    expect(result[0]!.category_name).toBe('Món chiên');
    expect(hasEqCall(mock.calls, 'user_id', 'user-1', 'favorites')).toBe(true);
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({ tables: { favorites: { error: { message: 'db down' } } } });

    await expect(getFavoriteRecipes('user-1')).rejects.toThrow(
      'Không tải được danh sách yêu thích',
    );
  });
});

describe('getMyRatingsWithRecipes', () => {
  it('map kèm title/slug, bỏ dòng recipes null', async () => {
    setMock({
      tables: {
        ratings: {
          data: [
            {
              recipe_id: 1,
              rating: 5,
              created_at: '2026-10-18T00:00:00Z',
              recipes: { title: 'Gà rán', slug: 'ga-ran' },
            },
            {
              recipe_id: 2,
              rating: 4,
              created_at: '2026-10-18T00:00:00Z',
              recipes: null,
            },
          ],
        },
      },
    });

    const result = await getMyRatingsWithRecipes('user-1');

    expect(result).toEqual([
      {
        recipe_id: 1,
        rating: 5,
        created_at: '2026-10-18T00:00:00Z',
        title: 'Gà rán',
        slug: 'ga-ran',
      },
    ]);
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({ tables: { ratings: { error: { message: 'db down' } } } });

    await expect(getMyRatingsWithRecipes('user-1')).rejects.toThrow(
      'Không tải được đánh giá của bạn',
    );
  });
});

describe('getCategoriesByDimension', () => {
  it('nhóm theo dimension, thiếu dimension -> nhom-mon', async () => {
    setMock({
      tables: {
        categories: {
          data: [
            { id: 1, name: 'A', slug: 'a', description: null, dimension: 'nhom-mon' },
            { id: 2, name: 'B', slug: 'b', description: null, dimension: 'bua-an' },
            { id: 3, name: 'C', slug: 'c', description: null, dimension: '' },
          ],
        },
      },
    });

    const result = await getCategoriesByDimension();

    expect(Object.keys(result).sort()).toEqual(['bua-an', 'nhom-mon']);
    expect(result['nhom-mon']!.map((c) => c.id)).toEqual([1, 3]);
    expect(result['bua-an']!.map((c) => c.id)).toEqual([2]);
  });
});

describe('getTags', () => {
  it('trả về tags sắp theo id', async () => {
    const rows = [{ id: 1, name: 'Tìm món', slug: 'tim-mon', created_at: 'x' }];

    setMock({ tables: { tags: { data: rows } } });

    expect(await getTags()).toEqual(rows);
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({ tables: { tags: { error: { message: 'db down' } } } });

    await expect(getTags()).rejects.toThrow('Không tải được tags');
  });
});

describe('getRecipesByTagSlug', () => {
  it('tag không tồn tại -> mảng rỗng', async () => {
    setMock({ tables: { tags: { data: [] } } });

    expect(await getRecipesByTagSlug('khong-co')).toEqual([]);
    expect(findCalls(mock.calls, 'from', 'recipe_tags')).toHaveLength(0);
  });

  it('tag lỗi -> mảng rỗng', async () => {
    setMock({ tables: { tags: { error: { message: 'db down' } } } });

    expect(await getRecipesByTagSlug('tim-mon')).toEqual([]);
  });

  it('map món từ join recipe_tags, bỏ dòng falsy', async () => {
    setMock({
      tables: {
        tags: { data: [{ id: 9 }] },
        recipe_tags: {
          data: [{ recipes: makeRecipeRow({ id: 1 }) }, { recipes: null }],
        },
      },
    });

    const result = await getRecipesByTagSlug('tim-mon');

    expect(hasEqCall(mock.calls, 'tag_id', 9, 'recipe_tags')).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(1);
  });

  it('ném lỗi khi query recipe_tags thất bại', async () => {
    setMock({
      tables: {
        tags: { data: [{ id: 9 }] },
        recipe_tags: { error: { message: 'db down' } },
      },
    });

    await expect(getRecipesByTagSlug('tim-mon')).rejects.toThrow(
      'Không tải được công thức theo tag',
    );
  });
});

describe('getRecipeQuestions', () => {
  it('trả về câu hỏi mới nhất trước', async () => {
    const rows = [
      {
        id: 1,
        recipe_id: 1,
        user_id: 'u1',
        question: 'Có thay bơ bằng dầu được không?',
        answer: null,
        answered_at: null,
        created_at: '2026-10-18T00:00:00Z',
      },
    ];

    setMock({ tables: { recipe_questions: { data: rows } } });

    const result = await getRecipeQuestions(1);

    expect(result).toEqual(rows);
    expect(hasEqCall(mock.calls, 'recipe_id', 1, 'recipe_questions')).toBe(
      true,
    );
    expect(
      mock.calls.some(
        (call) =>
          call.method === 'order' &&
          call.args[0] === 'created_at' &&
          (call.args[1] as { ascending: boolean }).ascending === false,
      ),
    ).toBe(true);
  });

  it('ném lỗi khi Supabase báo lỗi', async () => {
    setMock({ tables: { recipe_questions: { error: { message: 'db down' } } } });

    await expect(getRecipeQuestions(1)).rejects.toThrow(
      'Không tải được câu hỏi',
    );
  });
});
