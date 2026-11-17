"use client";

import { Loader2, LogOut, Trash2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "./api";
import Confirm from "./Confirm";
import PasswordStrength from "./PasswordStrength";

interface AdminRow { _id: string; name: string; email: string; role: string; lastLoginAt?: string; createdAt?: string }

export default function AdminsManager({ meId }: { meId: string }) {
  const [rows, setRows] = useState<AdminRow[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState("");
  const [del, setDel] = useState<AdminRow | null>(null);

  const load = useCallback(() => {
    api<AdminRow[]>("/api/admins").then(setRows).catch((e) => toast.error(e.message));
  }, []);
  useEffect(load, [load]);

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    try {
      await api("/api/admins", { method: "POST", body: Object.fromEntries(fd) });
      toast.success("Admin created");
      form.reset();
      setPw("");
      load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const patch = async (id: string, body: object, msg: string) => {
    try {
      await api(`/api/admins/${id}`, { method: "PATCH", body });
      toast.success(msg);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admins</h1>
        <p className="mt-1 text-sm text-soft">Who can sign in to this dashboard. Only the super admin sees this page.</p>
      </div>

      <div className="panel divide-y overflow-hidden">
        {!rows ? (
          <Loader2 className="m-8 mx-auto h-6 w-6 animate-spin text-muted" />
        ) : (
          rows.map((a) => (
            <div key={a._id} className="flex flex-wrap items-center gap-3 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-elev font-semibold">{a.name.slice(0, 1)}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{a.name} {a._id === meId && <span className="text-xs text-muted">(you)</span>}</p>
                <p className="truncate text-xs text-muted">{a.email} · last login {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : "never"}</p>
              </div>
              {a._id === meId ? (
                <span className="chip">{a.role}</span>
              ) : (
                <>
                  <select defaultValue={a.role} onChange={(e) => patch(a._id, { role: e.target.value }, "Role updated")} className="rounded-lg border bg-bg px-2 py-1.5 text-sm">
                    <option value="admin">admin</option>
                    <option value="superadmin">superadmin</option>
                  </select>
                  <button onClick={() => patch(a._id, { revoke: true }, "Sessions revoked")} title="Revoke sessions" className="grid h-9 w-9 place-items-center rounded-lg border text-soft hover:text-fg"><LogOut className="h-4 w-4" /></button>
                  <button onClick={() => setDel(a)} title="Delete" className="grid h-9 w-9 place-items-center rounded-lg border text-soft hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={create} className="panel grid gap-4 p-5 sm:grid-cols-2 sm:p-8">
        <h2 className="flex items-center gap-2 font-semibold sm:col-span-2"><UserPlus className="h-4 w-4 text-accent" /> Add an admin</h2>
        <label><span className="label">Name</span><input name="name" required minLength={2} className="field" /></label>
        <label><span className="label">Email</span><input name="email" type="email" required className="field" /></label>
        <label>
          <span className="label">Temporary password</span>
          <input name="password" type="password" required minLength={10} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" className="field" />
          <PasswordStrength value={pw} />
        </label>
        <label>
          <span className="label">Role</span>
          <select name="role" className="field"><option value="admin">admin</option><option value="superadmin">superadmin</option></select>
        </label>
        <div className="sm:col-span-2"><button disabled={busy} className="btn-accent">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Create admin</button></div>
      </form>

      {del && (
        <Confirm
          title={`Remove ${del.name}?`}
          body="They lose access immediately."
          confirmLabel="Remove"
          onConfirm={async () => {
            try {
              await api(`/api/admins/${del._id}`, { method: "DELETE" });
              toast.success("Admin removed");
              load();
            } catch (e) {
              toast.error((e as Error).message);
            }
            setDel(null);
          }}
          onClose={() => setDel(null)}
        />
      )}
    </div>
  );
}
