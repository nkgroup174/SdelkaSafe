"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PromoRowActions({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    await fetch(`/api/admin/promo/${id}`, { method: "PATCH" });
    setBusy(false);
    router.refresh();
  }
  async function remove() {
    if (!confirm("Удалить промокод?")) return;
    setBusy(true);
    await fetch(`/api/admin/promo/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2 text-sm">
      <button onClick={toggle} disabled={busy} className="btn btn-outline">
        {isActive ? "Выключить" : "Включить"}
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className="rounded-md border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Удалить
      </button>
    </div>
  );
}
