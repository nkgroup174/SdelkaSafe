"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { id: string; text: string; senderId: string; createdAt: string };

export function DealChat({ dealId }: { dealId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [me, setMe] = useState<string>("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/deals/${dealId}/messages`);
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages);
    setMe(data.me);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // лёгкий поллинг
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  useEffect(() => {
    boxRef.current?.scrollTo(0, boxRef.current.scrollHeight);
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/deals/${dealId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setBusy(false);
    if (res.ok) {
      setText("");
      load();
    }
  }

  return (
    <div className="rounded-lg border border-slate-200">
      <div className="border-b border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
        Чат по сделке
      </div>
      <div ref={boxRef} className="h-72 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400">Сообщений пока нет.</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                m.senderId === me
                  ? "ml-auto bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {m.text}
            </div>
          ))
        )}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Сообщение…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2"
        />
        <button
          disabled={busy}
          className="rounded-md bg-slate-900 text-white px-4 hover:bg-slate-800 disabled:opacity-50"
        >
          →
        </button>
      </form>
    </div>
  );
}
