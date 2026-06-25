export const metadata = {
  title: "Контакты — SdelkaSafe",
  description: "Свяжитесь с командой SdelkaSafe.",
};

export default function ContactPage() {
  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="text-3xl font-semibold text-slate-900">Контакты</h1>
      <p className="mt-3 text-slate-600">
        Мы на связи по любым вопросам о сделках, поставщиках и оплате.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <div className="text-sm text-slate-500">Telegram</div>
          <a
            href="https://t.me/SdelkaSafeBot"
            className="mt-1 block font-medium text-blue-600 hover:underline"
          >
            @SdelkaSafeBot
          </a>
        </div>
        <div className="card p-5">
          <div className="text-sm text-slate-500">Email</div>
          <a
            href="mailto:support@sdelkasafe.ru"
            className="mt-1 block font-medium text-blue-600 hover:underline"
          >
            support@sdelkasafe.ru
          </a>
        </div>
        <div className="card p-5">
          <div className="text-sm text-slate-500">Сайт</div>
          <div className="mt-1 font-medium text-slate-900">sdelkasafe.ru</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-slate-500">Режим работы</div>
          <div className="mt-1 font-medium text-slate-900">Поддержка ежедневно</div>
        </div>
      </div>
    </div>
  );
}
