"use client";

import { useState, type FormEvent } from "react";

type Account = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "locked";
  createdAt: string | Date;
};

type AccountResult = {
  accounts: Account[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function AccountList({ initial }: { initial: AccountResult }) {
  const [result, setResult] = useState(initial);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load(nextPage = 1, nextQuery = query) {
    setLoading(true);
    setMessage("");
    try {
      const params = new URLSearchParams({ page: String(nextPage), q: nextQuery });
      const response = await fetch(`/api/admin/accounts?${params}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "Không thể tải danh sách tài khoản.");
      setResult(body as AccountResult);
      setPage(nextPage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể tải danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  }

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await load(1, query.trim());
  }

  async function toggle(account: Account) {
    const lock = account.status === "active";
    const action = lock ? "khóa" : "mở khóa";
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản ${account.email}?`)) return;
    setBusyId(account.id);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/accounts/${encodeURIComponent(account.id)}/${lock ? "lock" : "unlock"}`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? `Không thể ${action} tài khoản.`);
      setResult((current) => ({ ...current, accounts: current.accounts.map((row) => row.id === account.id ? { ...row, status: body.status } : row) }));
      setMessage(`Đã ${action} tài khoản ${account.email}.`);
    } catch (error) {
      const failureMessage = error instanceof Error ? error.message : `Không thể ${action} tài khoản.`;
      await load(page, query);
      setMessage(failureMessage);
    } finally {
      setBusyId("");
    }
  }

  return (
    <div>
      <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="account-search" className="sr-only">Tìm theo tên hoặc email</label>
        <input id="account-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên hoặc email" className="h-11 min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
        <button disabled={loading} className="h-11 rounded-lg bg-brand px-5 font-bold text-white hover:bg-brand-dark disabled:opacity-60">Tìm kiếm</button>
      </form>
      {message ? <p role="status" className="mt-4 rounded-lg bg-cream px-4 py-3 text-sm text-ink">{message}</p> : null}
      <div className="mt-5 flex items-center justify-between text-sm text-zinc-600"><span>{result.total} tài khoản</span>{loading ? <span>Đang tải…</span> : null}</div>

      {result.accounts.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-300 px-4 py-12 text-center text-zinc-600">Không tìm thấy tài khoản phù hợp.</div>
      ) : (
        <div className="mt-3 space-y-3">
          {result.accounts.map((account) => (
            <article key={account.id} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0">
                <p className="break-words font-bold text-ink">{account.name}</p>
                <p className="break-all text-sm text-zinc-600">{account.email}</p>
                <p className="mt-1 text-xs text-zinc-500">Vai trò: {account.role === "admin" ? "Quản trị viên" : "Người dùng"} · Tạo ngày {new Date(account.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${account.status === "locked" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                  {account.status === "locked" ? "Đã khóa" : "Đang hoạt động"}
                </span>
                {account.status === "locked" || account.role !== "admin" ? (
                  <button type="button" disabled={busyId === account.id} onClick={() => void toggle(account)} className={`min-h-10 rounded-lg px-3 text-sm font-bold disabled:opacity-50 ${account.status === "locked" ? "border border-zinc-300 text-ink hover:bg-zinc-50" : "bg-red-50 text-red-700 hover:bg-red-100"}`}>
                    {busyId === account.id ? "Đang xử lý…" : account.status === "locked" ? "Mở khóa" : "Khóa tài khoản"}
                  </button>
                ) : <span className="text-xs text-zinc-500">Tài khoản quản trị</span>}
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" disabled={page <= 1 || loading} onClick={() => void load(page - 1)} className="min-h-10 rounded-lg border border-zinc-300 px-4 text-sm font-semibold disabled:opacity-40">Trang trước</button>
        <span className="text-sm text-zinc-600">Trang {result.page} / {Math.max(result.totalPages, 1)}</span>
        <button type="button" disabled={page >= result.totalPages || loading} onClick={() => void load(page + 1)} className="min-h-10 rounded-lg border border-zinc-300 px-4 text-sm font-semibold disabled:opacity-40">Trang sau</button>
      </div>
    </div>
  );
}
