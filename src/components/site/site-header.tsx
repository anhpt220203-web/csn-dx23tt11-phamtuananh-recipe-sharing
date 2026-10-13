import Link from "next/link";
import { ChevronRight, Search, UserRound } from "lucide-react";

import { SiteNav, type NavCategory } from "@/components/site/site-nav";

const SOCIALS = ["YouTube", "Facebook", "Instagram"];

// Header dùng chung: dải trên cùng màu đỏ (31px) + hàng nav nền kem với logo ở giữa.
export function SiteHeader({ categories }: { categories: NavCategory[] }) {
  return (
    <header className="sticky top-0 z-50">
      {/* Dải trên cùng */}
      <div className="bg-brand text-white">
        <div className="mx-auto flex h-[31px] max-w-[1320px] items-center justify-between gap-3 px-4 text-[13px]">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/cong-thuc" className="hover:underline">
              Món ngon
            </Link>
            <span className="text-white/50">|</span>
            <Link href="/#ho-tro" className="hover:underline">
              Hỏi đầu bếp
            </Link>
            <span className="hidden items-center gap-2 md:flex">
              <span className="text-white/80">Theo dõi trên:</span>
              {SOCIALS.map((name) => (
                <a
                  key={name}
                  href="#"
                  className="rounded bg-white/20 px-2 py-0.5 text-[11px] font-semibold transition hover:bg-white hover:text-brand"
                >
                  {name}
                </a>
              ))}
            </span>
            <span className="hidden text-white/80 lg:inline">
              Số thành viên <strong className="font-bold text-white">128</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[13px] font-bold uppercase">
            <Link
              href="/cong-thuc"
              aria-label="Tìm kiếm công thức"
              className="grid size-6 place-items-center rounded transition hover:bg-white/15"
            >
              <Search className="size-4" />
            </Link>
            <a
              href="#"
              className="flex items-center gap-1.5 rounded border border-white/70 px-3 py-0.5 transition hover:bg-white hover:text-brand"
            >
              <UserRound className="size-3.5" />
              Đăng nhập
            </a>
            <a
              href="#"
              className="hidden items-center gap-1.5 rounded bg-white px-3 py-0.5 text-brand transition hover:bg-cream sm:flex"
            >
              Đăng ký
              <ChevronRight className="size-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Hàng nav: logo canh giữa, nền kem mờ */}
      <div className="relative border-b border-cream bg-cream/80 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1320px] items-center px-4 lg:h-[112px]">
          <SiteNav categories={categories} />
        </div>
      </div>
    </header>
  );
}
