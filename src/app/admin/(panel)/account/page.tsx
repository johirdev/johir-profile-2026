import AccountForms from "@/components/admin/AccountForms";
import { getSession } from "@/server/auth";

export default async function AccountPage() {
  const session = await getSession();
  return <AccountForms name={session?.name ?? ""} email={session?.email ?? ""} role={session?.role ?? "admin"} />;
}
