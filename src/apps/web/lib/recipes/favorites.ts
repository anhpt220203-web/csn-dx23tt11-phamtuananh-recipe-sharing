/**
 * Truy vấn bảng `favorites` (món yêu thích) — FR5.
 *
 * Schema DB (task 2, migration 20261014140000_recipes.sql):
 *   favorites(user_id uuid, recipe_id bigint, created_at timestamptz)
 *   khóa chính kép (user_id, recipe_id); RLS chỉ chủ sở hữu được đọc/ghi.
 */
import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

export type FavoriteRow = {
  user_id: string;
  recipe_id: number;
  created_at: string;
};

/** Công thức trong danh sách yêu thích (kèm thông tin hiển thị tối thiểu). */
export type FavoriteRecipe = {
  recipe_id: number;
  favorited_at: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

type TableDef<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Row>;
  Relationships: never[];
};

/**
 * Schema tối thiểu cho supabase-js generic.
 */
export type FavoritesSchema = {
  public: {
    Tables: {
      favorites: TableDef<
        FavoriteRow,
        { user_id: string; recipe_id: number }
      >;
      recipes: TableDef<
        {
          id: number;
          title: string;
          slug: string;
          description: string | null;
          image_url: string | null;
        },
        {
          id: number;
          title: string;
          slug: string;
          description: string | null;
          image_url: string | null;
        }
      >;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

function getClient() {
  return getSupabaseServerClient<FavoritesSchema>();
}

/**
 * ID của người dùng đang đăng nhập, hoặc null nếu chưa đăng nhập.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const client = getSupabaseServerClient();

  const { data } = await client.auth.getUser();

  return data.user?.id ?? null;
}

/**
 * Người dùng hiện tại có đang yêu thích công thức này không.
 * Trả về false khi chưa đăng nhập.
 */
export async function isRecipeFavorited(recipeId: number): Promise<boolean> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return false;
  }

  const client = getClient();

  const { data, error } = await client
    .from('favorites')
    .select('recipe_id')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .maybeSingle();

  if (error) {
    throw new Error(`Không kiểm tra được trạng thái yêu thích: ${error.message}`);
  }

  return data !== null;
}

/**
 * Danh sách công thức yêu thích của người dùng hiện tại, mới nhất trước.
 * Trả về mảng rỗng khi chưa đăng nhập.
 */
export async function getMyFavoriteRecipes(): Promise<FavoriteRecipe[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const client = getClient();

  const { data, error } = await client
    .from('favorites')
    .select('recipe_id, created_at, recipes (id, title, slug, description, image_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Không tải được danh sách yêu thích: ${error.message}`);
  }

  return (data ?? []).flatMap((row) => {
    const recipe = row.recipes as unknown as {
      id: number;
      title: string;
      slug: string;
      description: string | null;
      image_url: string | null;
    } | null;

    if (!recipe) {
      return [];
    }

    return [
      {
        recipe_id: recipe.id,
        favorited_at: row.created_at,
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        image_url: recipe.image_url,
      },
    ];
  });
}
