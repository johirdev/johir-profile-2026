import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import AdminShell from "@/components/admin/AdminShell";
import { SESSION_COOKIE, getSession } from "@/server/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const daysUntil = (exp?: number) => (exp ? Math.max(0, Math.ceil((exp * 1000 - Date.now()) / 86_400_000)) : null);

/** Every page under /admin (except login/register) requires a valid 7-day session. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const exp = token ? (jwt.decode(token) as { exp?: number } | null)?.exp : undefined;
  return (
    <AdminShell session={session} daysLeft={daysUntil(exp)}>
      {children}
    </AdminShell>
  );
}
