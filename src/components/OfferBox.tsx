"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function OfferBox({
  listingId,
  priceRub,
}: {
  listingId: string;
  priceRub: number;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(String(Math.round(priceRub * 0.9)));
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) {
      router.push("/auth/login");
      return;
    }
    setBusy(true);
    setStatus("");
    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        offeredPriceRub: Number(price),
        quantity: qty,
        message: message || undefined,
      }),
    });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) {
      setStatus(d.error ?? "Ошибка");
      return;
    }
    setStatus("Предложение отправлено поставщику.");
    setOpen(false);
  }

  return (
    <div className="card p-4">
      {!open ? (
        <button onClick={() => setOpen(true)} className="btn btn-outline w-full">
          💬 Предложить свою цену
        </button>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="text-sm font-medium text-white">Предложить цену</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input"
              placeholder="Цена за ед., ₽"
            />
            <span className="text-slate-400">×</span>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              className="input !w-20"
            />
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Комментарий (необязательно)"
            rows={2}
            className="input"
          />
          <div className="flex gap-2">
            <button disabled={busy} className="btn btn-primary flex-1">
              {busy ? "…" : "Отправить"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-outline">
              Отмена
            </button>
          </div>
        </form>
      )}
      {status && <p className="mt-2 text-sm text-slate-300">{status}</p>}
    </div>
  );
}
