import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";
const BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "";
const APP_URL = process.env.APP_URL ?? "https://sdelkasafe.ru";

// POST /api/telegram/webhook — приём апдейтов от Telegram
export async function POST(req: Request) {
  // Telegram присылает наш секрет в этом заголовке (мы задаём его при setWebhook)
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = await req.json().catch(() => null);
  const message = update?.message;
  const text: string | undefined = message?.text;
  const chatId = message?.chat?.id;

  if (chatId && text) {
    if (text.startsWith("/start")) {
      const miniAppUrl = `${APP_URL}/app`;
      await sendTelegramMessage(
        chatId,
        `👋 Добро пожаловать в <b>SdelkaSafe</b> — оптовые сделки с оплатой в TON.\n\n` +
          `• Открыть приложение: ${miniAppUrl}\n` +
          `• Каталог на сайте: ${APP_URL}/catalog/products\n\n` +
          `Бот будет присылать уведомления о новых заявках и сообщениях.`
      );
    } else {
      await sendTelegramMessage(
        chatId,
        `Команда не распознана. Откройте приложение: ${APP_URL}/app`
      );
    }
  }

  // Telegram ждёт 200 OK
  return NextResponse.json({ ok: true });
}

// GET — простая проверка живости
export async function GET() {
  return NextResponse.json({ ok: true, bot: BOT || "не задан" });
}
