"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RemoveCompareButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function remove() {
    setBusy(true);
    await fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    setBusy(false);
    router.refresh();
  }
  return (
    <button
      onClick={remove}
      disabled={busy}
      className="text-xs text-slate-400 hover:text-red-400"
    >
      убрать
    </button>
  );
}
