# Установка и запуск SdelkaSafe 2.0 (Windows PowerShell)
# Запуск:  .\setup.ps1
# Перед запуском убедись, что Docker Desktop ЗАПУЩЕН (иконка кита в трее не серая).

$ErrorActionPreference = "Stop"

Write-Host "==> 1/6 Проверяю .env" -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "    Создал .env из .env.example" -ForegroundColor Green
}

Write-Host "==> 2/6 Устанавливаю зависимости" -ForegroundColor Cyan
npm install

Write-Host "==> 3/6 Генерирую Prisma Client" -ForegroundColor Cyan
npx prisma generate

Write-Host "==> 4/6 Поднимаю PostgreSQL в Docker" -ForegroundColor Cyan
docker compose up -d postgres

Write-Host "    Жду готовности базы..." -ForegroundColor DarkGray
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    docker exec sdelka-postgres pg_isready -U sdelka 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
}
if (-not $ready) {
    Write-Host "    База не ответила. Проверь, запущен ли Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "    База готова" -ForegroundColor Green

Write-Host "==> 5/6 Применяю схему и заполняю тестовыми данными" -ForegroundColor Cyan
npx prisma db push
npm run db:seed

Write-Host "==> 6/6 Готово! Запускаю dev-сервер" -ForegroundColor Cyan
Write-Host "    Открой http://localhost:3000" -ForegroundColor Green
Write-Host "    Тестовые входы (пароль password123): admin@ / supplier@ / buyer@sdelkasafe.ru" -ForegroundColor Green
npm run dev
