"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useTonConnectUI,
  useTonAddress,
  TonConnectButton,
} from "@tonconnect/ui-react";

export function TopUpBox() {
  const router = useRouter();
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress();
  const [amount, setAmount] = useState("1000");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function topup() {
    const amountRub = Number(amount);
    if (!amountRub || amountRub <= 0) {
      setStatus("Введите сумму пополнения.");
      return;
    }
    if (!walletAddress) {
      setStatus("Сначала подключите кошелёк.");
      tonConnectUI.openModal();
      return;
    }

    setBusy(true);
    try {
      setStatus("Считаем сумму в TON…");
      const q = await fetch(`/api/balance/quote?amountRub=${amountRub}`);
      const quote = await q.json();
      if (!q.ok) throw new Error(quote.error ?? "Ошибка");

      const nano = Math.round(quote.amountTon * 1e9).toString();
      setStatus("Подтвердите перевод в кошельке…");
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address: quote.platformWallet, amount: nano }],
      });

      setStatus("Зачисляем…");
      const res = await fetch("/api/balance/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountRub, txHash: result.boc }),
      });
      if (!res.ok) throw new Error("Ошибка зачисления");

      setStatus("Баланс пополнен!");
      router.refresh();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Платёж отменён");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="text-sm font-medium text-white">Пополнить баланс</div>
      <p className="mt-1 text-xs text-slate-400">
        Перевод в TON на кошелёк платформы. С баланса списывается комиссия 2.5% по
        завершённым сделкам.
      </p>

      <div className="mt-4">
        <TonConnectButton />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="number"
          min={100}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input"
        />
        <span className="text-slate-400">₽</span>
      </div>

      <button onClick={topup} disabled={busy} className="btn btn-primary w-full mt-4">
        {busy ? "Обработка…" : "Пополнить в TON"}
      </button>

      {status && <p className="mt-3 text-sm text-slate-300">{status}</p>}
    </div>
  );
}
