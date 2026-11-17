"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

/** In-page confirmation (no blocking window.confirm). */
export default function Confirm({
  title,
  body,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
}: {
  title: string;
  body?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()} className="panel w-full max-w-sm p-6 shadow-2xl">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-500/10 text-red-500">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        {body && <p className="mt-1 text-sm text-soft">{body}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost !py-2">Cancel</button>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
            className="btn !bg-red-600 !py-2 text-white hover:!bg-red-700"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
