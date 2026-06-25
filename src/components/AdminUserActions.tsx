"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "CUSTOMER" | "SUPPLIER" | "ADMIN";

export function AdminUserActions({
  id,
  role,
  isBlocked,
  isSelf,
}: {
  id: string;
  role: Role;
  isBlocked: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Ошибка");
      return;
    }
    router.refresh();
  }

  async function remove() {
    if (!confirm("Удалить пользователя? (если есть данные — будет заблокирован)")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Ошибка");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <select
        value={role}
        disabled={busy || isSelf}
        onChange={(e) => patch({ role: e.target.value })}
        className="input !py-1.5 !w-auto"
      >
        <option value="CUSTOMER">Заказчик</option>
        <option value="SUPPLIER">Поставщик</option>
        <option value="ADMIN">Админ</option>
      </select>
      {!isSelf && (
        <>
          <button
            onClick={() => patch({ isBlocked: !isBlocked })}
            disabled={busy}
            className="btn btn-outline"
          >
            {isBlocked ? "Разблокировать" : "Заблокировать"}
          </button>
          <button
            onClick={remove}
            disabled={busy}
            className="rounded-md border border-red-200 px-3 py-1.5 text-red-400 hover:bg-red-50 disabled:opacity-50"
          >
            Удалить
          </button>
        </>
      )}
      {isSelf && <span className="text-xs text-slate-500">это вы</span>}
    </div>
  );
}
