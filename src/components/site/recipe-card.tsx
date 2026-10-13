import Link from "next/link";
import { ChefHat, Clock3, Heart, Users } from "lucide-react";

import {
  CARD_GRADIENTS,
  CATEGORY_EMOJI,
  DEFAULT_EMOJI,
} from "@/lib/site-data";

export type RecipeCardRecipe = {
  id: number | string;
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  servings?: number | null;
  cookTime?: number | null;
  difficulty?: string | null;
  category: { name: string; slug: string };
};

export type RecipeCardProps = {
  recipe: RecipeCardRecipe;
  votes?: number;
  className?: string;
};

// Thẻ công thức: ảnh trên, tên món, chip danh mục, hàng thông tin nhỏ
// (khẩu phần / độ khó / thời gian) và nút xem chi tiết màu đỏ bo góc 8px.
export function RecipeCard({ recipe, votes = 0, className = "" }: RecipeCardProps) {
  const emoji = CATEGORY_EMOJI[recipe.category.slug] ?? DEFAULT_EMOJI;
  const gradient =
    CARD_GRADIENTS[Math.abs(hashString(recipe.slug)) % CARD_GRADIENTS.length];

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white transition hover:shadow-lg ${className}`}
    >
      <Link
        href={`/cong-thuc/${recipe.slug}`}
        className={`relative block h-44 w-full overflow-hidden bg-gradient-to-br ${gradient}`}
        aria-label={recipe.title}
      >
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span
            aria-hidden
            className="grid h-full w-full place-items-center text-6xl transition duration-300 group-hover:scale-110"
          >
            {emoji}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-ink">
          <Link
            href={`/cong-thuc/${recipe.slug}`}
            className="transition group-hover:text-brand"
          >
            {recipe.title}
          </Link>
        </h3>

        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
          <li className="flex items-center gap-1">
            <Heart className="size-3.5 fill-brand text-brand" />
            {votes}
          </li>
          {recipe.servings ? (
            <li className="flex items-center gap-1">
              <Users className="size-3.5 text-zinc-400" />
              {recipe.servings} Người
            </li>
          ) : null}
          {recipe.difficulty ? (
            <li className="flex items-center gap-1">
              <ChefHat className="size-3.5 text-zinc-400" />
              {recipe.difficulty}
            </li>
          ) : null}
          {recipe.cookTime ? (
            <li className="flex items-center gap-1">
              <Clock3 className="size-3.5 text-zinc-400" />
              {formatCookTime(recipe.cookTime)}
            </li>
          ) : null}
        </ul>

        <span className="w-fit rounded bg-cream px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand">
          {recipe.category.name}
        </span>

        <Link
          href={`/cong-thuc/${recipe.slug}`}
          className="mt-auto inline-flex items-center justify-center gap-1 rounded-lg border-2 border-brand px-4 py-2 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
        >
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
}

export function formatCookTime(minutes: number): string {
  if (minutes < 60) return `${minutes} Phút`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} Giờ` : `${hours} Giờ ${rest} Phút`;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
