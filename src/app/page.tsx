import Link from "next/link";

const FEATURES = [
  { icon: "🛡️", title: "Безопасные сделки", text: "Чат, статусы и история сделок защищают обе стороны на каждом этапе." },
  { icon: "💎", title: "Проверенные поставщики", text: "Поставщики проходят модерацию и верификацию перед выходом в каталог." },
  { icon: "⚡", title: "Быстрые платежи", text: "Оплата напрямую в TON через ваш кошелёк — без банковских задержек." },
  { icon: "📊", title: "Прозрачность", text: "Цены в рублях, конвертация в TON по курсу, полная история и отзывы." },
];

const STEPS = [
  { n: "01", title: "Выберите товар или услугу", text: "Два каталога: опт товаров и услуги для бизнеса от проверенных поставщиков." },
  { n: "02", title: "Оформите сделку", text: "Создайте заявку и оплатите напрямую поставщику через TON Connect." },
  { n: "03", title: "Подтвердите получение", text: "После получения подтвердите сделку — платформа удержит небольшую комиссию." },
];

const FAQ = [
  { q: "Как происходит оплата?", a: "Оплата идёт напрямую с вашего кошелька поставщику через TON Connect. Платформа не хранит ваши средства и берёт комиссию 2.5% за услуги." },
  { q: "Где взять TON за рубли?", a: "TON можно купить за рубли прямо в Telegram Wallet или на биржах. Цены в каталоге показаны в рублях и конвертируются в TON по курсу на момент сделки." },
  { q: "Как стать поставщиком?", a: "Зарегистрируйтесь как поставщик, заполните профиль с TON-кошельком и добавьте товары или услуги. После модерации они появятся в каталоге." },
  { q: "Какие гарантии безопасности?", a: "Верификация поставщиков, отзывы, чат по сделке и прозрачная история. Полноценный смарт-контракт эскроу на TON — в ближайших планах." },
];

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="container-page py-24 md:py-32 text-center">
        <span className="eyebrow">TON · Эскроу-логика · Два каталога</span>
        <h1 className="mt-7 text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
          <span className="text-gradient">Безопасные сделки</span>
          <br />
          <span className="text-white">между бизнесом</span>
        </h1>
        <p className="mt-7 text-lg text-slate-400 max-w-2xl mx-auto">
          Платформа B2B-торговли с защищёнными платежами и криптовалютой TON. Товары
          оптом и услуги для бизнеса — в одном месте, с проверенными поставщиками.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link href="/catalog/products" className="btn btn-primary">
            Перейти в каталог
          </Link>
          <Link href="/#how" className="btn btn-light">
            Узнать больше
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container-page py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white">
          Почему выбирают нас
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-hover p-6">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section-alt mt-12">
        <div className="container-page py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white">
            Как это работает
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="card p-7">
                <div className="text-5xl font-bold text-gradient">{s.n}</div>
                <h3 className="mt-4 font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page py-20 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white">
          Частые вопросы
        </h2>
        <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-white list-none">
                {item.q}
                <span className="text-slate-500 text-xl transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate-400">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-24">
        <div
          className="rounded-3xl border border-white/10 px-6 py-16 text-center"
          style={{
            backgroundImage:
              "radial-gradient(600px 300px at 50% 0%, rgba(139,92,246,0.35), transparent 70%), linear-gradient(120deg, rgba(79,123,255,0.18), rgba(232,121,249,0.14))",
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Готовы начать безопасные сделки?
          </h2>
          <p className="mt-4 text-slate-300">
            Регистрация и размещение объявлений — бесплатно. Комиссия только за успешную сделку.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/auth/register" className="btn btn-primary">
              Начать сейчас
            </Link>
            <Link href="/catalog/products" className="btn btn-light">
              Смотреть каталог
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
