/**
 * Kiểu dữ liệu cho banners và tips (nội dung trang chủ).
 *
 * Khớp với migration `supabase/migrations/20261016160000_banners_tips.sql`.
 */

export type BannerRow = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type TipRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: never[];
};

export type ContentSchema = {
  public: {
    Tables: {
      banners: TableDef<BannerRow>;
      tips: TableDef<TipRow>;
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
