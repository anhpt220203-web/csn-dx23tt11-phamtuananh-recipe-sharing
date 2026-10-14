import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 25;

export class AccountAdminServiceError extends Error {
  constructor(
    public readonly code: "NOT_FOUND" | "LAST_ADMIN" | "ADMIN_ACCOUNT" | "CONFLICT",
    message: string,
  ) {
    super(message);
    this.name = "AccountAdminServiceError";
  }
}

export async function listAccounts(search: string, page: number) {
  const q = search.trim();
  const where: Prisma.userWhereInput = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
    : {};

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, name: true, email: true, role: true, banned: true, createdAt: true },
    }),
  ]);

  return {
    accounts: rows.map(({ banned, ...row }) => ({ ...row, status: banned ? "locked" as const : "active" as const })),
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function setAccountLocked(userId: string, locked: boolean) {
  try {
    return await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id: userId }, select: { id: true, role: true, banned: true } });
      if (!target) throw new AccountAdminServiceError("NOT_FOUND", "Không tìm thấy tài khoản.");

      if (locked && target.role === "admin" && !target.banned) {
        const activeAdmins = await tx.user.count({ where: { role: "admin", banned: false } });
        if (activeAdmins <= 1) {
          throw new AccountAdminServiceError("LAST_ADMIN", "Không thể khóa quản trị viên hoạt động cuối cùng.");
        }
        throw new AccountAdminServiceError("ADMIN_ACCOUNT", "Không thể khóa tài khoản quản trị viên.");
      }

      await tx.user.update({
        where: { id: userId },
        data: { banned: locked, banReason: locked ? "Đã khóa bởi quản trị viên" : null, banExpires: null },
      });
      if (locked) await tx.session.deleteMany({ where: { userId } });
      return { id: userId, status: locked ? "locked" : "active" };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof AccountAdminServiceError) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      throw new AccountAdminServiceError("CONFLICT", "Dữ liệu vừa thay đổi. Vui lòng tải lại và thử lại.");
    }
    throw error;
  }
}
