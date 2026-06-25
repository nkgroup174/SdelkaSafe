"use client";

import { useState } from "react";

export function ImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) {
      setErr(d.error ?? "Ошибка загрузки");
      return;
    }
    onChange(d.url);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="preview"
            className="h-16 w-16 rounded-md object-cover border border-white/10"
          />
        ) : (
          <div className="h-16 w-16 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-xs text-slate-500">
            нет фото
          </div>
        )}
        <label className="btn btn-outline cursor-pointer">
          {busy ? "Загрузка…" : "Загрузить фото"}
          <input
            type="file"
            accept="image/*"
            onChange={onFile}
            disabled={busy}
            className="hidden"
          />
        </label>
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="или вставьте ссылку на изображение"
        className="input"
      />
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
