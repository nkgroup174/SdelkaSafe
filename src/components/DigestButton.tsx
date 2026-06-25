"use client";

import { useState } from "react";

export function DigestButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function send() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/digest", { method: "POST" });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(d.error ?? "Ошибка");
      return;
    }
    setMsg(
      d.emailConfigured
        ? `Отправлено писем: ${d.emailsSent} (категорий: ${d.categoriesProcessed})`
        : "SMTP не настроен — письма не отправлены (заполните SMTP_* в .env)"
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button onClick={send} disabled={busy} className="btn btn-outline">
        {busy ? "Рассылаем…" : "Разослать дайджест новинок"}
      </button>
      {msg && <span className="text-sm text-slate-400">{msg}</span>}
    </div>
  );
}
