"use client";

import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { api } from "./api";
import PasswordStrength from "./PasswordStrength";

export default function RegisterForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pw, setPw] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("password") !== fd.get("confirm")) {
      setError("Passwords don't match");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: { name: fd.get("name"), email: fd.get("email"), password: fd.get("password"), inviteKey: fd.get("inviteKey") },
      });
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label>
        <span className="label">Full name</span>
        <input name="name" required minLength={2} maxLength={80} autoComplete="name" className="field" />
      </label>
      <label>
        <span className="label">Email</span>
        <input name="email" type="email" required autoComplete="email" className="field" />
      </label>
      <label>
        <span className="label">Password</span>
        <input name="password" type="password" required minLength={10} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className="field" />
        <PasswordStrength value={pw} />
      </label>
      <label>
        <span className="label">Confirm password</span>
        <input name="confirm" type="password" required autoComplete="new-password" className="field" />
      </label>
      <label>
        <span className="label">Invite key</span>
        <input name="inviteKey" type="password" required autoComplete="off" className="field" />
      </label>
      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}
      <button disabled={busy} className="btn-accent mt-2">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Create account
      </button>
    </form>
  );
}
