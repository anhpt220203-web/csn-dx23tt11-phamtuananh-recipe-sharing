"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    if (!/^\S+@\S+\.\S+$/.test(email) || !password) {
      setError("Vui lòng nhập email hợp lệ và mật khẩu.");
      return;
    }
    setBusy(true);
    let result;
    try {
      result = await authClient.signIn.email({ email, password });
    } catch {
      setError("Không thể kết nối để đăng nhập. Vui lòng thử lại.");
      setBusy(false);
      return;
    }
    setBusy(false);
    if (result.error) {
      const message = result.error.message?.toLowerCase() ?? "";
      setError(message.includes("ban") || message.includes("lock") ? "Tài khoản đang bị khóa. Vui lòng liên hệ quản trị viên." : "Email hoặc mật khẩu không chính xác.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form noValidate onSubmit={submit} className="mt-7 space-y-4">
      <label className="block text-sm font-semibold text-zinc-700">Email
        <input name="email" type="email" required autoComplete="email" className="mt-1.5 h-11 w-full rounded-lg border border-zinc-300 px-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
      </label>
      <label className="block text-sm font-semibold text-zinc-700">Mật khẩu
        <input name="password" type="password" required autoComplete="current-password" className="mt-1.5 h-11 w-full rounded-lg border border-zinc-300 px-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
      </label>
      {error ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <button disabled={busy} className="h-11 w-full rounded-lg bg-brand px-4 font-bold text-white transition hover:bg-brand-dark disabled:opacity-60">
        {busy ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
    </form>
  );
}
