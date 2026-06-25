"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  useTonConnectUI,
  useTonAddress,
  TonConnectButton,
} from "@tonconnect/ui-react";

type Props = {
  listingId: string;
  priceRub: number;
  sellerWallet: string | null;
  outOfStock?: boolean;
  oldPriceRub?: number | null;
};

export function BuyBox({ listingId, priceRub, sellerWallet, outOfStock, oldPriceRub }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress();
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");

  const base = priceRub * qty;
  const total = Math.max(0, base - discount);

  async function applyPromo() {
    if (!promo.trim()) return;
    setPromoMsg("Проверяем…");
    const res = await fetch(
      `/api/promo/validate?code=${encodeURIComponent(promo)}&amountRub=${base}`
    );
    const data = await res.json();
    if (data.valid) {
      setDiscount(data.discountRub);
      setPromoMsg(`Скидка ${data.discountRub.toLocaleString("ru-RU")} ₽`);
    } else {
      setDiscount(0);
      setPromoMsg(data.reason ?? "Промокод не применён");
    }
  }

  async function buy() {
    if (!session?.user) {
      router.push("/auth/login");
      return;
    }
    if (!sellerWallet) {
      setStatus("У поставщика не указан TON-кошелёк — оплата недоступна.");
      return;
    }
    if (!walletAddress) {
      setStatus("Сначала подключите кошелёк кнопкой выше.");
      tonConnectUI.openModal();
      return;
    }

    setBusy(true);
    setStatus("Создаём сделку…");
    try {
      // 1. Создаём сделку — сервер считает сумму в TON по актуальному курсу
      const dealRes = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          quantity: qty,
          promoCode: promo.trim() || undefined,
        }),
      });
      const dealData = await dealRes.json();
      if (!dealRes.ok) throw new Error(dealData.error ?? "Ошибка сделки");
      const { deal } = dealData;

      // 2. Платёж напрямую поставщику через TON Connect (не-кастодиально)
      const nano = Math.round(deal.amountTon * 1e9).toString();
      setStatus("Подтвердите перевод в кошельке…");
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: deal.sellerWallet, amount: nano }],
      });

      // 3. Фиксируем оплату. result.boc — подтверждение из кошелька (для MVP как txHash).
      setStatus("Фиксируем оплату…");
      await fetch(`/api/deals/${deal.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: result.boc }),
      });

      setStatus("Оплачено! Сделка создана. Подтвердите получение в разделе «Мои сделки».");
      router.push("/dashboard/deals");
      router.refresh();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Платёж отменён");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 p-5">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-slate-900">
          {total.toLocaleString("ru-RU")} ₽
        </span>
        {oldPriceRub && oldPriceRub > priceRub && (
          <>
            <span className="text-sm text-slate-500 line-through">
              {(oldPriceRub * qty).toLocaleString("ru-RU")} ₽
            </span>
            <span className="rounded bg-red-500 px-1.5 py-0.5 text-xs font-semibold text-white">
              −{Math.round((1 - priceRub / oldPriceRub) * 100)}%
            </span>
          </>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Оплата в TON по курсу на момент сделки. Купить TON за рубли можно в Telegram Wallet.
      </p>

      <div className="mt-4">
        <TonConnectButton />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm text-slate-600">Кол-во</label>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="w-20 rounded-md border border-slate-300 px-2 py-1"
        />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={promo}
          onChange={(e) => setPromo(e.target.value)}
          placeholder="Промокод"
          className="input"
        />
        <button type="button" onClick={applyPromo} className="btn btn-outline">
          Применить
        </button>
      </div>
      {promoMsg && <p className="mt-2 text-sm text-slate-300">{promoMsg}</p>}
      {discount > 0 && (
        <p className="mt-1 text-sm text-emerald-400">
          Скидка: −{discount.toLocaleString("ru-RU")} ₽
        </p>
      )}

      <button
        onClick={buy}
        disabled={busy || outOfStock}
        className="mt-4 w-full rounded-md bg-slate-900 text-white py-2.5 hover:bg-slate-800 disabled:opacity-50"
      >
        {outOfStock ? "Нет в наличии" : busy ? "Обработка…" : "Оформить и оплатить в TON"}
      </button>

      {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
    </div>
  );
}
