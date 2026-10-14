import type { Metadata } from "next";
import { Geist_Mono, Lobster, Open_Sans } from "next/font/google";
import "./globals.css";

import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { FALLBACK_CATEGORIES } from "@/lib/site-data";
import { listCategories } from "@/services/recipe-service";

// Dữ liệu lấy từ DB theo từng request (DB có thể chưa sẵn sàng lúc build).
export const dynamic = "force-dynamic";

// Font chính: Open Sans (hỗ trợ đầy đủ dấu tiếng Việt) + Lobster cho dòng chữ viết tay.
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const lobster = Lobster({
  variable: "--font-lobster",
  subsets: ["latin", "vietnamese"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Công Thức Nấu Ăn — Quản lý & Chia sẻ công thức ngon",
  description:
    "Website quản lý và chia sẻ công thức nấu ăn: tìm món theo danh mục, lưu công thức yêu thích và chia sẻ với cộng đồng.",
};

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  // Danh mục thật từ DB; nếu DB chưa kết nối thì dùng danh sách slug cố định
  // để thanh điều hướng vẫn hoạt động.
  const dbCategories = await listCategories();
  const categories =
    dbCategories.length > 0
      ? dbCategories.map((c) => ({ name: c.name, slug: c.slug }))
      : FALLBACK_CATEGORIES.map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <html
      lang="vi"
      className={`${openSans.variable} ${lobster.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader categories={categories} />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter categories={categories} />
      </body>
    </html>
  );
}
