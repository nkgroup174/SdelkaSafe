"use client";

import { useState } from "react";

export function ReportButton({ listingId }: { listingId: string }) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function report() {
    const reason = prompt("Причина жалобы на объявление:");
    if (!reason || reason.trim().length < 3) return;
    setBusy(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, reason: reason.trim() }),
    });
    setBusy(false);
    if (res.ok) setDone(true);
    else {
      const d = await res.json();
      alert(d.error ?? "Ошибка");
    }
  }

  if (done) return <span className="text-xs text-slate-500">Жалоба отправлена</span>;

  return (
    <button onClick={report} disabled={busy} className="text-xs text-slate-500 hover:text-red-400">
      Пожаловаться
    </button>
  );
}
