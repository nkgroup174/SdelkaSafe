"use client";

import { useState } from "react";

const MAX = 8;

export function MultiImageUpload({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    setErr("");
    const urls = [...value];
    for (const file of files) {
      if (urls.length >= MAX) break;
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (res.ok) urls.push(d.url);
      else setErr(d.error ?? "Ошибка загрузки");
    }
    setBusy(false);
    onChange(urls);
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-300">Фото (до {MAX}, первое — главное)</label>
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url + i} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-20 w-20 rounded-md object-cover border border-white/10" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-black/70 text-white text-xs"
            >
              ×
            </button>
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-center text-white rounded-b-md">
                главное
              </span>
            )}
          </div>
        ))}
        {value.length < MAX && (
          <label className="h-20 w-20 rounded-md border border-dashed border-white/20 flex items-center justify-center cursor-pointer text-slate-400 text-sm hover:bg-white/5">
            {busy ? "…" : "+"}
            <input type="file" accept="image/*" multiple onChange={onFiles} disabled={busy} className="hidden" />
          </label>
        )}
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
