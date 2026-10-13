import { NextResponse } from "next/server";
import { AccountAuthorizationError, requireAccountAdmin } from "@/lib/account-admin-auth";
import { AccountAdminServiceError, setAccountLocked } from "@/services/account-admin-service";

export async function POST(_request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    await requireAccountAdmin();
    const { userId } = await context.params;
    return NextResponse.json(await setAccountLocked(userId, false));
  } catch (error) {
    if (error instanceof AccountAuthorizationError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    if (error instanceof AccountAdminServiceError) {
      return NextResponse.json({ message: error.message }, { status: error.code === "NOT_FOUND" ? 404 : 409 });
    }
    return NextResponse.json({ message: "Không thể mở khóa tài khoản." }, { status: 500 });
  }
}
