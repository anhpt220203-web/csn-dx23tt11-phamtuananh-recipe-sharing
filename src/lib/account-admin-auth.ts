import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export class AccountAuthorizationError extends Error {
  constructor(public readonly status: 401 | 403) {
    super(status === 401 ? "Vui lòng đăng nhập." : "Bạn không có quyền thực hiện thao tác này.");
    this.name = "AccountAuthorizationError";
  }
}

export async function getSignedInAccount() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function requireAccountAdmin() {
  const user = await getSignedInAccount();
  if (!user) throw new AccountAuthorizationError(401);
  if (user.role !== "admin") throw new AccountAuthorizationError(403);
  return user;
}

export async function requireAccountAdminPage() {
  const user = await getSignedInAccount();
  if (!user) redirect("/dang-nhap?next=%2Fadmin%2Ftai-khoan");
  if (user.role !== "admin") redirect("/");
  return user;
}
