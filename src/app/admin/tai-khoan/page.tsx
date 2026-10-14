import { AccountList } from "@/components/admin/accounts/account-list";
import { requireAccountAdminPage } from "@/lib/account-admin-auth";
import { listAccounts } from "@/services/account-admin-service";

export default async function AccountAdminPage() {
  await requireAccountAdminPage();
  const initial = await listAccounts("", 1);

  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-wider text-brand">Khu vực quản trị</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">Quản lý tài khoản</h1>
        <p className="mt-2 text-sm text-zinc-600">Tìm kiếm, xem vai trò và quản lý trạng thái tài khoản.</p>
      </div>
      <AccountList initial={initial} />
    </section>
  );
}
