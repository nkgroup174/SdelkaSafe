"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OpenDisputeButton({ dealId }: { dealId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function open() {
    const reason = prompt("Опишите проблему по сделке:");
    if (!reason || reason.trim().length < 3) return;
    setBusy(true);
    const res = await fetch(`/api/deals/${dealId}/dispute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason.trim() }),
    });
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
      onClick={open}
      disabled={busy}
      className="rounded-md border border-amber-200 px-3 py-1.5 text-sm text-amber-300 hover:bg-amber-50 disabled:opacity-50"
    >
      Открыть спор
    </button>
  );
}

export function ResolveDisputeButtons({ dealId }: { dealId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function resolve(resolution: "complete" | "cancel") {
    setBusy(true);
    await fetch(`/api/admin/deals/${dealId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution }),
    });
    setBusy(false);
    router.refresh();
  }
  return (
    <div className="flex gap-2">
      <button onClick={() => resolve("complete")} disabled={busy} className="btn btn-primary">
        В пользу поставщика
      </button>
      <button onClick={() => resolve("cancel")} disabled={busy} className="btn btn-outline">
        Отменить сделку
      </button>
    </div>
  );
}
