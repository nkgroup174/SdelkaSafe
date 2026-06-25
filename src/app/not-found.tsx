import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-28 text-center">
      <div className="text-7xl font-bold text-gradient">404</div>
      <h1 className="mt-4 text-2xl font-semibold text-white">Страница не найдена</h1>
      <p className="mt-2 text-slate-400">
        Возможно, объявление снято с публикации или ссылка устарела.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          На главную
        </Link>
        <Link href="/catalog/products" className="btn btn-light">
          В каталог
        </Link>
      </div>
    </div>
  );
}
