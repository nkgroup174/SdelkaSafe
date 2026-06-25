import { NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";
const APP_URL = process.env.APP_URL ?? "https://sdelkasafe.ru";

async function tg(method: string, body?: unknown) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// GET /api/telegram/setup — узнать username бота и состояние вебхука.
// GET /api/telegram/setup?action=set-webhook — зарегистрировать вебхук (нужен публичный HTTPS).
export async function GET(req: Request) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN не задан" }, { status: 400 });
  }
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "set-webhook") {
    const url = `${APP_URL}/api/telegram/webhook`;
    const result = await tg("setWebhook", {
      url,
      secret_token: WEBHOOK_SECRET || undefined,
      allowed_updates: ["message"],
    });
    return NextResponse.json({ setWebhook: result, url });
  }

  const me = await tg("getMe");
  const webhook = await tg("getWebhookInfo");
  return NextResponse.json({
    bot: me?.result,
    hint: me?.result?.username
      ? `Username бота: @${me.result.username}. Впиши его (без @) в NEXT_PUBLIC_TELEGRAM_BOT_USERNAME в .env и перезапусти dev.`
      : "Не удалось получить getMe — проверь токен.",
    webhook: webhook?.result,
  });
}
