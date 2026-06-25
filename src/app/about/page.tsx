import Link from "next/link";

export const metadata = {
  title: "О нас — SdelkaSafe",
  description: "Платформа оптовых сделок с оплатой в TON: товары и услуги для бизнеса.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="hero-dark">
        <div className="container-page py-20 text-center">
          <h1 className="text-4xl font-semibold text-white">О платформе</h1>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
            SdelkaSafe соединяет оптовых поставщиков и заказчиков в одном месте и делает
            расчёты быстрыми и прозрачными.
          </p>
        </div>
      </section>

      <section className="container-page py-16 max-w-3xl">
        <div className="prose-like space-y-6 text-slate-700">
          <p>
            Мы объединили два каталога в одной системе: <b>опт товаров</b> — как
            классический маркетплейс, и <b>услуги для бизнеса</b> — как биржа исполнителей.
            Поставщики размещают предложения, заказчики находят нужное и оплачивают сделку
            напрямую в криптовалюте TON.
          </p>
          <p>
            Платформа не хранит ваши деньги: оплата идёт с кошелька покупателя на кошелёк
            поставщика через TON Connect. За свои услуги — сведение сторон, верификацию,
            инструменты сделки — мы берём небольшую комиссию.
          </p>
          <p>
            Цены отображаются в рублях и конвертируются в TON по актуальному курсу в момент
            оплаты. Купить TON за рубли можно прямо в Telegram Wallet.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { k: "2 каталога", v: "Товары и услуги" },
            { k: "TON", v: "Оплата без посредников" },
            { k: "2.5%", v: "Комиссия за сделку" },
          ].map((s) => (
            <div key={s.k} className="card p-5 text-center">
              <div className="text-2xl font-semibold text-slate-900">{s.k}</div>
              <div className="mt-1 text-sm text-slate-500">{s.v}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/auth/register" className="btn btn-primary">
            Присоединиться
          </Link>
        </div>
      </section>
    </div>
  );
}
