/**
 * Content model for the Rhyno ERP site.
 *
 * Module detail (summary / sub-features / endpoints / business value) and the
 * feature matrix + FAQ are parsed from docs/website_showcase_data.md so the
 * source document stays the single source of truth. Everything else is
 * curated, user-facing marketing copy (no internal tech jargon).
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DOC = join(here, "..", "docs", "website_showcase_data.md");

export const SITE = {
  name: "راینو ERP",
  legalName: "راینو",
  baseUrl: "https://www.rhynoai.ir",
  tagline: "مرکز فرماندهی یکپارچه سازمان",
  description:
    "راینو ERP؛ پلتفرم فارسی و یکپارچه مالی، منابع انسانی، قرارداد، انبار، کارتابل و مالیات برای سازمان‌های ایرانی.",
  enamadVerifyId: "19453737",
  enamadSeal: {
    href: "https://trustseal.enamad.ir/?id=642420&Code=snXTJxUEZgVAphAqD5lpep29PJRZ2haT",
    src: "https://trustseal.enamad.ir/logo.aspx?id=642420&Code=snXTJxUEZgVAphAqD5lpep29PJRZ2haT",
  },
  contact: {
    phone: "021-77439141",
    phoneHref: "+982177439141",
    mobile: "0919-5920275",
    mobileHref: "+989195920275",
    whatsapp: "0998-1371524",
    whatsappHref: "https://wa.me/989981371524",
    telegram: "@Rhynoai",
    telegramHref: "https://t.me/Rhynoai",
    email: "info@rhynoai.ir",
    hours: "شنبه تا چهارشنبه، ۹ صبح تا ۵ عصر",
    address: "تهران، ایران",
  },
  demoEndpoint: "https://api.web3forms.com/submit",
  demoAccessKey: "769de252-a7a4-4379-8c51-a7a24f1dd5d8",
};

/* ------------------------------------------------------------------
   Categories — 5 groups covering all 15 modules
   ------------------------------------------------------------------ */

export const CATEGORIES = [
  { id: "finance", label: "مالی و حسابداری", icon: "landmark" },
  { id: "hr", label: "منابع انسانی", icon: "users" },
  { id: "contracts", label: "قراردادها", icon: "signature" },
  { id: "warehouse", label: "انبار و بازرگانی", icon: "warehouse" },
  { id: "automation", label: "اتوماسیون و امنیت", icon: "flow" },
];

/* ------------------------------------------------------------------
   Modules — slug, category, icon + marketing angle.
   Detail content is parsed from the showcase document below.
   ------------------------------------------------------------------ */

const MODULE_META = [
  {
    ref: "3.1",
    slug: "dashboard",
    name: "داشبورد مرکزی",
    category: "automation",
    icon: "dashboard",
    short: "تصویر واحد از وضعیت سازمان، سررسیدها و کارهای در انتظار",
    audience: "مدیرعامل، مدیران ارشد",
  },
  {
    ref: "3.2",
    slug: "human-capital",
    name: "منابع انسانی",
    category: "hr",
    icon: "users",
    short: "پرونده کارکنان، مرخصی، وام، حضور و غیاب و بیمه",
    audience: "مدیر منابع انسانی",
  },
  {
    ref: "3.3",
    slug: "payroll",
    name: "حقوق و دستمزد",
    category: "hr",
    icon: "wallet",
    short: "محاسبه، کنترل کیفیت، فیش حقوقی و خروجی گروهی",
    audience: "مدیر مالی و منابع انسانی",
  },
  {
    ref: "3.4",
    slug: "finance",
    name: "حسابداری و خزانه",
    category: "finance",
    icon: "landmark",
    short: "فاکتور، سند حسابداری، دفتر کل، تراز و بستن دوره",
    audience: "مدیر مالی، حسابدار",
  },
  {
    ref: "3.5",
    slug: "tax-mowadiyan",
    name: "مالیات و سامانه مؤدیان",
    category: "finance",
    icon: "receipt",
    short: "محاسبه مالیات، ارسال دسته‌ای و تطبیق با سامانه مؤدیان",
    audience: "مدیر مالی، ممیز مالیاتی",
  },
  {
    ref: "3.6",
    slug: "invoice-ocr",
    name: "ورود هوشمند فاکتور",
    category: "automation",
    icon: "scan",
    short: "استخراج خودکار فیلدهای فاکتور از تصویر و PDF",
    audience: "کارشناس مالی",
  },
  {
    ref: "3.7",
    slug: "contracts",
    name: "قرارداد و تعهدات",
    category: "contracts",
    icon: "signature",
    short: "چرخه کامل قرارداد از امضا تا اقساط، ضمانت و جریمه",
    audience: "مدیر قراردادها",
  },
  {
    ref: "3.8",
    slug: "commercial",
    name: "بازرگانی و فروش",
    category: "warehouse",
    icon: "cart",
    short: "پیش‌فاکتور، فاکتور فروش و خرید، برگشت و تسویه",
    audience: "مدیر فروش، کارشناس خرید",
  },
  {
    ref: "3.9",
    slug: "warehouse",
    name: "انبار و موجودی",
    category: "warehouse",
    icon: "warehouse",
    short: "رسید، حواله، انتقال، شمارش و بستن دوره انبار",
    audience: "مدیر انبار",
  },
  {
    ref: "3.10",
    slug: "office-automation",
    name: "مکاتبات و آرشیو",
    category: "automation",
    icon: "folderlock",
    short: "نامه، پاسخ، پیوست و آرشیو امن اسناد با نگهداری نسخه‌های پیشین",
    audience: "کارشناس اداری",
  },
  {
    ref: "3.11",
    slug: "workflow-inbox",
    name: "کارتابل و گردش‌کار",
    category: "automation",
    icon: "inbox",
    short: "تأیید، واگذاری، نظر و ردیابی وظایف با مهلت پاسخ",
    audience: "مدیر و کارشناس",
  },
  {
    ref: "3.12",
    slug: "security-access",
    name: "امنیت و دسترسی",
    category: "automation",
    icon: "shield",
    short: "نقش، مجوز، ورود دومرحله‌ای و تفکیک وظایف",
    audience: "مدیر سیستم",
  },
  {
    ref: "3.13",
    slug: "notifications-calendar",
    name: "اعلان و تقویم",
    category: "automation",
    icon: "bell",
    short: "اعلان‌های ماژولار و تقویم تجمیعی سازمان",
    audience: "همه کاربران",
  },
  {
    ref: "3.14",
    slug: "reports-search",
    name: "گزارش‌ساز و جست‌وجو",
    category: "finance",
    icon: "chart",
    short: "جست‌وجوی سراسری، گزارش‌های آماده و نماهای شخصی",
    audience: "همه کاربران مجاز",
  },
  {
    ref: "3.15",
    slug: "base-data",
    name: "داده‌های پایه و بارنامه",
    category: "warehouse",
    icon: "database",
    short: "مشتری، فروشنده، کالا و اسناد حمل در یک مرجع واحد",
    audience: "مدیر سیستم",
  },
];

/* ------------------------------------------------------------------
   Markdown parsing
   ------------------------------------------------------------------ */

function readDoc() {
  try {
    return readFileSync(DOC, "utf8");
  } catch {
    throw new Error(`Showcase document not found at ${DOC}`);
  }
}

function cleanInline(text) {
  return text
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function parseModules(md) {
  const section = md.split(/^## 4\./m)[0];
  const blocks = section.split(/^### 3\./m).slice(1);

  const parsed = new Map();
  for (const block of blocks) {
    const refMatch = block.match(/^(\d+)\s/);
    if (!refMatch) continue;
    const ref = `3.${refMatch[1]}`;
    const lines = block.split(/\r?\n/);

    let summary = "";
    let value = "";
    let endpoints = "";
    const features = [];

    let mode = null;
    for (const raw of lines.slice(1)) {
      const line = raw.trim();
      if (!line) continue;

      if (/^\*\*شرح خلاصه ماژول:/.test(line)) {
        summary = cleanInline(line.replace(/^\*\*شرح خلاصه ماژول:?\*\*/, ""));
        mode = "summary";
        continue;
      }
      if (/^\*\*(ریز-امکانات|جدول یا لیست تفکیکی)/.test(line)) {
        mode = "features";
        continue;
      }
      if (/^\*\*.*(اندپوینت|APIهای شاخص|مسیرهای شاخص)/.test(line)) {
        endpoints = cleanInline(line.replace(/^\*\*[^*]*\*\*/, ""));
        mode = null;
        continue;
      }
      if (/^\*\*کاربرد تجاری/.test(line)) {
        value = cleanInline(line.replace(/^\*\*[^*]*\*\*/, ""));
        mode = "value";
        continue;
      }

      if (mode === "features" && line.startsWith("- ")) {
        features.push(cleanInline(line.slice(2)));
      } else if (mode === "summary" && !line.startsWith("**")) {
        summary = cleanInline(`${summary} ${line}`);
      } else if (mode === "value" && !line.startsWith("**")) {
        value = cleanInline(`${value} ${line}`);
      }
    }

    parsed.set(ref, { summary, value, features, endpoints });
  }
  return parsed;
}

function parseMatrix(md) {
  const section = md.split(/^## 6\./m)[1];
  if (!section) return [];
  const rows = [];
  for (const line of section.split(/\r?\n/)) {
    const t = line.trim();
    if (!t.startsWith("|")) continue;
    const cells = t
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim());
    if (cells.length !== 4) continue;
    if (cells[0] === "نام امکان" || /^-+$/.test(cells[0])) continue;
    rows.push({
      feature: cells[0],
      module: cells[1],
      role: cells[2],
      kind: cells[3],
    });
  }
  return rows;
}

function parseFaq(md) {
  const section = md.split(/^## 7\./m)[1];
  if (!section) return [];
  const out = [];
  const re = /^###\s*(.+)$/gm;
  const heads = [];
  let m;
  while ((m = re.exec(section))) heads.push({ title: m[1], index: m.index, end: m.index + m[0].length });

  heads.forEach((h, i) => {
    const bodyEnd = i + 1 < heads.length ? heads[i + 1].index : section.length;
    const body = section.slice(h.end, bodyEnd).trim();
    out.push({
      q: cleanInline(h.title.replace(/^[۰-۹0-9]+\.\s*/, "")),
      a: cleanInline(body),
    });
  });
  return out;
}

/* ------------------------------------------------------------------
   Public content
   ------------------------------------------------------------------ */

const md = readDoc();
const moduleDetails = parseModules(md);

/* User-facing rewrites for internal-technology wording that appears in the
   source document. Technical detail lives on /security.html instead. */
const SANITIZE = [
  [/گزارش AI از SQL Server/g, "گزارش‌گیری هوشمند از داده‌های سازمان"],
  [/خواندن اسکیمای SQL Server/g, "خواندن ساختار پایگاه داده سازمان"],
  [/گزارش هوشمند مدیریتی با کنترل امنیت SQL و خروجی داده‌های محدود/g, "گزارش مدیریتی هوشمند با کنترل دسترسی و خروجی داده‌های محدود"],
  [/حسابرسی و خروجی SIEM/g, "گزارش حسابرسی برای ممیز"],
  [/داشبورد مدیریتی و KPI/g, "داشبورد مدیریتی و شاخص‌ها"],
  [/OCR فاکتور/g, "ورود خودکار فاکتور از تصویر"],
  [/پردازش ZIP و وب‌هوک/g, "دریافت گروهی فاکتور"],
  [/Kanban وظایف/g, "تخته‌ی وظایف"],
  [/Workflow Builder/g, "طراحی گرافیکی گردش‌کار"],
  [/MFA و تغییر رمز/g, "ورود دومرحله‌ای و تغییر رمز"],
  [/واگذاری و SLA/g, "واگذاری وظیفه و مهلت پاسخ"],
  [/API و وب‌هوک ERP/g, "اتصال به سامانه‌های دیگر سازمان"],
  [/خروجی‌های Excel\/PDF/g, "خروجی اکسل و PDF"],
  [/نسخه‌بندی پیوست/g, "نگهداری نسخه‌های پیشین پیوست"],
  [/گزارش درآمد و مواجهه قرارداد/g, "گزارش درآمد و تعهدات قرارداد"],
  [/خروجی عادی و SIEM/g, "خروجی گزارش عادی و امنیتی"],
  [/node\/edgeهای React Flow/g, "گره‌ها و اتصال‌های گراف"],
  [/نمودار React Flow/g, "نمودار گرافیکی گردش‌کار"],
  [/هاب SignalR برای تعاملات بلادرنگ و اعلان تغییرات/g, "ارتباط بلادرنگ برای اعلان تغییرات"],
  [/ABAC، کنترل Query، ایزولاسیون داده و ماسک‌کردن فیلدهای حساس/g, "سیاست دسترسی مبتنی بر ویژگی، کنترل پرس‌وجو، جداسازی داده و پوشاندن فیلدهای حساس"],
  [/Tesseract OCR/g, "OCR فارسی"],
  [/OCR فارسی\/Tesseract/g, "OCR فارسی"],
  [/SQL Server/g, "پایگاه داده سازمان"],
  [/ASP\.NET Core/g, "بستر اجرایی سازمان"],
  [/EF Core/g, "لایه دسترسی به داده"],
  [/RabbitMQ/g, "صف پیام سازمانی"],
  [/SignalR/g, "ارتباط بلادرنگ"],
  [/ABAC/g, "سیاست دسترسی مبتنی بر ویژگی"],
  [/SIEM/g, "گزارش امنیتی"],
  [/DbContext/g, "بخش داده"],
];

const sanitize = (text) =>
  SANITIZE.reduce((acc, [re, rep]) => acc.replace(re, rep), String(text ?? ""));

export const MODULES = MODULE_META.map((meta) => {
  const detail = moduleDetails.get(meta.ref) || {
    summary: meta.short,
    value: "",
    features: [],
    endpoints: "",
  };
  const category = CATEGORIES.find((c) => c.id === meta.category);
  return {
    ...meta,
    categoryLabel: category.label,
    summary: sanitize(detail.summary || meta.short),
    value: sanitize(detail.value),
    features: detail.features.map(sanitize),
    endpoints: sanitize(detail.endpoints),
    url: `/modules/${meta.slug}.html`,
  };
});

export const MATRIX = parseMatrix(md).map((r) => ({
  feature: sanitize(r.feature),
  module: sanitize(r.module),
}));

/* FAQ answers rewritten in user-facing language (no internal jargon). */
const FAQ_ANSWERS = [
  "بله. برای چند شرکت، شعبه یا واحد سازمانی مناسب است؛ داده و تنظیمات هر مجموعه جدا نگهداری می‌شود.",
  "دسترسی هر کاربر بر اساس نقش تعیین می‌شود و هر تغییر با کاربر و زمان ثبت می‌شود. حساب‌های حساس با ورود دومرحله‌ای محافظت می‌شوند.",
  "راینو را می‌توانید روی سرورهای خودتان یا روی فضای ابری دلخواه‌تان نصب کنید. تیم ما راه‌اندازی را انجام می‌دهد و داده‌های موجود شما را هم به راینو منتقل می‌کند.",
  "بله. فاکتور کاغذی، تصویری و PDF را بارگذاری می‌کنید و شماره، تاریخ، فروشنده، اقلام و مالیات خودکار استخراج می‌شود. پیش از ثبت نهایی قابل ویرایش است.",
  "صورتحساب‌ها پس از محاسبه در صف ارسال قرار می‌گیرند. ارسال دسته‌ای انجام می‌شود، موارد ناموفق دوباره تلاش می‌شوند و مغایرت‌ها در یک گزارش نمایش داده می‌شوند.",
  "بله. مسیر تأیید هر سند را تعریف می‌کنید: چه کسی، در چه مرحله‌ای و با چه مهلتی تصمیم بگیرد. تأیید، رد و واگذاری در همه‌ی فرآیندها موجود است.",
  "بله. هر کاربر با جست‌وجوی سراسری، فیلترها و نماهای ذخیره‌شده می‌تواند میزکار خود را متناسب با مسئولیتش تنظیم کند.",
];

export const FAQ = parseFaq(md).map((item, i) => ({
  ...item,
  a: FAQ_ANSWERS[i] || item.a,
}));

export const MATRIX_MODULES = [...new Set(MATRIX.map((r) => r.module))];

/* ------------------------------------------------------------------
   Curated, user-facing copy
   ------------------------------------------------------------------ */

export const BENEFITS = [
  {
    icon: "layers",
    title: "یک سیستم به‌جای چند سامانه",
    body: "مالی، منابع انسانی، قرارداد، انبار و مالیات در یک سیستم کار می‌کنند؛ گزارش‌ها را دستی بین فایل‌ها تطبیق نمی‌دهید.",
  },
  {
    icon: "chart",
    title: "داشبورد برای هر نقش",
    body: "مدیرعامل، مدیر مالی، مدیر قرارداد و انباردار هر کدام نمای مخصوص خود را می‌بینند: سررسید، ریسک و کارهای معوق، بدون گزارش‌گیری دستی.",
  },
  {
    icon: "scan",
    title: "فاکتور کاغذی، داده‌ی ساختاریافته",
    body: "فاکتورهای تصویری و PDF را بارگذاری کنید؛ شماره، تاریخ، طرفین، اقلام و مالیات به‌صورت خودکار استخراج و آماده ثبت می‌شود.",
  },
  {
    icon: "flow",
    title: "گردش تأیید قابل تعریف",
    body: "مسیر تأیید هر سند را مشخص کنید: تأیید، رد، واگذاری، نظر و مهلت پاسخ. هر گام ثبت می‌شود و گلوگاه‌ها قابل اندازه‌گیری است.",
  },
  {
    icon: "receipt",
    title: "انطباق با نظام مالیاتی ایران",
    body: "ارزش افزوده، گزارش فصلی و ارسال صورتحساب به سامانه مؤدیان با پیگیری وضعیت، تلاش مجدد و تطبیق پاسخ سامانه.",
  },
  {
    icon: "shield",
    title: "کنترل دسترسی در سطح سازمان",
    body: "ورود دومرحله‌ای، تفکیک وظایف، ثبت کامل رویدادها و جداسازی داده‌ی هر شرکت؛ هر تغییر قابل ردیابی است.",
  },
];

export const SECURITY_POINTS = [
  {
    icon: "key",
    title: "ورود امن با یک کد اضافه",
    body: "برای حساب‌های حساس، یک کد یکبارمصرف هم لازم است.",
  },
  {
    icon: "filecheck",
    title: "هر تغییر، قابل ردیابی",
    body: "می‌بینید چه کسی، کِی و چه چیزی را تغییر داده است.",
  },
  {
    icon: "shield",
    title: "ثبت و تأیید جدا از هم",
    body: "کسی که سند را ثبت می‌کند نمی‌تواند خودش آن را تأیید کند.",
  },
  {
    icon: "database",
    title: "داده‌ی هر شرکت، جدا",
    body: "کاربران هر شرکت فقط به اطلاعات خودشان دسترسی دارند.",
  },
];

export const AI_POINTS = [
  {
    icon: "scan",
    title: "استخراج فیلد از تصویر",
    body: "تشخیص شماره فاکتور، تاریخ شمسی، فروشنده، خریدار، اقلام و مبالغ؛ با امکان ویرایش پیش از ثبت نهایی.",
  },
  {
    icon: "bot",
    title: "دستیار پرسش و پاسخ",
    body: "پرسش‌های مالی و مالیاتی را به زبان طبیعی بپرسید و پاسخ را بر پایه‌ی داده‌های واقعی سازمان دریافت کنید.",
  },
  {
    icon: "sparkles",
    title: "پیش‌نویس نامه و گزارش",
    body: "خلاصه‌سازی مکاتبات، تولید پیش‌نویس پاسخ و ساخت گزارش مدیریتی از متن درخواست شما.",
  },
];

export const TRUST_STRIP = [
  { icon: "layers", label: "یک سیستم، بدون تطبیق دستی گزارش‌ها" },
  { icon: "flow", label: "تأییدها با مهلت مشخص و قابل پیگیری" },
  { icon: "filecheck", label: "هر تغییر با کاربر و زمان ثبت می‌شود" },
];

export const SECURITY_JARGON = [
  {
    title: "معماری و پایداری داده",
    items: [
      "معماری لایه‌ای که رابط کاربری، منطق کسب‌وکار و داده را از هم جدا نگه می‌دارد",
      "پایگاه داده سازمانی با تنظیمات صریح و به‌روزرسانی ساختار مستقل برای هر بخش",
      "بخش داده‌ی جداگانه برای پلتفرم، مالی، گردش‌کار، انبار، اداری، هویت و مالیات",
      "سهمیه، کش و فضای داده‌ی مجزا برای هر مستأجر تا داده‌ها با هم مخلوط نشوند",
    ],
  },
  {
    title: "امنیت نشست و دسترسی",
    items: [
      "هویت کاربر، نقش و مجوز در یک لایه‌ی مرکزی بررسی می‌شود",
      "دسترسی بر پایه‌ی ویژگی‌های کاربر و دامنه‌ی داده، با پوشاندن فیلدهای حساس",
      "ورود دومرحله‌ای، کد بازیابی، محافظت از فرم‌ها و هدرهای امنیتی",
      "ثبت خودکار تغییرات، محدودسازی دسترسی در سطح سطر و خروجی گزارش امنیتی",
    ],
  },
  {
    title: "قابلیت اطمینان و یکپارچه‌سازی",
    items: [
      "سرویس‌های پس‌زمینه برای مهلت پاسخ، اعلان، گزارش زمان‌بندی‌شده و ارسال مؤدیان",
      "صف پیام سازمانی با ثبت رویداد و نگهداری موارد ناموفق برای تلاش مجدد",
      "اتصال نسخه‌گذاری‌شده برای منابع انسانی، مالی، گردش‌کار، اسناد و حساب‌ها",
      "به‌روزرسانی زنده‌ی کارتابل و اعلان‌ها بدون بارگذاری صفحه",
    ],
  },
  {
    title: "هوش مصنوعی و بومی‌سازی",
    items: [
      "دستیار هوشمند، گزارش‌ساز متنی، پرسش‌وپاسخ مالیاتی و پیش‌نویس نامه",
      "کنترل ایمنی پرس‌وجو، محدودسازی گزارش و اعتبارسنجی داده پیش از نمایش",
      "تشخیص متن فارسی از تصویر، نرمال‌سازی متن و تشخیص موجودیت",
      "تقویم جلالی، واحد پول و مدل‌های مالیاتی ایران",
    ],
  },
];

export const NAV_LINKS = [
  { label: "ماژول‌ها", href: "/modules/" },
  { label: "امکانات", href: "/features.html" },
  { label: "مقالات", href: "/blog/" },
  { label: "امنیت", href: "/security.html" },
  { label: "تماس", href: "/contact.html" },
];

export const PORTAL_URL = "https://portal.rhynoai.ir";
