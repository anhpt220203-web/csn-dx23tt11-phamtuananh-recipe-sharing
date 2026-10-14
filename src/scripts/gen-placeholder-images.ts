// Sinh ảnh placeholder SVG cho từng công thức (nền gradient ấm + emoji theo danh mục
// + tên món). Chạy: pnpm exec tsx scripts/gen-placeholder-images.ts
// Ảnh thật sẽ thay thế sau: upload lên Supabase Storage rồi cập nhật Recipe.imageUrl.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { RECIPE_SEED } from "../prisma/data/recipes";

const OUT_DIR = join(process.cwd(), "public", "images", "recipes");

const EMOJI: Record<string, string> = {
  "mon-chinh": "🍛",
  "mon-canh": "🍲",
  "mon-khai-vi": "🥟",
  "mon-chay": "🥗",
  "mon-an-vat": "🍤",
  "mon-trang-mieng": "🍮",
  "do-uong": "🧋",
};

const GRADIENTS: Record<string, [string, string]> = {
  "mon-chinh": ["#f97316", "#fde68a"],
  "mon-canh": ["#f59e0b", "#fef3c7"],
  "mon-khai-vi": ["#ef4444", "#fecaca"],
  "mon-chay": ["#22c55e", "#d9f99d"],
  "mon-an-vat": ["#fb7185", "#fde68a"],
  "mon-trang-mieng": ["#d946ef", "#fbcfe8"],
  "do-uong": ["#0ea5e9", "#bae6fd"],
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function svgFor(title: string, categorySlug: string): string {
  const [from, to] = GRADIENTS[categorySlug] ?? ["#f97316", "#fde68a"];
  const emoji = EMOJI[categorySlug] ?? "🍳";
  const safeTitle = escapeXml(title);
  // Ngắt dòng thủ công cho tên món dài.
  const words = safeTitle.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > 22) {
      lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`;
    }
  }
  if (current.trim()) lines.push(current.trim());

  const titleSvg = lines
    .slice(0, 3)
    .map(
      (line, index) =>
        `<text x="400" y="${560 + index * 46}" text-anchor="middle" font-family="Segoe UI, system-ui, sans-serif" font-size="38" font-weight="700" fill="#ffffff">${line}</text>`,
    )
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" role="img" aria-label="${safeTitle}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <circle cx="400" cy="270" r="150" fill="#ffffff" fill-opacity="0.22"/>
  <text x="400" y="330" text-anchor="middle" font-size="170">${emoji}</text>
  ${titleSvg}
</svg>
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const recipe of RECIPE_SEED) {
    const svg = svgFor(recipe.title, recipe.categorySlug);
    await writeFile(join(OUT_DIR, `${recipe.slug}.svg`), svg, "utf8");
  }
  console.log(`Đã sinh ${RECIPE_SEED.length} ảnh placeholder vào public/images/recipes/`);
}

main().catch((error) => {
  console.error("Sinh ảnh placeholder lỗi:", error);
  process.exit(1);
});
