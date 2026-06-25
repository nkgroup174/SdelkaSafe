"use client";

import { useState } from "react";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setErr("");
    const res = await fetch("/api/users/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    setBusy(false);
    const d = await res.json();
    if (!res.ok) {
      setErr(d.error ?? "Ошибка");
      return;
    }
    setMsg("Пароль изменён");
    setCurrent("");
    setNext("");
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <input
        type="password"
        placeholder="Текущий пароль"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        className="input"
        required
      />
      <input
        type="password"
        placeholder="Новый пароль (мин. 6)"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        className="input"
        required
      />
      {err && <p className="text-sm text-red-600">{err}</p>}
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}
      <button disabled={busy} className="btn btn-outline">
        {busy ? "Меняем…" : "Сменить пароль"}
      </button>
    </form>
  );
}
