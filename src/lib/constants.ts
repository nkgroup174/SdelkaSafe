// Бизнес-константы платформы

// Комиссия платформы (success-fee), доля от суммы сделки
export const COMMISSION_RATE = 0.025; // 2.5%

// Кошелёк платформы для приёма депозитов комиссии (заполнить реальным адресом TON)
export const PLATFORM_TON_WALLET =
  process.env.PLATFORM_TON_WALLET ?? "EQ...PLACEHOLDER";

// Продвижение объявления (буст)
export const BOOST_COST_RUB = 199;
export const BOOST_DAYS = 7;

export type Category = { slug: string; name: string };

// ───────── Каталог ТОВАРОВ (24 категории) ─────────
export const PRODUCT_CATEGORIES: Category[] = [
  { slug: "stroymaterialy", name: "Стройматериалы" },
  { slug: "elektronika", name: "Электроника и техника" },
  { slug: "oborudovanie", name: "Промышленное оборудование" },
  { slug: "instrument", name: "Инструменты" },
  { slug: "metalloprokat", name: "Металлопрокат" },
  { slug: "produkty", name: "Продукты питания" },
  { slug: "napitki", name: "Напитки" },
  { slug: "odezhda-tekstil", name: "Одежда и текстиль" },
  { slug: "obuv", name: "Обувь" },
  { slug: "mebel", name: "Мебель" },
  { slug: "bytovaya-himiya", name: "Бытовая химия" },
  { slug: "kosmetika", name: "Косметика и парфюмерия" },
  { slug: "avtotovary", name: "Автотовары и запчасти" },
  { slug: "elektrika", name: "Электрика и кабель" },
  { slug: "santehnika", name: "Сантехника" },
  { slug: "upakovka", name: "Упаковка и тара" },
  { slug: "kanctovary", name: "Канцтовары" },
  { slug: "selhoz", name: "Сельхозпродукция" },
  { slug: "med-tovary", name: "Медицинские товары" },
  { slug: "sport", name: "Спорт и отдых" },
  { slug: "detskie-tovary", name: "Детские товары" },
  { slug: "zoo", name: "Зоотовары" },
  { slug: "syrye", name: "Сырьё и материалы" },
  { slug: "elektronnye-sigarety", name: "Электронные сигареты" },
  { slug: "tabak", name: "Табак и аксессуары" },
  { slug: "bytovaya-tehnika", name: "Бытовая техника" },
  { slug: "kompyutery", name: "Компьютеры и комплектующие" },
  { slug: "telefony", name: "Телефоны и гаджеты" },
  { slug: "yuvelirnye", name: "Ювелирные изделия и часы" },
  { slug: "posuda", name: "Посуда и кухонная утварь" },
  { slug: "osveshchenie", name: "Освещение" },
  { slug: "krepezh", name: "Крепёж и метизы" },
  { slug: "lakokraska", name: "Краски и лаки" },
  { slug: "napolnye-pokrytiya", name: "Напольные покрытия" },
  { slug: "dveri-okna", name: "Двери и окна" },
  { slug: "sadovaya-tehnika", name: "Садовая техника и инвентарь" },
  { slug: "muzykalnye", name: "Музыкальные инструменты" },
  { slug: "tekstil-dom", name: "Текстиль для дома" },
  { slug: "igrushki", name: "Игрушки" },
  { slug: "knigi", name: "Книги и печатная продукция" },
  { slug: "prochee-tovary", name: "Прочие товары" },
];

// ───────── Каталог УСЛУГ (22 категории) ─────────
export const SERVICE_CATEGORIES: Category[] = [
  { slug: "logistika", name: "Логистика и доставка" },
  { slug: "gruzoperevozki", name: "Грузоперевозки" },
  { slug: "sklad-hranenie", name: "Складское хранение" },
  { slug: "montazh-remont", name: "Монтаж и ремонт" },
  { slug: "stroitelstvo", name: "Строительные работы" },
  { slug: "proizvodstvo", name: "Производство на заказ" },
  { slug: "yuridicheskie", name: "Юридические услуги" },
  { slug: "buhgalteriya", name: "Бухгалтерия и аудит" },
  { slug: "marketing", name: "Маркетинг и реклама" },
  { slug: "it-razrabotka", name: "IT и разработка" },
  { slug: "dizayn", name: "Дизайн и брендинг" },
  { slug: "perevody", name: "Переводы" },
  { slug: "konsalting", name: "Консалтинг" },
  { slug: "klining", name: "Клининг" },
  { slug: "ohrana", name: "Охрана и безопасность" },
  { slug: "obsluzhivanie-oborud", name: "Обслуживание оборудования" },
  { slug: "personal-autsorsing", name: "Аутсорсинг персонала" },
  { slug: "obuchenie", name: "Обучение и тренинги" },
  { slug: "ved-tamozhnya", name: "ВЭД и таможня" },
  { slug: "sertifikatsiya", name: "Сертификация и оценка" },
  { slug: "foto-video", name: "Фото и видео" },
  { slug: "remont-tehniki", name: "Ремонт техники" },
  { slug: "avtoservis", name: "Автосервис и шиномонтаж" },
  { slug: "pereezdy", name: "Переезды и сборка мебели" },
  { slug: "kurerskie", name: "Курьерские услуги" },
  { slug: "poligrafiya", name: "Полиграфия и печать" },
  { slug: "smm", name: "SMM и соцсети" },
  { slug: "kopiraiting", name: "Копирайтинг и контент" },
  { slug: "dizayn-interyera", name: "Дизайн интерьера" },
  { slug: "otsenka-strahovanie", name: "Оценка и страхование" },
  { slug: "finansovye", name: "Финансовые услуги" },
  { slug: "dezinfekciya", name: "Дезинфекция и дезинсекция" },
  { slug: "ozelenenie", name: "Озеленение и благоустройство" },
  { slug: "eventy", name: "Организация мероприятий" },
  { slug: "kadastr", name: "Кадастр и геодезия" },
  { slug: "prochee-uslugi", name: "Прочие услуги" },
];

export function commissionRub(amountRub: number): number {
  return Math.round(amountRub * COMMISSION_RATE * 100) / 100;
}

export function categoryName(slug: string): string {
  return (
    [...PRODUCT_CATEGORIES, ...SERVICE_CATEGORIES].find((c) => c.slug === slug)
      ?.name ?? slug
  );
}

// ───────── Подкатегории (двухуровневый каталог, как на Авито) ─────────
export const SUBCATEGORIES: Record<string, Category[]> = {
  elektronika: [
    { slug: "audio", name: "Аудиотехника" },
    { slug: "foto", name: "Фото и видеокамеры" },
    { slug: "tv", name: "Телевизоры" },
    { slug: "umnyy-dom", name: "Умный дом" },
    { slug: "aksessuary-el", name: "Аксессуары" },
  ],
  telefony: [
    { slug: "smartfony", name: "Смартфоны" },
    { slug: "knopochnye", name: "Кнопочные телефоны" },
    { slug: "plansheti", name: "Планшеты" },
    { slug: "umnye-chasy", name: "Умные часы" },
    { slug: "chehly", name: "Чехлы и аксессуары" },
  ],
  kompyutery: [
    { slug: "noutbuki", name: "Ноутбуки" },
    { slug: "pk", name: "Настольные ПК" },
    { slug: "komplektuyushchie", name: "Комплектующие" },
    { slug: "periferiya", name: "Периферия" },
    { slug: "seti", name: "Сетевое оборудование" },
  ],
  "bytovaya-tehnika": [
    { slug: "krupnaya", name: "Крупная техника" },
    { slug: "melkaya", name: "Мелкая техника" },
    { slug: "klimat", name: "Климатическая техника" },
    { slug: "vstraivaemaya", name: "Встраиваемая техника" },
  ],
  stroymaterialy: [
    { slug: "smesi", name: "Сухие смеси" },
    { slug: "pilomaterialy", name: "Пиломатериалы" },
    { slug: "krovlya", name: "Кровля" },
    { slug: "izolyaciya", name: "Изоляция" },
    { slug: "bloki-kirpich", name: "Блоки и кирпич" },
  ],
  avtotovary: [
    { slug: "zapchasti", name: "Запчасти" },
    { slug: "shiny-diski", name: "Шины и диски" },
    { slug: "masla", name: "Масла и жидкости" },
    { slug: "aksessuary-avto", name: "Аксессуары" },
  ],
  "odezhda-tekstil": [
    { slug: "muzhskaya", name: "Мужская одежда" },
    { slug: "zhenskaya", name: "Женская одежда" },
    { slug: "specodezhda", name: "Спецодежда" },
    { slug: "tkani", name: "Ткани" },
  ],
  mebel: [
    { slug: "korpusnaya", name: "Корпусная мебель" },
    { slug: "myagkaya", name: "Мягкая мебель" },
    { slug: "ofisnaya", name: "Офисная мебель" },
    { slug: "kuhni", name: "Кухни" },
  ],
  instrument: [
    { slug: "elektroinstrument", name: "Электроинструмент" },
    { slug: "ruchnoy", name: "Ручной инструмент" },
    { slug: "rashodniki", name: "Расходники и оснастка" },
  ],
  "elektronnye-sigarety": [
    { slug: "ustroystva", name: "Устройства (POD, моды)" },
    { slug: "zhidkosti", name: "Жидкости" },
    { slug: "odnorazki", name: "Одноразовые" },
    { slug: "aksessuary-vape", name: "Аксессуары и комплектующие" },
  ],
  // Услуги
  "it-razrabotka": [
    { slug: "sayty", name: "Сайты" },
    { slug: "mobilnye", name: "Мобильные приложения" },
    { slug: "boty", name: "Боты и автоматизация" },
    { slug: "podderzhka", name: "Поддержка и DevOps" },
  ],
  logistika: [
    { slug: "po-gorodu", name: "По городу" },
    { slug: "mezhgorod", name: "Межгород" },
    { slug: "mezhdunarodnaya", name: "Международная" },
  ],
  "montazh-remont": [
    { slug: "otdelka", name: "Отделочные работы" },
    { slug: "santeh-montazh", name: "Сантехника" },
    { slug: "elektromontazh", name: "Электромонтаж" },
  ],
  // ── Товары (дополнительно) ──
  metalloprokat: [
    { slug: "armatura", name: "Арматура" },
    { slug: "list-metall", name: "Листовой металл" },
    { slug: "truby", name: "Трубы" },
    { slug: "profil", name: "Профиль и уголок" },
  ],
  produkty: [
    { slug: "bakaleya", name: "Бакалея" },
    { slug: "konservy", name: "Консервы" },
    { slug: "zamorozka", name: "Заморозка" },
    { slug: "konditerka", name: "Кондитерские изделия" },
    { slug: "molochka", name: "Молочная продукция" },
  ],
  napitki: [
    { slug: "voda", name: "Вода" },
    { slug: "soki", name: "Соки" },
    { slug: "gazirovka", name: "Газированные напитки" },
    { slug: "kofe-chay", name: "Кофе и чай" },
    { slug: "energetiki", name: "Энергетики" },
  ],
  obuv: [
    { slug: "muzhskaya-obuv", name: "Мужская обувь" },
    { slug: "zhenskaya-obuv", name: "Женская обувь" },
    { slug: "detskaya-obuv", name: "Детская обувь" },
    { slug: "specobuv", name: "Спецобувь" },
  ],
  kosmetika: [
    { slug: "uhod", name: "Уход за кожей" },
    { slug: "makiyazh", name: "Макияж" },
    { slug: "parfyum", name: "Парфюмерия" },
    { slug: "volosy", name: "Уход за волосами" },
  ],
  elektrika: [
    { slug: "kabel", name: "Кабель и провод" },
    { slug: "avtomaty", name: "Автоматы и щиты" },
    { slug: "rozetki", name: "Розетки и выключатели" },
    { slug: "lampy", name: "Лампы" },
  ],
  santehnika: [
    { slug: "smesiteli", name: "Смесители" },
    { slug: "trubo-fitingi", name: "Трубы и фитинги" },
    { slug: "vanny-dushi", name: "Ванны и душевые" },
    { slug: "unitazy", name: "Унитазы и раковины" },
  ],
  upakovka: [
    { slug: "korobki", name: "Коробки и гофротара" },
    { slug: "plenka", name: "Плёнка и скотч" },
    { slug: "pakety", name: "Пакеты" },
    { slug: "etiketki", name: "Этикетки" },
  ],
  "med-tovary": [
    { slug: "rashodniki", name: "Расходные материалы" },
    { slug: "siz", name: "СИЗ и перчатки" },
    { slug: "pribory", name: "Приборы" },
  ],
  sport: [
    { slug: "trenazhery", name: "Тренажёры" },
    { slug: "inventar", name: "Инвентарь" },
    { slug: "ekipirovka", name: "Экипировка" },
    { slug: "turizm", name: "Туризм и отдых" },
  ],
  "detskie-tovary": [
    { slug: "igrushki-det", name: "Игрушки" },
    { slug: "kolyaski", name: "Коляски и автокресла" },
    { slug: "pitanie-det", name: "Детское питание" },
    { slug: "odezhda-det", name: "Детская одежда" },
  ],
  yuvelirnye: [
    { slug: "izdeliya-zoloto", name: "Золото" },
    { slug: "izdeliya-serebro", name: "Серебро" },
    { slug: "chasy", name: "Часы" },
    { slug: "bizhuteriya", name: "Бижутерия" },
  ],
  // ── Услуги (дополнительно) ──
  gruzoperevozki: [
    { slug: "gazel", name: "Газель" },
    { slug: "fura", name: "Фуры" },
    { slug: "refrizherator", name: "Рефрижераторы" },
    { slug: "negabarit", name: "Негабарит" },
  ],
  stroitelstvo: [
    { slug: "doma", name: "Строительство домов" },
    { slug: "fundament", name: "Фундаментные работы" },
    { slug: "krovelnye", name: "Кровельные работы" },
    { slug: "demontazh", name: "Демонтаж" },
  ],
  yuridicheskie: [
    { slug: "registraciya", name: "Регистрация бизнеса" },
    { slug: "dogovory", name: "Договоры и сопровождение" },
    { slug: "sudy", name: "Суды и споры" },
    { slug: "bankrotstvo", name: "Банкротство" },
  ],
  buhgalteriya: [
    { slug: "vedenie", name: "Ведение учёта" },
    { slug: "otchetnost", name: "Отчётность" },
    { slug: "zarplata", name: "Расчёт зарплаты" },
    { slug: "audit", name: "Аудит" },
  ],
  marketing: [
    { slug: "kontekst", name: "Контекстная реклама" },
    { slug: "seo", name: "SEO-продвижение" },
    { slug: "target", name: "Таргетированная реклама" },
    { slug: "brending", name: "Брендинг" },
  ],
  klining: [
    { slug: "ofisy", name: "Уборка офисов" },
    { slug: "posle-remonta", name: "После ремонта" },
    { slug: "okna-klining", name: "Мойка окон" },
    { slug: "himchistka", name: "Химчистка" },
  ],
  avtoservis: [
    { slug: "to", name: "ТО и диагностика" },
    { slug: "shinomontazh", name: "Шиномонтаж" },
    { slug: "kuzov", name: "Кузовной ремонт" },
    { slug: "elektrika-avto", name: "Автоэлектрика" },
  ],
};

export function subcategoriesFor(category?: string): Category[] {
  return (category && SUBCATEGORIES[category]) || [];
}

export function subcategoryName(category: string, slug: string): string {
  return SUBCATEGORIES[category]?.find((s) => s.slug === slug)?.name ?? slug;
}
