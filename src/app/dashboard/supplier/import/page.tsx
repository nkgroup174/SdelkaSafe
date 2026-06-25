"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);
  const [error, setError] = useState("");

  function downloadTemplate() {
    const csv =
      "title;description;price;category;stock;moq;brand\n" +
      "Цемент М500;Мешок 50 кг;420;stroymaterialy;5000;100;Holcim\n" +
      "Кабель ВВГ 3x2.5;Бухта 100 м;6200;elektrika;300;10;Севкабель\n";
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sdelkasafe-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/listings/import", { method: "POST", body: fd });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Ошибка импорта");
      return;
    }
    setResult({ created: data.created, errors: data.errors ?? [] });
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Импорт прайса (Excel / CSV)</h1>
      <p className="mt-2 text-slate-600">
        Массовая загрузка <b>товаров</b> из файла <b>.xlsx</b> или <b>.csv</b> (выгрузка
        из МойСклад, 1С, Excel). Услуги добавляются по одной вручную. Товары появятся со
        статусом «на модерации». Поддерживаются русские заголовки: «Наименование»,
        «Цена», «Остаток», «Бренд» и т.п.
      </p>
      <button onClick={downloadTemplate} className="btn btn-outline mt-3">
        ↓ Скачать шаблон CSV
      </button>

      <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
        <div className="font-medium text-slate-800">Формат (первая строка — заголовки):</div>
        <code className="mt-2 block whitespace-pre rounded bg-white border border-slate-200 p-2 text-xs">
{`title;description;price;category;stock;moq;brand
Цемент М500;Мешок 50 кг;420;stroymaterialy;5000;100;Holcim`}
        </code>
        <p className="mt-2 text-xs">
          Обязательны <b>title</b> и <b>price</b>. Разделитель — <b>;</b> или <b>,</b>.
          Неизвестная категория → «Прочие товары».
        </p>
      </div>

      <label className="mt-5 inline-block">
        <input
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={onFile}
          disabled={busy}
          className="block"
        />
      </label>

      {busy && <p className="mt-4 text-sm text-slate-500">Импортируем…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {result && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <p className="text-emerald-800">Добавлено товаров: {result.created}</p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-amber-700">
              {result.errors.slice(0, 10).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
          <button
            onClick={() => router.push("/dashboard/supplier")}
            className="mt-3 rounded-md bg-slate-900 text-white px-4 py-2 hover:bg-slate-800"
          >
            К моим объявлениям
          </button>
        </div>
      )}
    </div>
  );
}
