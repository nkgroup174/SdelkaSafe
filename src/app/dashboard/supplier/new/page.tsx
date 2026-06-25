"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES, subcategoriesFor } from "@/lib/constants";
import { MultiImageUpload } from "@/components/MultiImageUpload";

type Type = "PRODUCT" | "SERVICE";

export default function NewListing() {
  const router = useRouter();
  const [type, setType] = useState<Type>("PRODUCT");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: PRODUCT_CATEGORIES[0].slug,
    subcategory: "",
    priceRub: "",
    oldPriceRub: "",
    images: [] as string[],
    stock: "",
    moq: "",
    brand: "",
    unit: "PROJECT" as "HOUR" | "DAY" | "PROJECT" | "MONTH",
    duration: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cats = type === "PRODUCT" ? PRODUCT_CATEGORIES : SERVICE_CATEGORIES;

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function switchType(t: Type) {
    setType(t);
    setForm((f) => ({
      ...f,
      category: (t === "PRODUCT" ? PRODUCT_CATEGORIES : SERVICE_CATEGORIES)[0].slug,
      subcategory: "",
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const payload = {
      type,
      title: form.title,
      description: form.description,
      category: form.category,
      subcategory: form.subcategory || undefined,
      priceRub: Number(form.priceRub),
      oldPriceRub: form.oldPriceRub ? Number(form.oldPriceRub) : undefined,
      images: form.images,
      ...(type === "PRODUCT"
        ? {
            stock: form.stock ? Number(form.stock) : undefined,
            moq: form.moq ? Number(form.moq) : undefined,
            brand: form.brand || undefined,
          }
        : { unit: form.unit, duration: form.duration || undefined }),
    };
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Ошибка");
      return;
    }
    router.push("/dashboard/supplier");
    router.refresh();
  }

  const input = "w-full rounded-md border border-slate-300 px-3 py-2";

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Новое объявление</h1>

      <div className="mt-5 flex gap-2">
        {(["PRODUCT", "SERVICE"] as Type[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchType(t)}
            className={`flex-1 rounded-md border py-2 text-sm ${
              type === t
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 text-slate-700"
            }`}
          >
            {t === "PRODUCT" ? "Товар" : "Услуга"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <input
          required
          placeholder="Название"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className={input}
        />
        <textarea
          required
          placeholder="Описание"
          rows={4}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={input}
        />
        <select
          value={form.category}
          onChange={(e) =>
            setForm((f) => ({ ...f, category: e.target.value, subcategory: "" }))
          }
          className={input}
        >
          {cats.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        {subcategoriesFor(form.category).length > 0 && (
          <select
            value={form.subcategory}
            onChange={(e) => set("subcategory", e.target.value)}
            className={input}
          >
            <option value="">Подкатегория (необязательно)</option>
            {subcategoriesFor(form.category).map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        )}
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            type="number"
            min="1"
            placeholder="Цена, ₽"
            value={form.priceRub}
            onChange={(e) => set("priceRub", e.target.value)}
            className={input}
          />
          <input
            type="number"
            min="1"
            placeholder="Старая цена (для скидки), ₽"
            value={form.oldPriceRub}
            onChange={(e) => set("oldPriceRub", e.target.value)}
            className={input}
          />
        </div>
        <MultiImageUpload value={form.images} onChange={(urls) => set("images", urls)} />

        {type === "PRODUCT" ? (
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              placeholder="Остаток"
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
              className={input}
            />
            <input
              type="number"
              placeholder="Мин. партия"
              value={form.moq}
              onChange={(e) => set("moq", e.target.value)}
              className={input}
            />
            <input
              placeholder="Бренд"
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
              className={input}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.unit}
              onChange={(e) => set("unit", e.target.value as typeof form.unit)}
              className={input}
            >
              <option value="HOUR">за час</option>
              <option value="DAY">за день</option>
              <option value="PROJECT">за проект</option>
              <option value="MONTH">за месяц</option>
            </select>
            <input
              placeholder="Срок (напр. 3–5 дней)"
              value={form.duration}
              onChange={(e) => set("duration", e.target.value)}
              className={input}
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-md bg-slate-900 text-white py-2 hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Публикуем…" : "Опубликовать (на модерацию)"}
        </button>
      </form>
    </div>
  );
}
