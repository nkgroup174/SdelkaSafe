"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminUserCreate() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "CUSTOMER" as "CUSTOMER" | "SUPPLIER" | "ADMIN",
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
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Ошибка");
      return;
    }
    setForm({ email: "", password: "", name: "", role: "CUSTOMER" });
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 grid sm:grid-cols-2 gap-3">
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        className="input"
        required
      />
      <input
        placeholder="Имя / компания"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        className="input"
      />
      <input
        type="text"
        placeholder="Пароль (мин. 6)"
        value={form.password}
        onChange={(e) => set("password", e.target.value)}
        className="input"
        required
      />
      <select
        value={form.role}
        onChange={(e) => set("role", e.target.value as typeof form.role)}
        className="input"
      >
        <option value="CUSTOMER">Заказчик</option>
        <option value="SUPPLIER">Поставщик</option>
        <option value="ADMIN">Админ</option>
      </select>
      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="btn btn-primary sm:col-span-2">
        {busy ? "Создаём…" : "Добавить пользователя"}
      </button>
    </form>
  );
}
