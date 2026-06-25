# Деплой SdelkaSafe на сервер (Timeweb VPS)

Инструкция для VPS с Ubuntu 22.04/24.04. Стек: Docker (Postgres + Next.js) + Nginx
(reverse proxy на хосте) + Let's Encrypt (SSL).

---

## 0. Что понадобится
- VPS на Timeweb (Ubuntu), его IP и root-доступ по SSH.
- Домен `sdelkasafe.ru`, к которому есть доступ к DNS.
- Токен Telegram-бота и (желательно) адрес TON-кошелька платформы.

## 1. Домен → сервер (DNS)
В панели управления доменом добавьте A-записи на IP сервера:
- `sdelkasafe.ru` → `<IP_сервера>`
- `www.sdelkasafe.ru` → `<IP_сервера>`

Проверка (с локальной машины): `nslookup sdelkasafe.ru` — должен вернуть IP сервера.
DNS может обновляться до нескольких часов.

## 2. Подключение к серверу
```bash
ssh root@<IP_сервера>
```

## 3. Установка софта
```bash
apt update && apt upgrade -y
# Docker + compose-плагин
curl -fsSL https://get.docker.com | sh
# Nginx + Certbot + Git
apt install -y nginx certbot python3-certbot-nginx git
```

## 4. Загрузка проекта
Вариант А — через Git (если проект в репозитории):
```bash
mkdir -p /opt && cd /opt
git clone <URL_вашего_репозитория> sdelkasafe
cd sdelkasafe
```
Вариант Б — скопировать папку проекта с локальной машины (PowerShell):
```powershell
scp -r C:\4\sdelkasafe-v2 root@<IP_сервера>:/opt/sdelkasafe
```

## 5. Настройка окружения
```bash
cd /opt/sdelkasafe
cp .env.production.example .env
nano .env
```
Заполните в `.env`:
- `POSTGRES_PASSWORD` — длинный случайный пароль.
- `NEXTAUTH_SECRET` — сгенерировать: `openssl rand -base64 32`.
- `NEXTAUTH_URL` и `APP_URL` = `https://sdelkasafe.ru`.
- `TELEGRAM_BOT_TOKEN`, `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`.
- `PLATFORM_TON_WALLET` — адрес кошелька платформы.
- SMTP — если нужна отправка писем.

> `DATABASE_URL` для контейнера web подставляется автоматически в docker-compose
> (`postgres:5432`), отдельно настраивать не нужно.

## 6. Запуск контейнеров
```bash
docker compose up -d --build
docker compose logs -f web   # дождаться "Ready", затем Ctrl+C
```
Схема БД применяется автоматически при старте контейнера (`prisma db push`).

Создать админа и тестовые данные (один раз, по желанию):
```bash
docker compose exec web npm run db:seed
```
(после этого смените пароль admin@sdelkasafe.ru в интерфейсе или удалите тестовых юзеров).

Проверка локально на сервере:
```bash
curl -I http://127.0.0.1:3000   # должен ответить 200
```

## 7. Nginx
```bash
cp nginx.conf /etc/nginx/sites-available/sdelkasafe.ru
ln -s /etc/nginx/sites-available/sdelkasafe.ru /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```
Теперь по `http://sdelkasafe.ru` должен открываться сайт.

## 8. SSL (HTTPS)
```bash
certbot --nginx -d sdelkasafe.ru -d www.sdelkasafe.ru
```
Certbot сам пропишет SSL в конфиг и настроит редирект на HTTPS. Автопродление уже
включено (`systemctl status certbot.timer`).

## 9. Telegram на проде
1. В @BotFather: `/setdomain` → `sdelkasafe.ru` (для входа через виджет).
2. Mini App: Bot Settings → Menu Button (или `/newapp`) → URL `https://sdelkasafe.ru/app`.
3. Зарегистрировать вебхук (один раз), открыв в браузере:
   `https://sdelkasafe.ru/api/telegram/setup?action=set-webhook`
4. Узнать username бота, если не уверены: `https://sdelkasafe.ru/api/telegram/setup`

## 10. Обновление версии
```bash
cd /opt/sdelkasafe
git pull            # или заново scp файлы
docker compose up -d --build
```
Загруженные фото и база сохраняются (docker volumes `uploads`, `pgdata`).

## 11. Бэкап базы (рекомендуется)
Разовый дамп:
```bash
docker compose exec postgres pg_dump -U sdelka sdelka_db > backup_$(date +%F).sql
```
Автобэкап ежедневно (crontab -e):
```
0 3 * * * cd /opt/sdelkasafe && docker compose exec -T postgres pg_dump -U sdelka sdelka_db > /opt/backups/sdelka_$(date +\%F).sql
```
(создайте папку `/opt/backups`).

---

## Частые проблемы
- **502 Bad Gateway** — контейнер web не поднялся: `docker compose logs web`.
- **Prisma не видит БД** — проверьте, что postgres healthy: `docker compose ps`.
- **Вход через Telegram не работает** — не сделан `/setdomain` или домен без HTTPS.
- **Письма не уходят** — не заполнены `SMTP_*` (без них коды видны только в dev).
- **Большие фото не грузятся** — увеличьте `client_max_body_size` в nginx.conf.
