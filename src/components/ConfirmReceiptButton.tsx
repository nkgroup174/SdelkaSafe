"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConfirmReceiptButton({ dealId }: { dealId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    await fetch(`/api/deals/${dealId}/complete`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={confirm}
      disabled={busy}
      className="rounded-md bg-emerald-600 text-white px-3 py-1.5 text-sm hover:bg-emerald-700 disabled:opacity-50"
    >
      {busy ? "…" : "Подтвердить получение"}
    </button>
  );
}
