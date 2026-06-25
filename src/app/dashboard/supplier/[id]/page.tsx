"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES, subcategoriesFor } from "@/lib/constants";
import { MultiImageUpload } from "@/components/MultiImageUpload";

export default function EditListing() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [type, setType] = useState<"PRODUCT" | "SERVICE">("PRODUCT");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    priceRub: "",
    oldPriceRub: "",
    stock: "",
    moq: "",
    brand: "",
    unit: "PROJECT",
    duration: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          return;
        }
        const l = d.listing;
        setType(l.type);
        setForm({
          title: l.title ?? "",
          description: l.description ?? "",
          category: l.category ?? "",
          subcategory: l.subcategory ?? "",
          priceRub: String(l.priceRub ?? ""),
          oldPriceRub: l.oldPriceRub != null ? String(l.oldPriceRub) : "",
          stock: l.stock != null ? String(l.stock) : "",
          moq: l.moq != null ? String(l.moq) : "",
          brand: l.brand ?? "",
          unit: l.unit ?? "PROJECT",
          duration: l.duration ?? "",
        });
        setImages(
          Array.isArray(l.images) && l.images.length
            ? l.images
            : l.imageUrl
            ? [l.imageUrl]
            : []
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      subcategory: form.subcategory || undefined,
      priceRub: Number(form.priceRub),
      oldPriceRub: form.oldPriceRub ? Number(form.oldPriceRub) : 0,
      images,
      ...(type === "PRODUCT"
        ? {
            stock: form.stock ? Number(form.stock) : undefined,
            moq: form.moq ? Number(form.moq) : undefined,
            brand: form.brand || undefined,
          }
        : {
            unit: form.unit as "HOUR" | "DAY" | "PROJECT" | "MONTH",
            duration: form.duration || undefined,
          }),
    };
    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Ошибка");
      return;
    }
    router.push("/dashboard/supplier");
    router.refresh();
  }

  if (loading) return <div className="max-w-xl mx-auto px-4 py-10 text-slate-400">Загрузка…</div>;
  if (error) return <div className="max-w-xl mx-auto px-4 py-10 text-red-600">{error}</div>;

  const cats = type === "PRODUCT" ? PRODUCT_CATEGORIES : SERVICE_CATEGORIES;
  const input = "w-full rounded-md border border-slate-300 px-3 py-2";

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        Редактирование {type === "PRODUCT" ? "товара" : "услуги"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        После изменения объявление снова уйдёт на модерацию.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <input value={form.title} onChange={(e) => set("title", e.target.value)} className={input} placeholder="Название" />
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className={input} placeholder="Описание" />
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subcategory: "" }))}
          className={input}
        >
          {cats.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        {subcategoriesFor(form.category).length > 0 && (
          <select value={form.subcategory} onChange={(e) => set("subcategory", e.target.value)} className={input}>
            <option value="">Подкатегория (необязательно)</option>
            {subcategoriesFor(form.category).map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
        )}
        <div className="grid grid-cols-2 gap-3">
          <input type="number" value={form.priceRub} onChange={(e) => set("priceRub", e.target.value)} className={input} placeholder="Цена, ₽" />
          <input type="number" value={form.oldPriceRub} onChange={(e) => set("oldPriceRub", e.target.value)} className={input} placeholder="Старая цена (скидка), ₽" />
        </div>
        <MultiImageUpload value={images} onChange={setImages} />

        {type === "PRODUCT" ? (
          <div className="grid grid-cols-3 gap-3">
            <input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} className={input} placeholder="Остаток" />
            <input type="number" value={form.moq} onChange={(e) => set("moq", e.target.value)} className={input} placeholder="Мин. партия" />
            <input value={form.brand} onChange={(e) => set("brand", e.target.value)} className={input} placeholder="Бренд" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <select value={form.unit} onChange={(e) => set("unit", e.target.value)} className={input}>
              <option value="HOUR">за час</option>
              <option value="DAY">за день</option>
              <option value="PROJECT">за проект</option>
              <option value="MONTH">за месяц</option>
            </select>
            <input value={form.duration} onChange={(e) => set("duration", e.target.value)} className={input} placeholder="Срок" />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full rounded-md bg-slate-900 text-white py-2 hover:bg-slate-800 disabled:opacity-50">
          {busy ? "Сохраняем…" : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
