import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Простой in-memory rate-limiter (на один инстанс). Защищает чувствительные
// POST-эндпоинты от спама: регистрация, создание объявлений, жалобы, импорт.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const hits = new Map<string, { count: number; reset: number }>();

const GUARDED = [
  "/api/auth/register",
  "/api/listings",
  "/api/reports",
  "/api/listings/import",
];

export function middleware(req: NextRequest) {
  if (req.method !== "POST") return NextResponse.next();
  const path = req.nextUrl.pathname;
  if (!GUARDED.some((p) => path === p || path.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const key = `${ip}:${path}`;
  const now = Date.now();
  const rec = hits.get(key);

  if (!rec || now > rec.reset) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS });
  } else {
    rec.count++;
    if (rec.count > MAX_REQUESTS) {
      return NextResponse.json(
        { error: "Слишком много запросов, попробуйте позже" },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/auth/register", "/api/listings/:path*", "/api/reports/:path*"],
};
