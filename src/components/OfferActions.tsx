"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OfferActions({
  offerId,
  role,
}: {
  offerId: string;
  role: "seller" | "buyer";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function respond(action: "accept" | "decline") {
    setBusy(true);
    const res = await fetch(`/api/offers/${offerId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Ошибка");
      return;
    }
    router.refresh();
  }

  async function cancel() {
    setBusy(true);
    await fetch(`/api/offers/${offerId}/cancel`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  if (role === "seller") {
    return (
      <div className="flex gap-2">
        <button onClick={() => respond("accept")} disabled={busy} className="btn btn-primary">
          Принять
        </button>
        <button onClick={() => respond("decline")} disabled={busy} className="btn btn-outline">
          Отклонить
        </button>
      </div>
    );
  }
  return (
    <button onClick={cancel} disabled={busy} className="btn btn-outline">
      Отозвать
    </button>
  );
}
