# Production Dockerfile — Next.js + Prisma
FROM node:22-alpine

# Prisma на Alpine требует совместимости libc и openssl
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Зависимости (кэшируемый слой)
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Исходники
COPY . .

# Prisma client + сборка Next
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# При старте: применяем схему к БД и запускаем сервер
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run start"]
