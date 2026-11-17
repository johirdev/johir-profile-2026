"use client";

import { useRouter } from "next/navigation";
import { KeyRound, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "./api";
import PasswordStrength from "./PasswordStrength";

export default function AccountForms({ name, email, role }: { name: string; email: string; role: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState("");

  const change = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("next") !== fd.get("confirm")) {
      toast.error("New passwords don't match");
      return;
    }
    setBusy(true);
    try {
      await api("/api/auth/password", { method: "POST", body: { current: fd.get("current"), next: fd.get("next") } });
      toast.success("Password changed — other sessions were signed out");
      form.reset();
      setPw("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const everywhere = async () => {
    await fetch("/api/auth/logout?everywhere=1", { method: "POST" });
    toast.success("Signed out of every device");
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Account & security</h1>
        <p className="mt-1 text-sm text-soft">Your session is a signed token that expires 7 days after sign-in.</p>
      </div>
      <div className="panel flex flex-wrap items-center gap-4 p-5">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-fg text-lg font-bold text-bg">{name.slice(0, 1)}</span>
        <div className="flex-1">
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted">{email}</p>
        </div>
        <span className="chip"><ShieldCheck className="h-3.5 w-3.5 text-accent" /> {role}</span>
      </div>

      <form onSubmit={change} className="panel grid gap-4 p-5 sm:grid-cols-2 sm:p-8">
        <h2 className="flex items-center gap-2 font-semibold sm:col-span-2"><KeyRound className="h-4 w-4 text-accent" /> Change password</h2>
        <label className="sm:col-span-2">
          <span className="label">Current password</span>
          <input name="current" type="password" required autoComplete="current-password" className="field" />
        </label>
        <label>
          <span className="label">New password</span>
          <input name="next" type="password" required minLength={10} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className="field" />
          <PasswordStrength value={pw} />
        </label>
        <label>
          <span className="label">Confirm new password</span>
          <input name="confirm" type="password" required autoComplete="new-password" className="field" />
        </label>
        <div className="sm:col-span-2">
          <button disabled={busy} className="btn-accent">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Update password</button>
        </div>
      </form>

      <div className="panel flex flex-wrap items-center justify-between gap-4 p-5 sm:p-8">
        <div>
          <h2 className="font-semibold">Sign out everywhere</h2>
          <p className="text-sm text-soft">Instantly revokes every active session, including this one.</p>
        </div>
        <button onClick={everywhere} className="btn-ghost hover:!border-red-500/50 hover:text-red-500"><LogOut className="h-4 w-4" /> Sign out all devices</button>
      </div>
    </div>
  );
}
