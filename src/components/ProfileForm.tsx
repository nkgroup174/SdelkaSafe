"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ImageUpload";

export type ProfileInitial = {
  name: string;
  phone: string;
  tonWallet: string;
  avatarUrl: string;
  about: string;
  city: string;
  website: string;
  inn: string;
  ogrn: string;
};

export function ProfileForm({
  initial,
  isSupplier,
}: {
  initial: ProfileInitial;
  isSupplier: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set<K extends keyof ProfileInitial>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Ошибка");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label className="text-sm text-slate-300">Аватар / логотип</label>
        <div className="mt-2">
          <ImageUpload value={form.avatarUrl} onChange={(url) => set("avatarUrl", url)} />
        </div>
      </div>

      <div>
        <label className="text-sm text-slate-300">Имя / компания</label>
        <input value={form.name} onChange={(e) => set("name", e.target.value)} className="input" />
      </div>
      <div>
        <label className="text-sm text-slate-300">Телефон</label>
        <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="input" />
      </div>

      {isSupplier && (
        <>
          <div>
            <label className="text-sm text-slate-300">О компании</label>
            <textarea
              rows={3}
              value={form.about}
              onChange={(e) => set("about", e.target.value)}
              className="input"
              placeholder="Чем занимаетесь, преимущества, условия поставки"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.city} onChange={(e) => set("city", e.target.value)} className="input" placeholder="Город" />
            <input value={form.website} onChange={(e) => set("website", e.target.value)} className="input" placeholder="Сайт" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.inn} onChange={(e) => set("inn", e.target.value)} className="input" placeholder="ИНН" />
            <input value={form.ogrn} onChange={(e) => set("ogrn", e.target.value)} className="input" placeholder="ОГРН" />
          </div>
          <div>
            <label className="text-sm text-slate-300">
              TON-кошелёк (на него заказчики переводят оплату)
            </label>
            <input
              value={form.tonWallet}
              onChange={(e) => set("tonWallet", e.target.value)}
              placeholder="UQ... или EQ..."
              className="input"
            />
            <p className="mt-1 text-xs text-slate-500">
              Без указанного кошелька оплата ваших объявлений будет недоступна.
            </p>
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-emerald-400">Сохранено</p>}

      <button disabled={busy} className="btn btn-primary">
        {busy ? "Сохраняем…" : "Сохранить"}
      </button>
    </form>
  );
}
