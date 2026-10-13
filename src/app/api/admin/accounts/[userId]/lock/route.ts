import { NextResponse } from "next/server";
import { AccountAuthorizationError, requireAccountAdmin } from "@/lib/account-admin-auth";
import { AccountAdminServiceError, setAccountLocked } from "@/services/account-admin-service";

export async function POST(_request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    await requireAccountAdmin();
    const { userId } = await context.params;
    return NextResponse.json(await setAccountLocked(userId, true));
  } catch (error) {
    if (error instanceof AccountAuthorizationError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    if (error instanceof AccountAdminServiceError) {
      const status = error.code === "NOT_FOUND" ? 404 : error.code === "LAST_ADMIN" ? 409 : 409;
      return NextResponse.json({ message: error.message }, { status });
    }
    return NextResponse.json({ message: "Không thể khóa tài khoản." }, { status: 500 });
  }
}
