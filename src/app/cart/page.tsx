"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  useTonConnectUI,
  useTonAddress,
  TonConnectButton,
} from "@tonconnect/ui-react";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress();
  const { items, setQty, remove, clear } = useCart();
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const total = items.reduce((s, i) => s + i.priceRub * i.qty, 0);

  // группировка по поставщикам
  const groups = Object.entries(
    items.reduce<Record<string, { name: string | null; items: typeof items }>>(
      (acc, it) => {
        (acc[it.supplierId] ??= { name: it.supplierName, items: [] }).items.push(it);
        return acc;
      },
      {}
    )
  );

  async function paySupplier(supplierId: string, supItems: typeof items) {
    if (!session?.user) {
      router.push("/auth/login");
      return;
    }
    if (!walletAddress) {
      setStatus("Сначала подключите кошелёк кнопкой выше.");
      tonConnectUI.openModal();
      return;
    }
    setBusy(supplierId);
    setStatus("");
    try {
      // 1. создаём сделки по позициям поставщика
      const res = await fetch("/api/deals/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: supItems.map((i) => ({ listingId: i.listingId, quantity: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка");

      // 2. одна транзакция на кошелёк поставщика
      const nano = Math.round(data.totalTon * 1e9).toString();
      setStatus("Подтвердите перевод в кошельке…");
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: data.sellerWallet, amount: nano }],
      });

      // 3. отмечаем все сделки оплаченными
      await fetch("/api/deals/batch/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealIds: data.dealIds, txHash: result.boc }),
      });

      // убираем оплаченные позиции из корзины
      supItems.forEach((i) => remove(i.listingId));
      setStatus("Оплачено! Сделки в разделе «Мои сделки».");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Платёж отменён");
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Корзина пуста</h1>
        <Link href="/catalog/products" className="btn btn-primary mt-6 inline-flex">
          В каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Корзина</h1>
      <p className="mt-1 text-sm text-slate-400">
        Позиции одного поставщика оплачиваются <b>одной TON-транзакцией</b>. Разные
        поставщики — отдельные платежи.
      </p>

      <div className="mt-4">
        <TonConnectButton />
      </div>

      <div className="mt-6 space-y-6">
        {groups.map(([supplierId, g]) => {
          const groupTotal = g.items.reduce((s, i) => s + i.priceRub * i.qty, 0);
          return (
            <div key={supplierId} className="card p-4">
              <div className="text-sm text-slate-400 mb-3">
                Поставщик: <span className="text-white">{g.name ?? "—"}</span>
              </div>
              <div className="divide-y divide-white/10">
                {g.items.map((it) => (
                  <div key={it.listingId} className="flex items-center gap-3 py-3">
                    <div className="h-14 w-14 rounded-md bg-white/5 overflow-hidden flex items-center justify-center text-slate-500 text-xs shrink-0">
                      {it.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        "—"
                      )}
                    </div>
                    <Link href={`/listing/${it.listingId}`} className="flex-1 text-white hover:underline">
                      {it.title}
                    </Link>
                    <input
                      type="number"
                      min={1}
                      value={it.qty}
                      onChange={(e) => setQty(it.listingId, Number(e.target.value))}
                      className="input !w-20"
                    />
                    <div className="w-28 text-right text-white">
                      {(it.priceRub * it.qty).toLocaleString("ru-RU")} ₽
                    </div>
                    <button onClick={() => remove(it.listingId)} className="text-slate-500 hover:text-red-400 px-2">
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-white">
                  К оплате: <span className="font-semibold">{groupTotal.toLocaleString("ru-RU")} ₽</span>
                </div>
                <button
                  onClick={() => paySupplier(supplierId, g.items)}
                  disabled={busy === supplierId}
                  className="btn btn-primary"
                >
                  {busy === supplierId ? "Обработка…" : "Оплатить в TON"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {status && <p className="mt-4 text-sm text-slate-300">{status}</p>}

      <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
        <div className="text-lg text-white">
          Всего: <span className="font-bold text-gradient">{total.toLocaleString("ru-RU")} ₽</span>
        </div>
        <button onClick={clear} className="btn btn-outline">Очистить корзину</button>
      </div>
    </div>
  );
}
