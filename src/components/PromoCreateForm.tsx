"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PromoCreateForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    code: "",
    type: "PERCENT" as "PERCENT" | "FIXED",
    value: "",
    minOrderRub: "",
    maxUses: "",
    expiresAt: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      minOrderRub: form.minOrderRub ? Number(form.minOrderRub) : 0,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };
    const res = await fetch("/api/admin/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Ошибка");
      return;
    }
    setForm({ code: "", type: "PERCENT", value: "", minOrderRub: "", maxUses: "", expiresAt: "" });
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 grid sm:grid-cols-2 gap-3">
      <input
        placeholder="КОД"
        value={form.code}
        onChange={(e) => set("code", e.target.value.toUpperCase())}
        className="input"
        required
      />
      <select
        value={form.type}
        onChange={(e) => set("type", e.target.value as "PERCENT" | "FIXED")}
        className="input"
      >
        <option value="PERCENT">Процент %</option>
        <option value="FIXED">Фикс. сумма ₽</option>
      </select>
      <input
        type="number"
        placeholder={form.type === "PERCENT" ? "Скидка, %" : "Скидка, ₽"}
        value={form.value}
        onChange={(e) => set("value", e.target.value)}
        className="input"
        required
      />
      <input
        type="number"
        placeholder="Мин. сумма заказа, ₽"
        value={form.minOrderRub}
        onChange={(e) => set("minOrderRub", e.target.value)}
        className="input"
      />
      <input
        type="number"
        placeholder="Лимит использований"
        value={form.maxUses}
        onChange={(e) => set("maxUses", e.target.value)}
        className="input"
      />
      <input
        type="date"
        value={form.expiresAt}
        onChange={(e) => set("expiresAt", e.target.value)}
        className="input"
      />
      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="btn btn-primary sm:col-span-2">
        {busy ? "Создаём…" : "Создать промокод"}
      </button>
    </form>
  );
}
