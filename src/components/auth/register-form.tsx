"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const errors: typeof fieldErrors = {};
    if (!name) errors.name = "Vui lòng nhập họ và tên.";
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Vui lòng nhập email hợp lệ.";
    if (password.length < 8) errors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setBusy(true);
    let result;
    try {
      result = await authClient.signUp.email({ name, email, password });
    } catch {
      setError("Không thể kết nối để tạo tài khoản. Vui lòng thử lại.");
      setBusy(false);
      return;
    }
    setBusy(false);
    if (result.error) {
      const message = result.error.message?.toLowerCase() ?? "";
      setError(message.includes("already") || message.includes("exist") ? "Email này đã được đăng ký." : "Không thể tạo tài khoản. Vui lòng kiểm tra thông tin.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form noValidate onSubmit={submit} className="mt-7 space-y-4">
      <label className="block text-sm font-semibold text-zinc-700">Họ và tên
        <input name="name" required autoComplete="name" maxLength={80} aria-invalid={Boolean(fieldErrors.name)} className="mt-1.5 h-11 w-full rounded-lg border border-zinc-300 px-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
        {fieldErrors.name ? <span className="mt-1 block text-xs font-normal text-red-700">{fieldErrors.name}</span> : null}
      </label>
      <label className="block text-sm font-semibold text-zinc-700">Email
        <input name="email" type="email" required autoComplete="email" aria-invalid={Boolean(fieldErrors.email)} className="mt-1.5 h-11 w-full rounded-lg border border-zinc-300 px-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
        {fieldErrors.email ? <span className="mt-1 block text-xs font-normal text-red-700">{fieldErrors.email}</span> : null}
      </label>
      <label className="block text-sm font-semibold text-zinc-700">Mật khẩu
        <input name="password" type="password" required minLength={8} autoComplete="new-password" aria-invalid={Boolean(fieldErrors.password)} className="mt-1.5 h-11 w-full rounded-lg border border-zinc-300 px-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
        <span className="mt-1 block text-xs font-normal text-zinc-500">Tối thiểu 8 ký tự.</span>
        {fieldErrors.password ? <span className="mt-1 block text-xs font-normal text-red-700">{fieldErrors.password}</span> : null}
      </label>
      {error ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <button disabled={busy} className="h-11 w-full rounded-lg bg-brand px-4 font-bold text-white transition hover:bg-brand-dark disabled:opacity-60">
        {busy ? "Đang tạo tài khoản…" : "Đăng ký"}
      </button>
    </form>
  );
}
