"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EmailVerify() {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    setErr("");
    setMsg("");
    const res = await fetch("/api/users/verify-email", { method: "POST" });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) {
      setErr(d.error ?? "Ошибка");
      return;
    }
    setStep("sent");
    if (d.devCode) {
      setMsg(`Код отправлен. (DEV: ${d.devCode} — SMTP не настроен)`);
    } else {
      setMsg("Код отправлен на вашу почту.");
    }
  }

  async function confirm() {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/users/verify-email", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) {
      setErr(d.error ?? "Ошибка");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-3 space-y-3">
      {step === "idle" ? (
        <button onClick={send} disabled={busy} className="btn btn-outline">
          {busy ? "Отправляем…" : "Отправить код подтверждения"}
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Код из письма"
            className="input"
          />
          <button onClick={confirm} disabled={busy} className="btn btn-primary">
            Подтвердить
          </button>
        </div>
      )}
      {msg && <p className="text-sm text-slate-300">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
