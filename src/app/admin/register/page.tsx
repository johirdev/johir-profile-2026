import type { Metadata } from "next";
import Link from "next/link";
import AuthCard from "@/components/admin/AuthCard";
import RegisterForm from "@/components/admin/RegisterForm";

export const metadata: Metadata = { title: "Create admin account", robots: { index: false, follow: false } };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create an admin account"
      subtitle="Registration is invite-only — you need the invite key from the site owner."
      footer={
        <>
          Already have an account? <Link href="/admin/login" className="font-medium text-fg underline-offset-4 hover:underline">Sign in</Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
