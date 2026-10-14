import { NextResponse } from "next/server";
import { AccountAuthorizationError, requireAccountAdmin } from "@/lib/account-admin-auth";
import { listAccounts } from "@/services/account-admin-service";

export async function GET(request: Request) {
  try {
    await requireAccountAdmin();
    const url = new URL(request.url);
    const rawPage = Number(url.searchParams.get("page") ?? 1);
    if (!Number.isInteger(rawPage) || rawPage < 1) {
      return NextResponse.json({ message: "Số trang không hợp lệ." }, { status: 400 });
    }
    const result = await listAccounts((url.searchParams.get("q") ?? "").slice(0, 100), rawPage);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof AccountAuthorizationError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Không thể tải danh sách tài khoản." }, { status: 500 });
  }
}
