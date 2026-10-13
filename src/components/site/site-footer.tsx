import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { NavCategory } from "@/components/site/site-nav";

const SOCIALS = ["YouTube", "Facebook", "Instagram"];

const ABOUT_LINKS = [
  { label: "Về website", href: "/#gioi-thieu" },
  { label: "Tất cả công thức", href: "/cong-thuc" },
  { label: "Hỏi đáp", href: "/#ho-tro" },
  { label: "Liên hệ", href: "/#lien-he" },
  { label: "Điều khoản sử dụng", href: "/#dieu-khoan" },
];

// Footer nền kem sáng, chữ đen, 3 cột + dải đăng ký nhận tin.
export function SiteFooter({ categories }: { categories: NavCategory[] }) {
  return (
    <footer className="bg-cream text-ink">
      {/* Dải đăng ký nhận tin */}
      <div className="bg-white">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row">
          <p className="font-script text-2xl text-brand">
            Đăng ký nhận công thức mới mỗi tuần
          </p>
          <form action="/cong-thuc" className="flex w-full max-w-md items-center gap-2">
            <input
              type="search"
              name="q"
              placeholder="Tìm món bạn muốn nấu hôm nay..."
              className="h-[42px] flex-1 rounded-lg bg-zinc-100 px-4 text-sm text-ink outline-none transition focus:bg-white focus:ring-2 focus:ring-brand/40"
            />
            <button
              type="submit"
              className="flex h-[42px] items-center gap-1 rounded-lg bg-brand px-4 text-sm font-bold uppercase text-white transition hover:bg-brand-dark"
            >
              Tìm
              <ChevronRight className="size-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-11 place-items-center rounded-lg bg-brand text-2xl text-white">
              🍳
            </span>
            <span className="leading-none">
              <span className="block font-script text-2xl text-brand">
                Công thức
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-ink">
                Nấu ăn
              </span>
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Website quản lý và chia sẻ công thức nấu ăn — kho công thức theo
            danh mục, nơi lưu giữ và lan tỏa những bữa cơm nhà ngon.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-zinc-600">Theo dõi trên:</span>
            {SOCIALS.map((name) => (
              <a
                key={name}
                href="#"
                className="rounded border border-zinc-300 px-2 py-0.5 text-[11px] font-semibold text-zinc-700 transition hover:border-brand hover:text-brand"
              >
                {name}
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Giới thiệu">
          <h2 className="mb-3 text-base font-bold uppercase text-brand">
            Giới thiệu
          </h2>
          <ul className="space-y-2 text-sm">
            {ABOUT_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-zinc-700 transition hover:text-brand hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Danh mục món ăn">
          <h2 className="mb-3 text-base font-bold uppercase text-brand">
            Danh mục món ăn
          </h2>
          <ul className="space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/danh-muc/${c.slug}`}
                  className="text-zinc-700 transition hover:text-brand hover:underline"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-zinc-500 sm:flex-row">
          <p>
            © 2026 Website Quản lý &amp; Chia sẻ Công thức Nấu Ăn — Đồ án học
            phần.
          </p>
          <p>
            Ảnh món ăn dùng từ kho ảnh giấy phép mở (Openverse, Wikimedia
            Commons); thông tin tác giả ghi ở từng trang công thức.
          </p>
        </div>
      </div>
    </footer>
  );
}
