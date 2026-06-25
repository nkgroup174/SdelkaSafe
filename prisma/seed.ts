import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sdelkasafe.ru" },
    update: {},
    create: { email: "admin@sdelkasafe.ru", password: pass, name: "Админ", role: "ADMIN" },
  });

  const supplier = await prisma.user.upsert({
    where: { email: "supplier@sdelkasafe.ru" },
    update: {},
    create: {
      email: "supplier@sdelkasafe.ru",
      password: pass,
      name: 'ООО "ОптТорг"',
      role: "SUPPLIER",
      isVerified: true,
      tonWallet: "UQ_DEMO_supplier_wallet_replace_me",
      balanceRub: 5000,
    },
  });

  await prisma.user.upsert({
    where: { email: "buyer@sdelkasafe.ru" },
    update: {},
    create: { email: "buyer@sdelkasafe.ru", password: pass, name: "Закупщик", role: "CUSTOMER" },
  });

  // Демо-объявления (одобренные) по разным категориям обоих каталогов
  const products = [
    { title: "Цемент М500, мешок 50 кг", category: "stroymaterialy", priceRub: 420, moq: 100, stock: 5000, brand: "Holcim" },
    { title: "Светодиодные панели 40 Вт", category: "elektrika", priceRub: 890, moq: 50, stock: 1200, brand: "Gauss" },
    { title: "Профлист С8 оцинкованный", category: "metalloprokat", priceRub: 650, moq: 200, stock: 8000, brand: "ММК" },
    { title: "Гофрокороб 600×400×400", category: "upakovka", priceRub: 78, moq: 500, stock: 30000, brand: "—" },
    { title: "Перчатки нитриловые (уп. 100 шт)", category: "med-tovary", priceRub: 540, moq: 50, stock: 2000, brand: "Mediok" },
    { title: "Кабель ВВГнг 3×2.5 (бухта 100 м)", category: "elektrika", priceRub: 6200, moq: 10, stock: 300, brand: "Севкабель" },
  ];

  const services = [
    { title: "Грузоперевозки фурой 20 т по РФ", category: "gruzoperevozki", priceRub: 45000, unit: "PROJECT", duration: "1–3 дня" },
    { title: "Ответственное хранение, паллето-место", category: "sklad-hranenie", priceRub: 35, unit: "DAY", duration: "от 1 дня" },
    { title: "Бухгалтерское сопровождение ООО", category: "buhgalteriya", priceRub: 18000, unit: "MONTH", duration: "ежемесячно" },
    { title: "Разработка сайта-каталога", category: "it-razrabotka", priceRub: 120000, unit: "PROJECT", duration: "3–4 недели" },
    { title: "Таможенное оформление импорта", category: "ved-tamozhnya", priceRub: 25000, unit: "PROJECT", duration: "2–5 дней" },
    { title: "Клининг офиса, разовый", category: "klining", priceRub: 4500, unit: "PROJECT", duration: "1 день" },
  ];

  for (const p of products) {
    await prisma.listing.create({
      data: {
        type: "PRODUCT",
        status: "APPROVED",
        supplierId: supplier.id,
        title: p.title,
        description: `${p.title}. Оптовая поставка от проверенного поставщика. Оплата в TON.`,
        category: p.category,
        priceRub: p.priceRub,
        moq: p.moq,
        stock: p.stock,
        brand: p.brand,
      },
    });
  }

  for (const s of services) {
    await prisma.listing.create({
      data: {
        type: "SERVICE",
        status: "APPROVED",
        supplierId: supplier.id,
        title: s.title,
        description: `${s.title}. Услуга для бизнеса. Оплата в TON по курсу на момент сделки.`,
        category: s.category,
        priceRub: s.priceRub,
        unit: s.unit as "HOUR" | "DAY" | "PROJECT" | "MONTH",
        duration: s.duration,
      },
    });
  }

  // Демо-промокоды
  await prisma.promoCode.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", type: "PERCENT", value: 10, minOrderRub: 0 },
  });
  await prisma.promoCode.upsert({
    where: { code: "SALE500" },
    update: {},
    create: { code: "SALE500", type: "FIXED", value: 500, minOrderRub: 5000 },
  });

  console.log("Seed готово. Пользователи: admin@/supplier@/buyer@sdelkasafe.ru, пароль password123");
  console.log("Промокоды: WELCOME10 (-10%), SALE500 (-500₽ от 5000₽)");
  console.log("Admin id:", admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
