import crypto from "crypto";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";

export type TgUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

// ───────── Проверка Telegram Login Widget (вход на сайте) ─────────
export function verifyLoginWidget(
  data: Record<string, string>
): TgUser | null {
  if (!BOT_TOKEN) return null;
  const { hash, ...rest } = data;
  if (!hash) return null;

  const checkString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("\n");

  const secret = crypto.createHash("sha256").update(BOT_TOKEN).digest();
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(checkString)
    .digest("hex");

  if (hmac !== hash) return null;

  // Защита от старых данных (24 часа)
  const authDate = Number(rest.auth_date ?? 0);
  if (Date.now() / 1000 - authDate > 86400) return null;

  return {
    id: Number(rest.id),
    first_name: rest.first_name,
    last_name: rest.last_name,
    username: rest.username,
    photo_url: rest.photo_url,
  };
}

// ───────── Проверка Mini App initData ─────────
export function verifyInitData(initData: string): TgUser | null {
  if (!BOT_TOKEN) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const checkString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("\n");

  const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(checkString)
    .digest("hex");

  if (hmac !== hash) return null;

  const userRaw = params.get("user");
  if (!userRaw) return null;
  try {
    const u = JSON.parse(userRaw);
    return {
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      username: u.username,
      photo_url: u.photo_url,
    };
  } catch {
    return null;
  }
}

// ───────── Отправка сообщения через бота ─────────
export async function sendTelegramMessage(
  chatId: string | number,
  text: string
): Promise<void> {
  if (!BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch {
    // уведомления не должны ломать основную логику
  }
}
