"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  title: string;
  typeLabel: string;
  category: string;
  priceRub: number;
  supplier: string;
};

export function AdminModerationList({ items }: { items: Item[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected((s) => (s.size === items.length ? new Set() : new Set(items.map((i) => i.id))));
  }

  async function bulk(action: "approve" | "reject" | "delete") {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm("Удалить выбранные объявления?")) return;
    setBusy(true);
    await fetch("/api/admin/listings/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], action }),
    });
    setBusy(false);
    setSelected(new Set());
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-white/15 p-10 text-center text-slate-500">
        Нет объявлений на модерации.
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Панель массовых действий */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={selected.size === items.length}
            onChange={toggleAll}
          />
          Выбрать все
        </label>
        <span className="text-sm text-slate-500">Выбрано: {selected.size}</span>
        <div className="ml-auto flex gap-2">
          <button onClick={() => bulk("approve")} disabled={busy || !selected.size} className="btn btn-outline">
            Одобрить
          </button>
          <button onClick={() => bulk("reject")} disabled={busy || !selected.size} className="btn btn-outline">
            Отклонить
          </button>
          <button
            onClick={() => bulk("delete")}
            disabled={busy || !selected.size}
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-400 hover:bg-red-50 disabled:opacity-50"
          >
            Удалить
          </button>
        </div>
      </div>

      <div className="mt-4 divide-y divide-white/10 border border-white/10 rounded-xl overflow-hidden">
        {items.map((l) => (
          <label key={l.id} className="flex items-center gap-3 p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.has(l.id)}
              onChange={() => toggle(l.id)}
            />
            <div className="flex-1">
              <div className="font-medium text-white">{l.title}</div>
              <div className="text-sm text-slate-500">
                {l.typeLabel} · {l.category} · {l.priceRub.toLocaleString("ru-RU")} ₽ · {l.supplier}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
