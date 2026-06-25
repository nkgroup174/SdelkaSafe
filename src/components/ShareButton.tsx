"use client";

import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }

  const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`;

  return (
    <div className="card p-4">
      <button onClick={() => setOpen((v) => !v)} className="btn btn-outline w-full">
        ↗ Поделиться
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          <button onClick={copy} className="btn btn-outline w-full">
            {copied ? "Ссылка скопирована" : "Копировать ссылку"}
          </button>
          <a href={tg} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full">
            Отправить в Telegram
          </a>
          <div className="flex justify-center pt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR" className="rounded-md bg-white p-1" width={180} height={180} />
          </div>
        </div>
      )}
    </div>
  );
}
