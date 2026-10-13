import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const params = await searchParams;
  const next = typeof params.next === "string" && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/";
  return (
    <section className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-10 sm:py-16">
      <div className="w-full rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-sm font-bold uppercase tracking-wider text-brand">Chào mừng trở lại</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">Đăng nhập</h1>
        <p className="mt-2 text-sm text-zinc-600">Đăng nhập để tiếp tục sử dụng tài khoản.</p>
        <LoginForm next={next} />
        <p className="mt-6 text-center text-sm text-zinc-600">
          Chưa có tài khoản? <Link className="font-bold text-brand hover:underline" href="/dang-ky">Đăng ký</Link>
        </p>
      </div>
    </section>
  );
}
