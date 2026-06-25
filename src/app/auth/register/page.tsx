"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER" as "CUSTOMER" | "SUPPLIER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState<string | null>(null);

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("ref");
    if (r) setRef(r);
  }, []);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ref: ref ?? undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Ошибка регистрации");
      return;
    }
    // Автовход после регистрации
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold text-slate-900">Регистрация</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          placeholder="Имя или название компании"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="input"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className="input"
        />
        <input
          type="password"
          required
          placeholder="Пароль (минимум 6 символов)"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          className="input"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => set("role", "CUSTOMER")}
            className={`flex-1 rounded-md border py-2 text-sm ${
              form.role === "CUSTOMER"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 text-slate-700"
            }`}
          >
            Я заказчик
          </button>
          <button
            type="button"
            onClick={() => set("role", "SUPPLIER")}
            className={`flex-1 rounded-md border py-2 text-sm ${
              form.role === "SUPPLIER"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 text-slate-700"
            }`}
          >
            Я поставщик
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="btn btn-primary w-full">
          {loading ? "Создаём…" : "Создать аккаунт"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Уже есть аккаунт?{" "}
        <Link href="/auth/login" className="text-slate-900 underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
