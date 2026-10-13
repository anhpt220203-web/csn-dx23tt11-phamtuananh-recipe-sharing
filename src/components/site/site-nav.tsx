"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";

export type NavCategory = { name: string; slug: string };

// Logo chữ của dự án (không dùng logo hình của bên thứ ba).
function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="grid size-11 place-items-center rounded-lg bg-brand text-2xl text-white">
        🍳
      </span>
      <span className="leading-none">
        <span className="block font-script text-2xl text-brand">Công thức</span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-ink">
          Nấu ăn
        </span>
      </span>
    </span>
  );
}

export function SiteNav({ categories }: { categories: NavCategory[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="flex w-full items-center justify-between gap-4">
        {/* Nhóm menu bên trái (desktop) */}
        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 rounded px-3 py-2 text-base font-bold text-ink transition group-hover:text-brand"
            >
              Thực đơn
              <ChevronDown className="size-4 transition group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-60 translate-y-1 rounded-lg border border-zinc-100 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/danh-muc/${c.slug}`}
                  className="block rounded px-3 py-2 text-sm text-zinc-700 transition hover:bg-cream hover:text-brand"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/cong-thuc"
            className="rounded px-3 py-2 text-base font-bold text-ink transition hover:text-brand"
          >
            Tất cả công thức
          </Link>
        </nav>

        {/* Logo canh giữa */}
        <Link href="/" className="mx-auto shrink-0 lg:mx-0" aria-label="Trang chủ">
          <Logo />
        </Link>

        {/* Nhóm menu bên phải (desktop) */}
        <nav className="hidden flex-1 items-center justify-end gap-1 lg:flex">
          <Link
            href="/#moi-ra-lo"
            className="rounded px-3 py-2 text-base font-bold text-ink transition hover:text-brand"
          >
            Công thức mới
          </Link>
          <Link
            href="/#danh-muc"
            className="rounded px-3 py-2 text-base font-bold text-ink transition hover:text-brand"
          >
            Danh mục món
          </Link>
          <Link
            href="/#chia-se"
            className="ml-1 rounded-lg bg-brand px-4 py-2 text-sm font-bold uppercase text-white transition hover:bg-brand-dark"
          >
            Chia sẻ công thức
          </Link>
        </nav>

        {/* Nút menu mobile */}
        <button
          type="button"
          aria-label="Mở menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="grid size-10 place-items-center rounded text-ink transition hover:bg-cream lg:hidden"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Menu mobile */}
      {mobileOpen ? (
        <nav className="absolute inset-x-0 top-full border-t border-zinc-100 bg-white px-4 py-3 shadow-lg lg:hidden">
          <p className="px-2 pb-1 text-xs font-bold uppercase tracking-wide text-zinc-400">
            Danh mục
          </p>
          <div className="grid grid-cols-2 gap-1">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/danh-muc/${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="rounded px-2 py-2 text-sm text-zinc-700 transition hover:bg-cream hover:text-brand"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className="mt-2 flex flex-col border-t border-zinc-100 pt-2">
            {[
              { href: "/cong-thuc", label: "Tất cả công thức" },
              { href: "/#moi-ra-lo", label: "Công thức mới" },
              { href: "/#danh-muc", label: "Danh mục món" },
              { href: "/#chia-se", label: "Chia sẻ công thức" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded px-2 py-2 text-sm font-bold text-ink transition hover:bg-cream hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </>
  );
}
