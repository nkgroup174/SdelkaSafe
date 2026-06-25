"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResolveButton({ url, label = "Решено" }: { url: string; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    await fetch(url, { method: "PATCH" });
    setBusy(false);
    router.refresh();
  }
  return (
    <button onClick={go} disabled={busy} className="btn btn-outline">
      {busy ? "…" : label}
    </button>
  );
}
