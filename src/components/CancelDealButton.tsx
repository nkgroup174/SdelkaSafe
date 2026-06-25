"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelDealButton({ dealId }: { dealId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function cancel() {
    if (!confirm("Отменить сделку?")) return;
    setBusy(true);
    const res = await fetch(`/api/deals/${dealId}/cancel`, { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Ошибка");
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={cancel}
      disabled={busy}
      className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50"
    >
      Отменить
    </button>
  );
}
