"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ListingActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(action: "archive" | "restore") {
    setBusy(true);
    await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Удалить объявление?")) return;
    setBusy(true);
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  async function boost() {
    if (!confirm("Продвинуть объявление за 199 ₽ с баланса на 7 дней?")) return;
    setBusy(true);
    const res = await fetch(`/api/listings/${id}/boost`, { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Ошибка");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Link
        href={`/dashboard/supplier/${id}`}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
      >
        Изменить
      </Link>
      {status === "APPROVED" && (
        <button
          onClick={boost}
          disabled={busy}
          className="btn btn-primary"
          title="Поднять в топ каталога на 7 дней"
        >
          ⬆ Поднять
        </button>
      )}
      {status === "ARCHIVED" ? (
        <button
          onClick={() => patch("restore")}
          disabled={busy}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Восстановить
        </button>
      ) : (
        <button
          onClick={() => patch("archive")}
          disabled={busy}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          В архив
        </button>
      )}
      <button
        onClick={remove}
        disabled={busy}
        className="rounded-md border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Удалить
      </button>
    </div>
  );
}
