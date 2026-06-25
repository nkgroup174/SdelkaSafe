"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page py-28 text-center">
      <h1 className="text-2xl font-semibold text-white">Что-то пошло не так</h1>
      <p className="mt-2 text-slate-400">
        Произошла ошибка. Попробуйте обновить страницу.
      </p>
      <button onClick={reset} className="btn btn-primary mt-8">
        Повторить
      </button>
    </div>
  );
}
