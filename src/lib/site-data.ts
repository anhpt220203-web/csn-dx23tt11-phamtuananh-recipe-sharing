// Hằng số hiển thị dùng chung cho các component giao diện.
// Toàn bộ nội dung công thức/danh mục lấy từ DB (services/recipe-service.ts);
// file này KHÔNG chứa dữ liệu công thức mẫu.

export type CategoryData = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
};

export type RecipeCardData = {
  id: number | string;
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  servings?: number | null;
  cookTime?: number | null;
  difficulty?: string | null;
  category: CategoryData;
};

// Chỉ dùng khi DB chưa kết nối được, để thanh điều hướng vẫn có danh mục.
export const FALLBACK_CATEGORIES: CategoryData[] = [
  { id: 1, name: "Món chính", slug: "mon-chinh" },
  { id: 2, name: "Món canh", slug: "mon-canh" },
  { id: 3, name: "Món khai vị", slug: "mon-khai-vi" },
  { id: 4, name: "Món chay", slug: "mon-chay" },
  { id: 5, name: "Món ăn vặt", slug: "mon-an-vat" },
  { id: 6, name: "Món tráng miệng", slug: "mon-trang-mieng" },
  { id: 7, name: "Đồ uống", slug: "do-uong" },
];

// Emoji minh hoạ theo danh mục — dùng khi công thức chưa có ảnh.
export const CATEGORY_EMOJI: Record<string, string> = {
  "mon-chinh": "🍛",
  "mon-canh": "🍲",
  "mon-khai-vi": "🥟",
  "mon-chay": "🥗",
  "mon-an-vat": "🍤",
  "mon-trang-mieng": "🍮",
  "do-uong": "🧋",
};

export const DEFAULT_EMOJI = "🍳";

// Vòng lặp gradient nền ấm cho placeholder ảnh và thẻ danh mục.
export const CARD_GRADIENTS = [
  "from-orange-200 via-amber-100 to-rose-100",
  "from-rose-200 via-orange-100 to-amber-100",
  "from-amber-200 via-yellow-100 to-orange-100",
  "from-red-200 via-rose-100 to-orange-100",
  "from-yellow-200 via-amber-100 to-red-100",
  "from-orange-100 via-rose-100 to-red-100",
];
