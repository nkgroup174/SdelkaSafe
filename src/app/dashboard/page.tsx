import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");

  const role = session.user.role;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Личный кабинет</h1>
      <p className="mt-1 text-slate-600">
        {session.user.name ?? session.user.email} ·{" "}
        {role === "SUPPLIER" ? "Поставщик" : role === "ADMIN" ? "Админ" : "Заказчик"}
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {role === "SUPPLIER" && (
          <>
            <Card href="/dashboard/supplier" title="Мои объявления" desc="Товары и услуги, статусы модерации" />
            <Card href="/dashboard/supplier/new" title="Добавить объявление" desc="Разместить товар или услугу" />
            <Card href="/dashboard/balance" title="Баланс комиссий" desc="Пополнение в TON, история" />
          </>
        )}
        <Card href="/dashboard/deals" title="Мои сделки" desc="Заявки, оплаты, чат" />
        <Card href="/dashboard/offers" title="Предложения цены" desc="Торг по объявлениям" />
        <Card href="/dashboard/stats" title="Статистика" desc="Просмотры, сделки, суммы" />
        <Card href="/dashboard/profile" title="Профиль" desc="Данные и TON-кошелёк" />
        <Card href="/catalog/products" title="Каталог товаров" desc="Найти товары оптом" />
        <Card href="/catalog/services" title="Каталог услуг" desc="Найти исполнителей" />
        <Card href="/dashboard/favorites" title="Избранное" desc="Сохранённые объявления" />
        <Card href="/dashboard/compare" title="Сравнение" desc="Сравнить товары" />
        <Card href="/dashboard/history" title="История просмотров" desc="Что вы смотрели" />
        {role === "ADMIN" && (
          <>
            <Card href="/dashboard/admin/analytics" title="Аналитика" desc="Сводка по платформе" />
            <Card href="/dashboard/admin" title="Модерация" desc="Объявления на проверке" />
            <Card href="/dashboard/admin/users" title="Пользователи" desc="Роли, блокировка, удаление" />
            <Card href="/dashboard/admin/reports" title="Жалобы" desc="Очередь жалоб на объявления" />
            <Card href="/dashboard/admin/disputes" title="Споры" desc="Разрешение споров по сделкам" />
            <Card href="/dashboard/admin/promo" title="Промокоды" desc="Создание и управление" />
          </>
        )}
      </div>
    </div>
  );
}

function Card({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 p-5 hover:border-slate-400 transition-colors"
    >
      <div className="font-medium text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{desc}</div>
    </Link>
  );
}
