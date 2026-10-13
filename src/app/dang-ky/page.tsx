import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-10 sm:py-16">
      <div className="w-full rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-sm font-bold uppercase tracking-wider text-brand">Tham gia cộng đồng</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">Tạo tài khoản</h1>
        <p className="mt-2 text-sm text-zinc-600">Lưu lại những công thức bạn yêu thích.</p>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-zinc-600">
          Đã có tài khoản? <Link className="font-bold text-brand hover:underline" href="/dang-nhap">Đăng nhập</Link>
        </p>
      </div>
    </section>
  );
}
