// Import công thức vào DB từ file JSON hoặc CSV (upsert theo slug — chạy lại không nhân đôi).
//
// Cách dùng:
//   pnpm exec tsx scripts/import-recipes.ts --file prisma/data/my-recipes.json
//   pnpm exec tsx scripts/import-recipes.ts --file data/recipes.csv --dry-run
//
// Định dạng JSON: mảng recipe, hoặc { "categories": [...], "recipes": [...] }.
// Định dạng CSV: dòng đầu là tiêu đề; nhiều giá trị trong một ô ngăn bằng dấu "|".
//   Cột bắt buộc: slug,title,categorySlug
//   Cột tuỳ chọn: description,ingredients,steps,servings,cookTime,difficulty,imageUrl,sourceName,sourceUrl
import { readFile } from "node:fs/promises";

import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

type ImportRecipe = {
  slug: string;
  title: string;
  categorySlug: string;
  description?: string;
  ingredients?: string[];
  steps?: string[];
  servings?: number;
  cookTime?: number;
  difficulty?: string;
  imageUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
};

type ImportCategory = { name: string; slug: string; description?: string };

function parseArgs() {
  const args = process.argv.slice(2);
  const fileArg = args.find((a) => a.startsWith("--file="));
  const fileFromEqual = fileArg ? fileArg.split("=")[1] : undefined;
  const index = args.indexOf("--file");
  const fileFromSpace = index >= 0 ? args[index + 1] : undefined;
  return {
    file: fileFromEqual ?? fileFromSpace,
    dryRun: args.includes("--dry-run"),
  };
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells.map((c) => c.trim());
}

function parseCsv(content: string): { categories: ImportCategory[]; recipes: ImportRecipe[] } {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { categories: [], recipes: [] };

  const header = parseCsvLine(lines[0]);
  const toList = (value?: string) =>
    value ? value.split("|").map((s) => s.trim()).filter(Boolean) : undefined;

  const recipes = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row: Record<string, string> = {};
    header.forEach((key, i) => {
      row[key] = cells[i] ?? "";
    });
    return {
      slug: row.slug,
      title: row.title,
      categorySlug: row.categorySlug || row.category || "mon-chinh",
      description: row.description || undefined,
      ingredients: toList(row.ingredients),
      steps: toList(row.steps),
      servings: row.servings ? Number(row.servings) : undefined,
      cookTime: row.cookTime ? Number(row.cookTime) : undefined,
      difficulty: row.difficulty || undefined,
      imageUrl: row.imageUrl || undefined,
      sourceName: row.sourceName || undefined,
      sourceUrl: row.sourceUrl || undefined,
    } satisfies ImportRecipe;
  });

  return { categories: [], recipes };
}

async function loadFile(path: string) {
  const content = await readFile(path, "utf8");
  if (path.toLowerCase().endsWith(".csv")) return parseCsv(content);
  const parsed = JSON.parse(content) as
    | ImportRecipe[]
    | { categories?: ImportCategory[]; recipes: ImportRecipe[] };
  if (Array.isArray(parsed)) return { categories: [], recipes: parsed };
  return { categories: parsed.categories ?? [], recipes: parsed.recipes ?? [] };
}

async function main() {
  const { file, dryRun } = parseArgs();
  if (!file) {
    console.error(
      "Thiếu tham số --file. Ví dụ: pnpm exec tsx scripts/import-recipes.ts --file data/recipes.json",
    );
    process.exit(1);
  }

  const { categories, recipes } = await loadFile(file);
  if (recipes.length === 0) {
    console.error("Không có công thức nào trong file.");
    process.exit(1);
  }

  const invalid = recipes.filter((r) => !r.slug || !r.title);
  if (invalid.length > 0) {
    console.error(`${invalid.length} dòng thiếu slug hoặc title — dừng để tránh ghi dữ liệu lỗi.`);
    process.exit(1);
  }

  if (dryRun) {
    console.log(
      `[dry-run] ${categories.length} danh mục, ${recipes.length} công thức hợp lệ — chưa ghi vào DB.`,
    );
    return;
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description ?? null },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description ?? null,
      },
    });
  }

  const allCategories = await prisma.category.findMany({
    select: { id: true, slug: true },
  });
  const categoryIdBySlug = new Map(allCategories.map((c) => [c.slug, c.id]));

  let created = 0;
  let updated = 0;
  const skipped: string[] = [];

  for (const recipe of recipes) {
    const categoryId = categoryIdBySlug.get(recipe.categorySlug);
    if (!categoryId) {
      skipped.push(`${recipe.slug} (thiếu danh mục "${recipe.categorySlug}")`);
      continue;
    }

    const data = {
      categoryId,
      title: recipe.title,
      description: recipe.description ?? null,
      imageUrl: recipe.imageUrl ?? null,
      ingredients: recipe.ingredients ?? [],
      steps: recipe.steps ?? [],
      servings: recipe.servings ?? null,
      cookTime: recipe.cookTime ?? null,
      difficulty: recipe.difficulty ?? null,
      sourceName: recipe.sourceName ?? null,
      sourceUrl: recipe.sourceUrl ?? null,
    };

    const existing = await prisma.recipe.findUnique({
      where: { slug: recipe.slug },
      select: { id: true },
    });
    await prisma.recipe.upsert({
      where: { slug: recipe.slug },
      update: data,
      create: { slug: recipe.slug, ...data },
    });
    if (existing) updated += 1;
    else created += 1;
  }

  console.log(
    `Import xong: ${created} công thức mới, ${updated} cập nhật${skipped.length ? `, ${skipped.length} bỏ qua` : ""}.`,
  );
  for (const item of skipped) console.log(`  - bỏ qua: ${item}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Import lỗi:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
