# SdelkaSafe 2.0

Платформа оптовых сделок: **два каталога** (товары + услуги), оплата в **TON**
(не-кастодиальный P2P через TON Connect), личные кабинеты поставщика и заказчика,
Telegram Mini App. Расчёты в рублях.

Бизнес- и финансовый план: [`docs/BUSINESS_PLAN.md`](docs/BUSINESS_PLAN.md).

## Стек

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma + PostgreSQL ·
NextAuth · TON Connect · Telegram Bot/Mini App.

## Запуск локально (Windows, VSCode)

> ВАЖНО: сначала запусти **Docker Desktop** (иконка кита в трее должна быть активна),
> иначе база Postgres не поднимется.

### Вариант А — одной командой

```powershell
cd C:\4\sdelkasafe-v2
.\setup.ps1
```

Скрипт сам поставит зависимости, сгенерирует Prisma, поднимет базу, заполнит данными и
запустит сервер. Если PowerShell не даёт запускать скрипты, выполни один раз:
`Set-ExecutionPolicy -Scope Process Bypass`.

### Вариант Б — по шагам (PowerShell, БЕЗ `&&`)

Каждую команду вводи отдельной строкой — старый PowerShell не понимает `&&`.

```powershell
cd C:\4\sdelkasafe-v2
npm install
copy .env.example .env
npx prisma generate
docker compose up -d postgres
npx prisma db push
npm run db:seed
npm run dev
# → http://localhost:3000
```

### Тестовые аккаунты (после seed)

Пароль у всех: `password123`

| Роль | Email |
|---|---|
| Админ (модерация) | admin@sdelkasafe.ru |
| Поставщик | supplier@sdelkasafe.ru |
| Заказчик | buyer@sdelkasafe.ru |

### Полный цикл для проверки

1. Поставщик добавляет объявление → оно уходит в статус «На модерации».
2. Админ в `/dashboard/admin` одобряет → объявление появляется в каталоге.
3. Заказчик открывает карточку, подключает TON-кошелёк, оплачивает.
4. Заказчик в `/dashboard/deals` подтверждает получение → платформе начисляется комиссия 2.5% (списывается с баланса поставщика).

## Запуск всего в Docker (как на проде)

```powershell
docker compose up -d --build
```

## Структура

```
src/
  app/
    page.tsx                 # лендинг
    catalog/products/        # каталог товаров
    catalog/services/        # каталог услуг
    dashboard/               # личный кабинет (по ролям)
    api/                     # API-роуты (добавляются по дорожной карте)
  lib/
    prisma.ts                # клиент Prisma
    ton.ts                   # курс TON, конвертация RUB→TON
    constants.ts             # комиссия, категории
prisma/
  schema.prisma              # БД: два каталога + не-кастодиальная оплата
docs/
  BUSINESS_PLAN.md           # бизнес- и финплан
```

## Telegram: вход, Mini App, бот

Токен бота уже прописан в `.env` (`TELEGRAM_BOT_TOKEN`). Дальше:

1. **Узнать username бота.** Запусти проект и открой `http://localhost:3000/api/telegram/setup`
   — ответ покажет `@username`. Впиши его (без `@`) в `.env` →
   `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`, перезапусти `npm run dev`.
2. **Вход через Telegram на сайте** (Login Widget) работает только на реальном домене:
   в @BotFather выполни `/setdomain` → укажи `sdelkasafe.ru`. На `localhost` виджет
   Telegram не авторизует (ограничение Telegram).
3. **Mini App.** В @BotFather: `/newapp` (или Bot Settings → Menu Button) → укажи URL
   `https://sdelkasafe.ru/app`. Пользователь открывает мини-апп → вход по `initData`
   происходит автоматически.
4. **Webhook бота** (уведомления и /start). На задеплоенном домене открой один раз
   `https://sdelkasafe.ru/api/telegram/setup?action=set-webhook`. Перед этим задай
   `APP_URL=https://sdelkasafe.ru` и свой `TELEGRAM_WEBHOOK_SECRET` в `.env` сервера.

> Важно: вход через Telegram и Mini App требуют публичного HTTPS. Локально (`localhost`)
> тестируется обычный вход по email; Telegram-часть проверяется на проде `sdelkasafe.ru`.

Бот шлёт уведомления поставщику о новой заявке и обеим сторонам о новых сообщениях
(если у пользователя привязан Telegram).

## Модель оплаты (важно)

Платформа **не хранит деньги сделки**. Покупатель платит поставщику напрямую через
TON Connect; платформа фиксирует сделку и списывает **success-fee (2.5%)** с внутреннего
баланса поставщика. Рубли пользователь покупает сам (Telegram Wallet) — платформа фиатом
не оперирует. Это минимизирует юридические требования. Подробности — в бизнес-плане, §3–5.

## Дорожная карта

См. `docs/BUSINESS_PLAN.md`, §8. Кратко: каркас → auth + роли → кабинет поставщика +
объявления → каталоги → сделка + TON Connect → Mini App → (фаза 2) смарт-контракт эскроу.
