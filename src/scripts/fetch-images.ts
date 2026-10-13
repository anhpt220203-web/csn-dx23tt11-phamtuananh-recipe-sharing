// Tải ảnh THẬT cho từng công thức từ hai kho ảnh GIẤY PHÉP MỞ:
//   1. Openverse (tổng hợp Flickr, Wikimedia, ...) — lọc CC0 / Public Domain / CC BY / CC BY-SA
//   2. Wikimedia Commons — nguồn dự phòng, tải ổn định hơn
// Sau khi tải, ghi lại công lao tác giả vào Recipe.sourceName + sourceUrl và lưu
// manifest ở prisma/data/image-credits.json.
//
// KHÔNG tải ảnh từ các website công thức thương mại (monngonmoingay.com, bachhoaxanh.com...)
// vì ảnh của họ thuộc bản quyền, không được phép dùng lại trong đồ án.
//
// Chạy: pnpm exec tsx scripts/fetch-images.ts [--limit N] [--slug <slug>] [--dry-run] [--only-commons]
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

const OUT_DIR = join(process.cwd(), "public", "images", "recipes");
const MANIFEST = join(process.cwd(), "prisma", "data", "image-credits.json");
const USER_AGENT =
  "do-an-cong-thuc-nau-an/0.1 (hoc phan TVU; lien he: phamtuananh@example.com)";
const OPENVERSE = "https://api.openverse.org/v1/images/";
const COMMONS = "https://commons.wikimedia.org/w/api.php";
const ALLOWED_LICENSES = "cc0,pdm,by,by-sa";
const MIN_WIDTH = 640;
const DELAY_MS = 1200;

// Từ khoá tìm ảnh cho từng món — tên tiếng Việt thường khớp tốt, một số món
// bổ sung từ khoá tiếng Anh để tăng độ chính xác.
const QUERY_HINTS: Record<string, string> = {
  "com-chien": "cơm chiên fried rice",
  "pho-bo-ha-noi": "phở bò",
  "thit-kho-trung": "thịt kho trứng",
  "bun-bo-hue": "bún bò huế",
  "ga-chien-nuoc-mam": "gà chiên nước mắm",
  "com-tam-suon-nuong": "cơm tấm sườn",
  "canh-chua-ca-loc": "canh chua cá",
  "canh-mong-toi-tom": "canh mồng tơi",
  "sup-ga-nam-huong": "chicken mushroom soup",
  "canh-bi-do-thit-bam": "canh bí đỏ",
  "canh-rong-bien-dau-hu": "seaweed tofu soup",
  "goi-cuon-tom-thit": "gỏi cuốn",
  "nem-ran": "chả giò nem rán",
  "goi-du-du-tom-kho": "gỏi đu đủ",
  "salad-dau-giam": "green salad vinaigrette",
  "dau-hu-sot-ca-chua": "đậu hũ sốt cà chua",
  "rau-cu-xao-nam": "stir fried vegetables mushrooms",
  "bun-xao-chay": "bún xào chay",
  "canh-du-du-chay": "canh đu đủ",
  "dau-hu-chien-sa-ot": "đậu hũ chiên sả",
  "banh-mi-trung-op-la": "bánh mì trứng",
  "banh-xeo-mien-trung": "bánh xèo",
  "ha-cao-hap": "har gow shrimp dumpling",
  "banh-trang-tron": "bánh tráng trộn",
  "banh-khot": "bánh khọt",
  "banh-flan-caramel": "bánh flan caramel",
  "che-ba-mau": "chè ba màu",
  "rau-cau-dua": "thạch rau câu dừa",
  "banh-chuoi-nuong": "bánh chuối nướng",
  "tra-dao-cam-sa": "trà đào cam sả",
  "sinh-to-bo": "sinh tố bơ avocado smoothie",
  "nuoc-chanh-day-hat-chia": "chanh dây passion fruit",
  "ca-phe-sua-da": "cà phê sữa đá",
};

type Photo = {
  provider: string;
  downloadUrl: string;
  fallbackUrls: string[];
  pageUrl: string;
  creator: string;
  license: string;
  width: number | null;
  title: string;
  tags: string;
};

type Credit = {
  slug: string;
  title: string;
  imageUrl: string;
  sourceName: string;
  sourceUrl: string;
  creator: string | null;
  license: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function tokensOf(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9à-ỹ]+/i)
    .filter((word) => word.length >= 3);
}

function score(photo: Photo, query: string): number {
  const haystack = `${photo.title} ${photo.tags}`.toLowerCase();
  const overlap = tokensOf(query).filter((token) => haystack.includes(token)).length;
  const resolution = Math.min(photo.width ?? 0, 2000);
  const videoPenalty = /video|youtube/i.test(photo.title) ? -500 : 0;
  return overlap * 1000 + resolution + videoPenalty;
}

function bestFor(photos: Photo[], query: string): Photo | null {
  const usable = photos.filter(
    (photo) => photo.downloadUrl && photo.width !== null && photo.width >= MIN_WIDTH,
  );
  if (usable.length === 0) return null;
  const overlapOk = usable.filter((photo) => score(photo, query) > 0);
  const pool = overlapOk.length > 0 ? overlapOk : usable;
  return pool.sort((a, b) => score(b, query) - score(a, query))[0];
}

// ─── Nguồn 1: Openverse ───
type OpenverseResult = {
  id: string;
  title: string;
  url: string;
  foreign_landing_url: string;
  creator: string | null;
  license: string;
  license_version: string;
  provider: string;
  width: number | null;
  mature: boolean;
  tags?: { name: string }[];
};

async function searchOpenverse(query: string): Promise<Photo[]> {
  const params = new URLSearchParams({
    q: query,
    license: ALLOWED_LICENSES,
    page_size: "12",
    mature: "false",
  });
  const response = await fetch(`${OPENVERSE}?${params}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Openverse ${response.status}`);
  const payload = (await response.json()) as { results?: OpenverseResult[] };
  return (payload.results ?? []).map((item) => ({
    provider: "Openverse",
    // Nhiều host (Flickr, upload.wikimedia.org) chặn tải trực tiếp → dùng proxy ảnh
    // của Openverse trước, URL gốc là phương án dự phòng.
    downloadUrl: `https://api.openverse.org/v1/images/${item.id}/thumb/?full_size=true`,
    fallbackUrls: [item.url],
    pageUrl: item.foreign_landing_url,
    creator: item.creator ?? "không rõ tác giả",
    license: `CC ${item.license.toUpperCase()} ${item.license_version}`,
    width: item.width,
    title: item.title,
    tags: (item.tags ?? []).map((tag) => tag.name).join(" "),
  }));
}

// ─── Nguồn 2: Wikimedia Commons ───
const BAD_LICENSE = /fair use|non-?free|all rights reserved|copyright \(c\)/i;

async function searchCommons(query: string): Promise<Photo[]> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: query,
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1400",
  });
  const response = await fetch(`${COMMONS}?${params}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Commons ${response.status}`);
  const payload = (await response.json()) as {
    query?: {
      pages?: Record<
        string,
        {
          title: string;
          imageinfo?: {
            mime?: string;
            width?: number;
            thumburl?: string;
            url?: string;
            descriptionurl?: string;
            extmetadata?: Record<string, { value?: string }>;
          }[];
        }
      >;
    };
  };

  const pages = Object.values(payload.query?.pages ?? {});
  return pages
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata ?? {};
      const license = (meta.LicenseShortName?.value ?? "").trim();
      if (!license || BAD_LICENSE.test(license)) return null;
      if (info.mime && !/^image\/(jpeg|png|webp)$/.test(info.mime)) return null;
      const creator = (meta.Artist?.value ?? "không rõ tác giả")
        .replace(/<[^>]*>/g, "")
        .trim()
        .slice(0, 80);
      return {
        provider: "Wikimedia Commons",
        downloadUrl: info.thumburl ?? info.url ?? "",
        fallbackUrls: info.url ? [info.url] : [],
        pageUrl: info.descriptionurl ?? "",
        creator,
        license,
        width: info.width ?? null,
        title: page.title,
        tags: (meta.Categories?.value ?? "").toString(),
      } satisfies Photo;
    })
    .filter((photo): photo is Photo => photo !== null);
}

function extensionFor(url: string): string {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".png")) return "png";
  if (clean.endsWith(".webp")) return "webp";
  if (clean.endsWith(".gif")) return "gif";
  return "jpg";
}

// Wikimedia/Openverse gắn thêm tham số tracking vào URL; bỏ đi cho gọn và tránh
// trường hợp CDN trả về 403 với URL có tham số.
function sanitize(url: string): string {
  try {
    const parsed = new URL(url);
    for (const key of [...parsed.searchParams.keys()]) {
      if (key.startsWith("utm_")) parsed.searchParams.delete(key);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

async function downloadOnce(url: string, dest: string, referer?: string): Promise<number> {
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "image/avif,image/webp,image/png,image/jpeg,*/*",
    "Accept-Language": "vi,en;q=0.8",
  };
  if (referer) headers.Referer = referer;

  const response = await fetch(sanitize(url), { headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const type = response.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) throw new Error(`không phải ảnh (${type})`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength < 10_000) throw new Error(`ảnh quá nhỏ (${buffer.byteLength}B)`);
  await writeFile(dest, buffer);
  return buffer.byteLength;
}

// Giãn cách mỗi request để không bị các kho ảnh chặn tạm thời.
const DOWNLOAD_GAP_MS = 2500;

async function download(photo: Photo, dest: string): Promise<number> {
  const urls = [photo.downloadUrl, ...photo.fallbackUrls].filter(Boolean);
  let lastError: Error | null = null;
  for (const url of urls) {
    try {
      const bytes = await downloadOnce(url, dest, photo.pageUrl || undefined);
      await sleep(DOWNLOAD_GAP_MS);
      return bytes;
    } catch (error) {
      lastError = error as Error;
      await sleep(DOWNLOAD_GAP_MS);
    }
  }
  throw lastError ?? new Error("không tải được ảnh");
}

async function findPhoto(candidates: string[], onlyCommons: boolean): Promise<{ photo: Photo; query: string } | null> {
  if (!onlyCommons) {
    for (const candidate of candidates) {
      try {
        const photo = bestFor(await searchOpenverse(candidate), candidate);
        if (photo) return { photo, query: candidate };
      } catch (error) {
        console.log(`  (Openverse lỗi ở “${candidate}”: ${(error as Error).message})`);
      }
      await sleep(400);
    }
  }
  for (const candidate of candidates) {
    try {
      const photo = bestFor(await searchCommons(candidate), candidate);
      if (photo) return { photo, query: candidate };
    } catch (error) {
      console.log(`  (Commons lỗi ở “${candidate}”: ${(error as Error).message})`);
    }
    await sleep(400);
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const onlyCommons = args.includes("--only-commons");
  const limitArg = args.indexOf("--limit");
  const limit = limitArg >= 0 ? Number(args[limitArg + 1]) : Infinity;
  const slugArg = args.indexOf("--slug");
  const onlySlug = slugArg >= 0 ? args[slugArg + 1] : undefined;

  await mkdir(OUT_DIR, { recursive: true });

  let credits: Record<string, Credit> = {};
  try {
    credits = JSON.parse(await readFile(MANIFEST, "utf8")) as Record<string, Credit>;
  } catch {
    credits = {};
  }

  const recipes = await prisma.recipe.findMany({
    where: onlySlug ? { slug: onlySlug } : undefined,
    select: { id: true, slug: true, title: true },
    orderBy: { slug: "asc" },
  });

  let fetched = 0;
  const failed: string[] = [];

  for (const recipe of recipes) {
    if (fetched >= limit) break;
    if (credits[recipe.slug] && !credits[recipe.slug].imageUrl.endsWith(".svg")) {
      continue; // đã có ảnh thật
    }

    const candidates = [
      QUERY_HINTS[recipe.slug],
      recipe.title,
      recipe.title.split(/\s+/).slice(0, 2).join(" "),
    ].filter(
      (value, index, all): value is string =>
        Boolean(value?.trim()) && all.indexOf(value) === index,
    );

    try {
      const found = await findPhoto(candidates, onlyCommons);
      if (!found) {
        failed.push(`${recipe.slug} (không tìm được ảnh cho: ${candidates[0]})`);
        console.log(`✗ ${recipe.slug}: không tìm được ảnh`);
        await sleep(DELAY_MS);
        continue;
      }

      const { photo, query } = found;
      const fileName = `${recipe.slug}.${extensionFor(photo.downloadUrl)}`;
      const dest = join(OUT_DIR, fileName);
      const imageUrl = `/images/recipes/${fileName}`;
      const sourceName = `Ảnh: ${photo.creator} — ${photo.license} (${photo.provider})`;

      if (dryRun) {
        console.log(
          `? ${recipe.slug}: “${photo.title.slice(0, 60)}” [${query}] — ${photo.license} / ${photo.creator}`,
        );
        fetched += 1;
        await sleep(DELAY_MS);
        continue;
      }

      const bytes = await download(photo, dest);

      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { imageUrl, sourceName, sourceUrl: photo.pageUrl || null },
      });

      credits[recipe.slug] = {
        slug: recipe.slug,
        title: recipe.title,
        imageUrl,
        sourceName,
        sourceUrl: photo.pageUrl,
        creator: photo.creator,
        license: photo.license,
      };

      console.log(
        `✓ ${recipe.slug}: ${(bytes / 1024).toFixed(0)}KB — ${photo.license} / ${photo.creator} (${photo.provider})`,
      );
      fetched += 1;
      await sleep(DELAY_MS);
    } catch (error) {
      failed.push(`${recipe.slug} (${(error as Error).message})`);
      console.log(`✗ ${recipe.slug}: ${(error as Error).message}`);
      await sleep(DELAY_MS);
    }
  }

  if (!dryRun && fetched > 0) {
    await writeFile(MANIFEST, `${JSON.stringify(credits, null, 2)}\n`, "utf8");
  }

  const total = await prisma.recipe.count();
  const withPhoto = await prisma.recipe.count({
    where: { NOT: { imageUrl: { endsWith: ".svg" } } },
  });

  console.log("");
  console.log(`Lần chạy này: ${fetched} ảnh. Tổng có ảnh thật: ${withPhoto}/${total}.`);
  if (failed.length > 0) {
    console.log(`Chưa lấy được (${failed.length}):`);
    for (const item of failed) console.log(`  - ${item}`);
  }
  console.log("Nguồn ảnh lưu tại prisma/data/image-credits.json");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Lỗi lấy ảnh:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
