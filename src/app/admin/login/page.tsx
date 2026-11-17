import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import AuthCard from "@/components/admin/AuthCard";
import LoginForm from "@/components/admin/LoginForm";
import { getSession } from "@/server/auth";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to manage your portfolio. Sessions last 7 days."
      footer={
        <>
          Have an invite key? <Link href="/admin/register" className="font-medium text-fg underline-offset-4 hover:underline">Create an account</Link>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
