import { redirect } from "next/navigation";
import AdminsManager from "@/components/admin/AdminsManager";
import { getSession } from "@/server/auth";

export default async function AdminsPage() {
  const session = await getSession();
  if (session?.role !== "superadmin") redirect("/admin");
  return <AdminsManager meId={session.id} />;
}
