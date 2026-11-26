/**
 * Static site generator — zero dependencies.
 *
 * Renders every HTML page from shared header/footer partials plus the content
 * model in build/data.mjs, then writes sitemap.xml and robots.txt.
 *
 * All output goes to dist/, which is the only directory Vercel publishes —
 * so internal docs, build scripts and templates can never be served.
 *
 * Run: npm run build:pages
 */

import { writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  SITE,
  CATEGORIES,
  MODULES,
  MATRIX,
  FAQ,
  MATRIX_ROLES,
  MATRIX_KINDS,
  BENEFITS,
  SECURITY_POINTS,
  AI_POINTS,
  TRUST_STRIP,
  STATS,
  SECURITY_JARGON,
  NAV_LINKS,
  PORTAL_URL,
} from "./data.mjs";
import { icon } from "./icons.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const AMP = "\u0026";
const LT = "\u003C";
const GT = "\u003E";
const QUOT = "\u0022";

const esc = (s) =>
  String(s)
    .replace(/&/g, AMP + "amp;")
    .replace(/</g, LT + "lt;")
    .replace(/>/g, GT + "gt;")
    .replace(/"/g, AMP + "quot;");

const fa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

/* clean URL for canonicals: /index.html -> /, /modules/index.html -> /modules/,
   /modules/finance.html -> /modules/finance */
const pretty = (p) =>
  p === "/index.html"
    ? "/"
    : p.replace(/\/index\.html$/, "/").replace(/\.html$/, "");

const abs = (p) => `${SITE.baseUrl}${pretty(p)}`;

/* Rewrite internal .html links to clean URLs (matches vercel cleanUrls). */
const cleanLinks = (html) =>
  html
    .replace(/href="\/index\.html"/g, 'href="/"')
    .replace(/href="\/modules\/index\.html"/g, 'href="/modules/"')
    .replace(/href="(\/(?:modules\/)?[a-z0-9-]+)\.html"/g, 'href="$1"');

const DIST = join(ROOT, "dist");

function write(relPath, html) {
  const full = join(DIST, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, cleanLinks(html), "utf8");
  return relPath;
}

/* ------------------------------------------------------------------ */
/* partials                                                            */
/* ------------------------------------------------------------------ */

function head({ title, description, path, jsonLd = [], ogType = "website" }) {
  const canonical = abs(path);
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#2563eb">
<meta name="enamad" content="${SITE.enamadId}">
<meta name="enamad" content="${SITE.enamadVerifyId}" />
<meta name="robots" content="index,follow,max-image-preview:large">

<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:locale" content="fa_IR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.baseUrl}/assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="راینو ERP — همه‌ی عملیات سازمان، در یک سیستم فارسی">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE.baseUrl}/assets/og-image.png">

<link rel="icon" href="/assets/rhyno-logo-40.png" type="image/png" sizes="40x40">
<link rel="apple-touch-icon" href="/assets/rhyno-logo-96.png">
<link rel="preload" href="/assets/fonts/Vazirmatn-VariableFont_wght.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="/css/tailwind.css">
${jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n")}
</head>`;
}

function header(activeHref) {
  const links = NAV_LINKS.map(
    (l) =>
      `<li><a href="${l.href}" class="rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
        l.href === activeHref ? "text-brand-700" : "text-ink-600 hover:text-ink-900"
      }"${l.href === activeHref ? ' aria-current="page"' : ""}>${esc(l.label)}</a></li>`
  ).join("");

  return `<a class="skip-link" href="#main">پرش به محتوای اصلی</a>
<header class="sticky top-0 z-50 border-b border-ink-200/70 bg-white/85 backdrop-blur-md">
  <div class="container-page flex h-16 items-center justify-between gap-3">
    <a href="/index.html" class="flex shrink-0 items-center gap-2.5 rounded-lg">
      <img src="/assets/rhyno-logo-40.png" alt="" width="36" height="36" class="size-9 rounded-lg object-cover" fetchpriority="high" decoding="async">
      <span class="flex flex-col leading-none">
        <span class="text-base font-extrabold text-ink-900">راینو</span>
        <span class="mt-1 text-[10px] font-semibold text-ink-500" aria-hidden="true">ERP سازمانی</span>
      </span>
    </a>

    <nav aria-label="ناوبری اصلی" class="hidden lg:block">
      <ul class="flex items-center gap-0.5">${links}</ul>
    </nav>

    <div class="hidden items-center gap-2 lg:flex">
      <a href="${PORTAL_URL}" rel="noopener" class="inline-flex h-9 items-center rounded-md px-2 text-xs font-bold text-ink-500 hover:text-ink-800">ورود به پورتال</a>
      <a href="/demo.html" class="btn btn-primary btn-sm">درخواست دمو</a>
    </div>

    <button type="button" id="navToggle" class="btn btn-ghost -me-2 p-2.5 lg:hidden" aria-expanded="false" aria-controls="mobileNav" aria-label="باز کردن منو">
      <span data-nav-icon="open">${icon("menu", "size-6")}</span>
      <span data-nav-icon="close" hidden>${icon("x", "size-6")}</span>
    </button>
  </div>

  <div id="mobileNav" hidden class="border-t border-ink-200 bg-white lg:hidden">
    <nav aria-label="ناوبری موبایل" class="container-page py-3">
      <ul class="flex flex-col">
        ${NAV_LINKS.map(
          (l) =>
            `<li><a href="${l.href}" class="block rounded-lg px-3 py-3 text-sm font-bold text-ink-700 hover:bg-ink-50"${
              l.href === activeHref ? ' aria-current="page"' : ""
            }>${esc(l.label)}</a></li>`
        ).join("\n        ")}
      </ul>
      <div class="mt-3 flex flex-col gap-2 border-t border-ink-100 pt-3">
        <a href="/demo.html" class="btn btn-primary w-full">درخواست دموی رایگان</a>
        <a href="${PORTAL_URL}" rel="noopener" class="btn btn-secondary w-full">ورود به پورتال</a>
      </div>
    </nav>
  </div>
</header>`;
}

function footer() {
  const c = SITE.contact;
  return `<footer class="border-t border-ink-200 bg-white">
  <div class="container-page py-12 lg:py-16">
    <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

      <div class="lg:col-span-1">
        <a href="/index.html" class="flex items-center gap-2.5">
          <img src="/assets/rhyno-logo-40.png" alt="" width="36" height="36" class="size-9 rounded-lg object-cover" loading="lazy" decoding="async">
          <span class="text-base font-extrabold text-ink-900">راینو ERP</span>
        </a>
        <p class="mt-4 max-w-xs text-sm leading-7 text-ink-600">
          پلتفرم یکپارچه مالی، منابع انسانی، قرارداد، انبار و مالیات برای سازمان‌های ایرانی.
        </p>
        <a referrerpolicy="origin" target="_blank" rel="noopener" href="${SITE.enamadSeal.href}" class="mt-5 inline-block">
          <img referrerpolicy="origin" src="${SITE.enamadSeal.src}" alt="نماد اعتماد الکترونیکی" width="100" height="100" loading="lazy" class="size-[100px] rounded-lg border border-ink-200 bg-white p-1">
        </a>
      </div>

      <nav aria-label="محصول">
        <h2 class="text-sm font-extrabold text-ink-900">محصول</h2>
        <ul class="mt-3 space-y-0.5 text-sm">
          <li><a href="/modules/index.html" class="flex min-h-9 items-center text-ink-600 hover:text-brand-700">همه ماژول‌ها</a></li>
          <li><a href="/features.html" class="flex min-h-9 items-center text-ink-600 hover:text-brand-700">ماتریس امکانات</a></li>
          <li><a href="/security.html" class="flex min-h-9 items-center text-ink-600 hover:text-brand-700">امنیت و انطباق</a></li>
          <li><a href="/faq.html" class="flex min-h-9 items-center text-ink-600 hover:text-brand-700">پرسش‌های متداول</a></li>
        </ul>
      </nav>

      <nav aria-label="ماژول‌های پرکاربرد">
        <h2 class="text-sm font-extrabold text-ink-900">ماژول‌های پرکاربرد</h2>
        <ul class="mt-3 space-y-0.5 text-sm">
          <li><a href="/modules/finance.html" class="flex min-h-9 items-center text-ink-600 hover:text-brand-700">حسابداری و خزانه</a></li>
          <li><a href="/modules/tax-mowadiyan.html" class="flex min-h-9 items-center text-ink-600 hover:text-brand-700">مالیات و سامانه مؤدیان</a></li>
          <li><a href="/modules/payroll.html" class="flex min-h-9 items-center text-ink-600 hover:text-brand-700">حقوق و دستمزد</a></li>
          <li><a href="/modules/contracts.html" class="flex min-h-9 items-center text-ink-600 hover:text-brand-700">قرارداد و تعهدات</a></li>
          <li><a href="/modules/invoice-ocr.html" class="flex min-h-9 items-center text-ink-600 hover:text-brand-700">ورود هوشمند فاکتور</a></li>
        </ul>
      </nav>

      <div>
        <h2 class="text-sm font-extrabold text-ink-900">تماس با ما</h2>
        <ul class="mt-4 space-y-3 text-sm">
          <li class="flex items-center gap-2.5">
            ${icon("phone", "size-4 shrink-0 text-ink-400")}
            <a href="tel:${c.phoneHref}" dir="ltr" class="flex min-h-8 items-center text-ink-600 hover:text-brand-700">${c.phone}</a>
          </li>
          <li class="flex items-center gap-2.5">
            ${icon("smartphone", "size-4 shrink-0 text-ink-400")}
            <a href="tel:${c.mobileHref}" dir="ltr" class="flex min-h-8 items-center text-ink-600 hover:text-brand-700">${c.mobile}</a>
          </li>
          <li class="flex items-center gap-2.5">
            ${icon("mail", "size-4 shrink-0 text-ink-400")}
            <a href="mailto:${c.email}" dir="ltr" class="flex min-h-8 items-center text-ink-600 hover:text-brand-700">${c.email}</a>
          </li>
          <li class="flex items-center gap-2.5">
            ${icon("clock", "size-4 shrink-0 text-ink-400")}
            <span class="flex min-h-8 items-center text-ink-600">${esc(c.hours)}</span>
          </li>
        </ul>
        <a href="/demo.html" class="btn btn-primary btn-sm mt-5">درخواست دموی رایگان</a>
      </div>
    </div>

    <div class="mt-10 flex flex-col items-center justify-between gap-3 border-t border-ink-200 pt-6 text-xs text-ink-500 sm:flex-row">
      <p>© ${fa(new Date().getFullYear())} راینو ERP — تمامی حقوق محفوظ است.</p>
      <p>${esc(SITE.contact.address)}</p>
    </div>
  </div>
</footer>
<script src="/js/site.js" defer></script>
<script>
  /* Vercel Speed Insights — only loaded on the deployed domain */
  if (/(^|\\.)vercel\\.app$|rhynoai\\.ir$/.test(location.hostname)) {
    var s = document.createElement("script");
    s.defer = true;
    s.src = "/_vercel/speed-insights/script.js";
    document.head.appendChild(s);
  }
</script>`;
}

function breadcrumbs(items) {
  const last = items.length - 1;
  return `<nav aria-label="مسیر صفحه" class="container-page pt-6">
  <ol class="flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
    ${items
      .map((it, i) =>
        i === last
          ? `<li aria-current="page" class="font-bold text-ink-700">${esc(it.label)}</li>`
          : `<li><a href="${it.href}" class="inline-flex min-h-7 items-center hover:text-brand-700">${esc(it.label)}</a></li><li aria-hidden="true">${icon(
              "chevronleft",
              "size-3.5 text-ink-300"
            )}</li>`
      )
      .join("")}
  </ol>
</nav>`;
}

function pageHeader({ eyebrow, title, lead, align = "center" }) {
  const wrap = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl";
  return `<div class="${wrap}">
  ${eyebrow ? `<p class="eyebrow ${align === "center" ? "justify-center" : ""}">${esc(eyebrow)}</p>` : ""}
  <h1 class="text-h2 font-extrabold sm:text-h1 lg:text-display">${title}</h1>
  ${lead ? `<p class="mt-4 text-lead text-ink-600">${lead}</p>` : ""}
</div>`;
}

function ctaBand() {
  return `<section class="section">
  <div class="container-page">
    <div class="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-l from-brand-50 via-white to-white p-7 sm:p-10 lg:p-12">
      <div class="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div class="max-w-xl">
          <h2 class="text-h3 font-extrabold sm:text-h2">سازمان خود را روی یک سیستم یکپارچه ببینید</h2>
          <p class="mt-3 text-sm leading-7 text-ink-600 sm:text-base">
            در یک جلسه‌ی ۳۰ دقیقه‌ای، ماژول‌های مرتبط با سازمان شما نمایش داده می‌شود و مسیر استقرار بررسی می‌شود.
          </p>
        </div>
        <div class="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
          <a href="/demo.html" class="btn btn-primary">درخواست دموی رایگان ${icon("arrowleft", "size-4")}</a>
          <a href="/modules/index.html" class="btn btn-secondary">مشاهده ماژول‌ها</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

/* Demo form ------------------------------------------------------- */

const MODULE_GROUPS = [
  { value: "all", label: "پکیج کامل سازمانی (همه ماژول‌ها)" },
  ...CATEGORIES.map((c) => ({ value: c.id, label: c.label })),
  { value: "unsure", label: "هنوز مشخص نیست" },
];

function demoForm({ id = "demoForm", compact = false }) {
  const options = MODULE_GROUPS.map((g) => `<option value="${g.value}">${esc(g.label)}</option>`).join("\n            ");

  return `<form id="${id}" class="space-y-5" novalidate
      data-endpoint="${SITE.demoEndpoint}"
      data-access-key="${SITE.demoAccessKey}">
  <div class="grid gap-5 sm:grid-cols-2">
    <div>
      <label class="label" for="${id}-name">نام و نام خانوادگی <span class="text-red-500" aria-hidden="true">*</span></label>
      <input class="field" id="${id}-name" name="name" type="text" autocomplete="name" required
             aria-describedby="${id}-name-error" placeholder="مثال: سارا محمدی">
      <p class="error-text" id="${id}-name-error" hidden></p>
    </div>
    <div>
      <label class="label" for="${id}-org">نام سازمان <span class="text-red-500" aria-hidden="true">*</span></label>
      <input class="field" id="${id}-org" name="organization" type="text" autocomplete="organization" required
             aria-describedby="${id}-org-error" placeholder="مثال: گروه صنعتی آریا">
      <p class="error-text" id="${id}-org-error" hidden></p>
    </div>
  </div>

  <div class="grid gap-5 sm:grid-cols-2">
    <div>
      <label class="label" for="${id}-phone">شماره موبایل <span class="text-red-500" aria-hidden="true">*</span></label>
      <input class="field" id="${id}-phone" name="phone" type="tel" inputmode="numeric" dir="ltr"
             autocomplete="tel" required maxlength="11" pattern="09[0-9]{9}"
             aria-describedby="${id}-phone-hint ${id}-phone-error" placeholder="09xxxxxxxxx">
      <p class="hint" id="${id}-phone-hint">۱۱ رقم، با ۰۹ شروع شود.</p>
      <p class="error-text" id="${id}-phone-error" hidden></p>
    </div>
    <div>
      <label class="label" for="${id}-module">ماژول مورد علاقه <span class="font-medium text-ink-500">(اختیاری)</span></label>
      <select class="field" id="${id}-module" name="module">
            ${options}
      </select>
    </div>
  </div>

  <div>
    <label class="label" for="${id}-message">توضیح تکمیلی <span class="font-medium text-ink-500">(اختیاری)</span></label>
    <textarea class="field" id="${id}-message" name="message" rows="${compact ? 3 : 4}"
              placeholder="تعداد پرسنل، سیستم فعلی یا زمان‌بندی مورد نظر"></textarea>
  </div>

  <div class="hidden" aria-hidden="true">
    <label for="${id}-website">وب‌سایت شرکت</label>
    <input id="${id}-website" name="company_website" type="text" tabindex="-1" autocomplete="off">
  </div>

  <button type="submit" class="btn btn-primary w-full" data-submit>
    <span data-submit-label>درخواست دموی رایگان</span>
    <span data-submit-spinner hidden>${icon("loader", "size-4 animate-spin")}</span>
    <span data-submit-arrow>${icon("arrowleft", "size-4")}</span>
  </button>

  <p class="text-center text-xs leading-6 text-ink-500">
    با ثبت درخواست، کارشناس ما در ساعات کاری با شما تماس می‌گیرد. اطلاعات شما در اختیار شخص دیگری قرار نمی‌گیرد.
  </p>

  <div data-form-status role="status" aria-live="polite" class="hidden rounded-lg border p-3.5 text-sm font-semibold"></div>
</form>`;
}

/* Matrix ---------------------------------------------------------- */

function matrixRow(r, i) {
  const kindClass =
    r.kind === "گردش‌کار" ? "badge-teal" : r.kind === "گزارش" ? "badge-amber" : "badge-neutral";
  return `<div class="matrix-row grid gap-1.5 px-4 py-4 sm:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1.1fr)_auto] sm:items-center sm:gap-4 sm:px-5"
     data-feature="${esc(r.feature)}" data-module="${esc(r.module)}" data-role="${esc(r.role)}" data-kind="${esc(r.kind)}">
  <p class="text-sm font-bold text-ink-900">${esc(r.feature)}</p>
  <p class="text-xs text-ink-500 sm:text-sm"><span class="sm:hidden">ماژول: </span><span class="badge-neutral">${esc(r.module)}</span></p>
  <p class="text-xs text-ink-600 sm:text-sm"><span class="text-ink-500 sm:hidden">کاربر: </span>${esc(r.role)}</p>
  <p class="sm:text-end"><span class="${kindClass}">${esc(r.kind)}</span></p>
</div>`;
}

function matrixBlock({ idPrefix = "matrix", heading = true }) {
  return `<div class="mt-8">
  <div class="card p-4 sm:p-5">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_13rem_12rem]">
      <div>
        <label class="label" for="${idPrefix}-search">جست‌وجو در امکانات</label>
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 end-3 flex items-center text-ink-400">${icon("search", "size-4")}</span>
          <input class="field pe-10" id="${idPrefix}-search" type="search" placeholder="مثال: OCR، بیمه، امضا، مؤدیان" autocomplete="off">
        </div>
      </div>
      <div>
        <label class="label" for="${idPrefix}-role">دسته کاربر</label>
        <select class="field" id="${idPrefix}-role">
          <option value="">همه کاربران</option>
          ${MATRIX_ROLES.map((r) => `<option value="${esc(r)}">${esc(r)}</option>`).join("\n          ")}
        </select>
      </div>
      <div>
        <label class="label" for="${idPrefix}-kind">نوع قابلیت</label>
        <select class="field" id="${idPrefix}-kind">
          <option value="">همه انواع</option>
          ${MATRIX_KINDS.map((k) => `<option value="${esc(k)}">${esc(k)}</option>`).join("\n          ")}
        </select>
      </div>
    </div>
    <div class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-3">
      <p class="text-xs font-semibold text-ink-500" data-matrix-count>نمایش ${fa(MATRIX.length)} از ${fa(MATRIX.length)} امکان</p>
      <button type="button" class="text-xs font-bold text-brand-700 hover:underline" data-matrix-reset hidden>پاک کردن فیلترها</button>
    </div>
  </div>

  <div class="card mt-4 overflow-hidden" data-matrix>
    <div class="hidden border-b border-ink-200 bg-ink-50 px-5 py-3 text-xs font-extrabold text-ink-600 sm:grid sm:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1.1fr)_auto] sm:gap-4">
      <span>نام امکان</span><span>ماژول</span><span>دسته کاربر</span><span class="text-end">نوع</span>
    </div>
    ${MATRIX.map(matrixRow).join("\n    ")}
    <p class="hidden px-5 py-10 text-center text-sm text-ink-500" data-matrix-empty>
      موردی با این فیلترها پیدا نشد. عبارت دیگری را امتحان کنید.
    </p>
  </div>
</div>`;
}

/* JSON-LD --------------------------------------------------------- */

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  alternateName: SITE.legalName,
  url: SITE.baseUrl,
  logo: `${SITE.baseUrl}/assets/rhyno-logo-96.png`,
  description: SITE.description,
  email: SITE.contact.email,
  telephone: SITE.contact.phoneHref,
  address: { "@type": "PostalAddress", addressCountry: "IR", addressLocality: "تهران" },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: SITE.contact.phoneHref,
      contactType: "sales",
      availableLanguage: ["fa"],
    },
  ],
};

const appLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE.name,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE.baseUrl,
  description: SITE.description,
  inLanguage: "fa-IR",
  offers: { "@type": "Offer", price: "0", priceCurrency: "IRR", description: "درخواست دموی رایگان" },
  featureList: MODULES.map((m) => m.name),
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/* ------------------------------------------------------------------ */
/* shared blocks                                                       */
/* ------------------------------------------------------------------ */

function benefitCard(b) {
  return `<article class="card card-hover p-6">
  <span class="icon-tile">${icon(b.icon, "size-5")}</span>
  <h3 class="mt-4 text-base font-extrabold text-ink-900">${esc(b.title)}</h3>
  <p class="mt-2 text-sm leading-7 text-ink-600">${esc(b.body)}</p>
</article>`;
}

function trustStrip() {
  return `<ul class="mt-10 grid gap-x-6 gap-y-3 border-t border-ink-200 pt-6 text-xs font-semibold text-ink-500 sm:grid-cols-2 lg:grid-cols-4">
  ${TRUST_STRIP.map(
    (t) => `<li class="flex items-center gap-2">${icon(t.icon, "size-4 shrink-0 text-teal-600")}<span>${esc(t.label)}</span></li>`
  ).join("\n  ")}
</ul>`;
}

function heroMockup() {
  const bars = [
    { h: 38, label: "فروردین" },
    { h: 58, label: "اردیبهشت" },
    { h: 46, label: "خرداد" },
    { h: 74, label: "تیر" },
    { h: 62, label: "مرداد" },
    { h: 88, label: "شهریور" },
  ];
  return `<div class="relative">
  <div class="absolute -inset-x-6 -inset-y-8 -z-10 rounded-[2rem] bg-brand-100/40 blur-2xl" aria-hidden="true"></div>
  <div class="card overflow-hidden rounded-2xl shadow-lift">
    <div class="flex items-center justify-between border-b border-ink-200 bg-ink-50/70 px-4 py-3">
      <div class="flex items-center gap-1.5" aria-hidden="true">
        <span class="size-2.5 rounded-full bg-ink-300"></span>
        <span class="size-2.5 rounded-full bg-ink-200"></span>
        <span class="size-2.5 rounded-full bg-ink-200"></span>
      </div>
      <p class="text-[11px] font-bold text-ink-500">داشبورد مدیریتی · شهریور ۱۴۰۴</p>
    </div>

    <div class="space-y-4 p-4 sm:p-5">
      <div class="grid grid-cols-3 gap-2.5">
        <div class="rounded-lg border border-ink-200 bg-white p-3">
          <p class="text-[10px] font-bold text-ink-500">فاکتورهای معوق</p>
          <p class="mt-1 text-lg font-extrabold text-ink-900">۱۲</p>
          <p class="mt-0.5 text-[10px] font-bold text-amber-700">۳ مورد امروز</p>
        </div>
        <div class="rounded-lg border border-ink-200 bg-white p-3">
          <p class="text-[10px] font-bold text-ink-500">تأیید در انتظار</p>
          <p class="mt-1 text-lg font-extrabold text-ink-900">۷</p>
          <p class="mt-0.5 text-[10px] font-bold text-ink-500">میانگین ۴ ساعت</p>
        </div>
        <div class="rounded-lg border border-ink-200 bg-white p-3">
          <p class="text-[10px] font-bold text-ink-500">ارسال مؤدیان</p>
          <p class="mt-1 text-lg font-extrabold text-ink-900">۹۸٪</p>
          <p class="mt-0.5 text-[10px] font-bold text-teal-700">بدون مغایرت</p>
        </div>
      </div>

      <div class="rounded-lg border border-ink-200 bg-white p-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-extrabold text-ink-800">روند فروش شش‌ماهه</p>
          <span class="badge-teal">${icon("trending", "size-3")} رشد ۱۸٪</span>
        </div>
        <div class="mt-4 flex h-28 items-end gap-2" role="img" aria-label="نمودار میله‌ای روند فروش شش‌ماهه با رشد صعودی">
          ${bars
            .map(
              (b, i) =>
                `<div class="flex flex-1 flex-col items-center gap-1.5">
              <div class="w-full rounded-t-md ${i === bars.length - 1 ? "bg-brand-600" : "bg-brand-200"}" style="height:${b.h}%"></div>
              <span class="text-[9px] font-semibold text-ink-500">${b.label}</span>
            </div>`
            )
            .join("\n          ")}
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between rounded-lg border border-ink-200 bg-white px-3 py-2.5">
          <span class="flex items-center gap-2 text-[11px] font-bold text-ink-700">${icon("filecheck", "size-4 text-brand-600")} فاکتور خرید ۱۰۸۴</span>
          <span class="badge-teal">تأیید شد</span>
        </div>
        <div class="flex items-center justify-between rounded-lg border border-ink-200 bg-white px-3 py-2.5">
          <span class="flex items-center gap-2 text-[11px] font-bold text-ink-700">${icon("users", "size-4 text-brand-600")} درخواست مرخصی</span>
          <span class="badge-amber">در انتظار شما</span>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

/* ------------------------------------------------------------------ */
/* pages                                                               */
/* ------------------------------------------------------------------ */

const pages = [];

/* ---------- index ---------- */
{
  const path = "/index.html";
  const title = "راینو ERP | نرم‌افزار یکپارچه مالی، منابع انسانی، قرارداد و انبار";
  const description =
    "راینو ERP، پلتفرم فارسی و یکپارچه سازمان: حسابداری، حقوق و دستمزد، قرارداد، انبار، کارتابل، OCR فاکتور و سامانه مؤدیان. درخواست دموی رایگان.";

  const body = `
<main id="main">
  <section class="relative overflow-hidden">
    <div class="pointer-events-none absolute inset-0 -z-10 grid-fade" aria-hidden="true"></div>
    <div class="container-page pt-10 pb-4 sm:pt-16">
      <div class="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div class="lg:col-span-6">
          <p class="badge">${icon("sparkles", "size-3.5")} نسخه سازمانی راینو</p>
          <h1 class="mt-5 text-h1 font-extrabold text-ink-900 sm:text-display">
            همه‌ی عملیات سازمان،<br class="hidden sm:block"> در یک سیستم فارسی
          </h1>
          <p class="mt-5 max-w-xl text-lead text-ink-600">
            مالی، منابع انسانی، قرارداد، انبار و مالیات در یک پلتفرم یکپارچه؛ با تقویم شمسی، انطباق با سامانه مؤدیان و کنترل دسترسی سازمانی.
          </p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="/demo.html" class="btn btn-primary">درخواست دموی رایگان ${icon("arrowleft", "size-4")}</a>
            <a href="/modules/index.html" class="btn btn-secondary">${icon("grid", "size-4")} کاوش ماژول‌ها</a>
          </div>
          ${trustStrip()}
        </div>
        <div class="lg:col-span-6">
          ${heroMockup()}
        </div>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="benefits-title">
    <div class="container-page">
      <div class="max-w-2xl">
        <p class="eyebrow">چرا راینو</p>
        <h2 id="benefits-title" class="text-h2 font-extrabold">مشکلات پراکندگی داده را حذف کنید</h2>
        <p class="mt-3 text-sm leading-7 text-ink-600 sm:text-base">
          بیشتر سازمان‌ها داده‌ی مالی، پرسنلی و قراردادی را در فایل‌ها و سامانه‌های جدا نگهداری می‌کنند. راینو این داده‌ها را در یک مرجع واحد جمع می‌کند.
        </p>
      </div>
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ${BENEFITS.map(benefitCard).join("\n        ")}
      </div>
    </div>
  </section>

  <section class="section border-y border-ink-200 bg-white" aria-labelledby="modules-title">
    <div class="container-page">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="max-w-2xl">
          <p class="eyebrow">ماژول‌ها</p>
          <h2 id="modules-title" class="text-h2 font-extrabold">۱۵ ماژول در ۵ گروه کاری</h2>
          <p class="mt-3 text-sm leading-7 text-ink-600 sm:text-base">
            هر ماژول به‌صورت مستقل قابل استقرار است و با بقیه‌ی ماژول‌ها داده‌ی مشترک دارد.
          </p>
        </div>
        <a href="/modules/index.html" class="btn btn-secondary btn-sm self-start sm:self-auto">همه ماژول‌ها ${icon("arrowleft", "size-3.5")}</a>
      </div>

      <div class="mt-8 space-y-8">
        ${CATEGORIES.map((cat) => {
          const items = MODULES.filter((m) => m.category === cat.id);
          return `<div>
          <div class="mb-3 flex items-center gap-2.5">
            <span class="icon-tile-sm">${icon(cat.icon, "size-4")}</span>
            <h3 class="text-sm font-extrabold text-ink-900">${esc(cat.label)}</h3>
            <span class="text-xs font-semibold text-ink-500">${fa(items.length)} ماژول</span>
          </div>
          <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            ${items
              .map(
                (m) => `<li>
              <a href="${m.url}" class="card card-hover flex h-full items-start gap-3 p-4">
                <span class="icon-tile size-9">${icon(m.icon, "size-4")}</span>
                <span class="min-w-0">
                  <span class="block text-sm font-extrabold text-ink-900">${esc(m.name)}</span>
                  <span class="mt-1 block text-xs leading-6 text-ink-500">${esc(m.short)}</span>
                </span>
              </a>
            </li>`
              )
              .join("\n            ")}
          </ul>
        </div>`;
        }).join("\n        ")}
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="ai-title">
    <div class="container-page">
      <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p class="eyebrow">هوش مصنوعی و OCR</p>
          <h2 id="ai-title" class="text-h2 font-extrabold">کاغذ را از چرخه‌ی مالی حذف کنید</h2>
          <p class="mt-3 text-sm leading-7 text-ink-600 sm:text-base">
            فاکتورهای تصویری و PDF را بارگذاری کنید؛ فیلدها استخراج و پیش از ثبت برای بازبینی نمایش داده می‌شوند.
          </p>
          <ul class="mt-7 space-y-5">
            ${AI_POINTS.map(
              (p) => `<li class="flex gap-3.5">
              <span class="icon-tile size-10">${icon(p.icon, "size-5")}</span>
              <div>
                <p class="text-sm font-extrabold text-ink-900">${esc(p.title)}</p>
                <p class="mt-1 text-sm leading-7 text-ink-600">${esc(p.body)}</p>
              </div>
            </li>`
            ).join("\n            ")}
          </ul>
          <a href="/modules/invoice-ocr.html" class="btn btn-secondary btn-sm mt-7">جزئیات ورود هوشمند فاکتور ${icon("arrowleft", "size-3.5")}</a>
        </div>

        <div class="card overflow-hidden rounded-2xl shadow-card">
          <div class="flex items-center justify-between border-b border-ink-200 bg-ink-50/70 px-4 py-3">
            <p class="text-[11px] font-bold text-ink-500">پردازش فاکتور · ۳ فایل</p>
            <span class="badge-teal">${icon("checkcircle", "size-3")} آماده بازبینی</span>
          </div>
          <div class="space-y-3 p-4 sm:p-5">
            <div class="rounded-lg border border-dashed border-brand-200 bg-brand-50/60 p-5 text-center">
              ${icon("scan", "mx-auto size-7 text-brand-600")}
              <p class="mt-2 text-xs font-bold text-ink-700">فایل فاکتور را اینجا رها کنید</p>
              <p class="mt-1 text-[11px] text-ink-500">تصویر یا PDF · تا ۱۰ مگابایت</p>
            </div>
            <div class="rounded-lg border border-ink-200 bg-white p-3.5">
              <div class="flex items-center justify-between">
                <p class="text-[11px] font-bold text-ink-700" dir="ltr">invoice-1404-0912.pdf</p>
                <span class="badge-teal">استخراج شد</span>
              </div>
              <dl class="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div><dt class="text-ink-500">شماره فاکتور</dt><dd class="font-bold text-ink-900">۱۴۰۴/۰۹۱۲</dd></div>
                <div><dt class="text-ink-500">تاریخ</dt><dd class="font-bold text-ink-900">۱۴۰۴/۰۶/۱۲</dd></div>
                <div><dt class="text-ink-500">فروشنده</dt><dd class="font-bold text-ink-900">پارس تجارت</dd></div>
                <div><dt class="text-ink-500">مبلغ کل</dt><dd class="font-bold text-ink-900">۴۸٬۲۰۰٬۰۰۰ ریال</dd></div>
              </dl>
            </div>
            <div class="rounded-lg border border-ink-200 bg-white p-3.5">
              <div class="flex items-center justify-between">
                <p class="text-[11px] font-bold text-ink-700" dir="ltr">scan-batch-02.zip</p>
                <span class="badge-amber">در صف پردازش</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section border-y border-ink-200 bg-white" aria-labelledby="security-title">
    <div class="container-page">
      <div class="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div class="lg:col-span-5">
          <p class="eyebrow">امنیت و اعتماد</p>
          <h2 id="security-title" class="text-h2 font-extrabold">دسترسی کنترل‌شده، رویداد قابل ردیابی</h2>
          <p class="mt-3 text-sm leading-7 text-ink-600 sm:text-base">
            هر کاربر فقط آنچه مجاز است می‌بیند و هر تغییر قابل استناد است؛ از ورود دومرحله‌ای تا تفکیک وظایف و جداسازی داده‌ی هر شرکت.
          </p>
          <a href="/security.html" class="btn btn-secondary btn-sm mt-6">جزئیات امنیت و انطباق ${icon("arrowleft", "size-3.5")}</a>
        </div>
        <ul class="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          ${SECURITY_POINTS.map(
            (p) => `<li class="card p-5">
            <span class="icon-tile size-9">${icon(p.icon, "size-4")}</span>
            <p class="mt-3 text-sm font-extrabold text-ink-900">${esc(p.title)}</p>
            <p class="mt-1.5 text-xs leading-6 text-ink-600">${esc(p.body)}</p>
          </li>`
          ).join("\n          ")}
        </ul>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="matrix-title">
    <div class="container-page">
      <div class="max-w-2xl">
        <p class="eyebrow">ماتریس امکانات</p>
        <h2 id="matrix-title" class="text-h2 font-extrabold">${fa(MATRIX.length)} قابلیت، قابل جست‌وجو</h2>
        <p class="mt-3 text-sm leading-7 text-ink-600 sm:text-base">
          فهرست کامل امکانات به تفکیک ماژول، کاربر و نوع قابلیت. جست‌وجو و فیلتر بدون بارگذاری صفحه انجام می‌شود.
        </p>
      </div>
      ${matrixBlock({ idPrefix: "home-matrix" })}
      <p class="mt-4 text-xs text-ink-500">
        فهرست کامل با توضیح هر ماژول در <a href="/features.html" class="font-bold text-brand-700 hover:underline">صفحه امکانات</a> موجود است.
      </p>
    </div>
  </section>

  <section class="section border-t border-ink-200 bg-white" aria-labelledby="faq-title">
    <div class="container-page">
      <div class="grid gap-10 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <p class="eyebrow">پرسش‌های متداول</p>
          <h2 id="faq-title" class="text-h2 font-extrabold">پاسخ به سوال‌های رایج</h2>
          <p class="mt-3 text-sm leading-7 text-ink-600">
            اگر پاسخ سوال خود را پیدا نکردید، در جلسه‌ی دمو می‌توانید مستقیم بپرسید.
          </p>
          <a href="/faq.html" class="btn btn-secondary btn-sm mt-6">همه پرسش‌ها ${icon("arrowleft", "size-3.5")}</a>
        </div>
        <div class="space-y-3 lg:col-span-8">
          ${FAQ.map(
            (f, i) => `<details class="accordion-item"${i === 0 ? " open" : ""}>
            <summary class="accordion-trigger">
              <span>${esc(f.q)}</span>
              ${icon("chevrondown", "accordion-chevron size-5")}
            </summary>
            <div class="accordion-panel"><p>${esc(f.a)}</p></div>
          </details>`
          ).join("\n          ")}
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="demo" aria-labelledby="demo-title">
    <div class="container-page">
      <div class="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div class="lg:col-span-5">
          <p class="eyebrow">درخواست دمو</p>
          <h2 id="demo-title" class="text-h2 font-extrabold">یک جلسه، تصویر کامل</h2>
          <p class="mt-3 text-sm leading-7 text-ink-600 sm:text-base">
            فرم را تکمیل کنید؛ کارشناس ما در ساعات کاری تماس می‌گیرد و جلسه‌ی نمایش را متناسب با ماژول‌های مورد نیاز شما تنظیم می‌کند.
          </p>
          <dl class="mt-8 grid grid-cols-2 gap-4">
            ${STATS.map(
              (s) => `<div class="card p-4">
              <dt class="text-[11px] font-bold text-ink-500">${esc(s.label)}</dt>
              <dd class="mt-1 text-xl font-extrabold text-ink-900">${esc(s.value)}</dd>
              <dd class="mt-1 text-[11px] leading-5 text-ink-500">${esc(s.note)}</dd>
            </div>`
            ).join("\n            ")}
          </dl>
        </div>
        <div class="lg:col-span-7">
          <div class="card p-5 shadow-card sm:p-7">
            ${demoForm({ id: "home-demo" })}
          </div>
        </div>
      </div>
    </div>
  </section>

  ${ctaBand()}
</main>`;

  pages.push({
    path,
    html: `${head({ title, description, path, jsonLd: [orgLd, appLd, faqLd] })}
<body class="bg-ink-25">
${header("/modules/index.html")}
${body}
${footer()}
</body>
</html>`,
  });
}

/* ---------- modules index ---------- */
{
  const path = "/modules/index.html";
  const title = "ماژول‌های راینو ERP | ۱۵ ماژول یکپارچه سازمانی";
  const description =
    "فهرست کامل ماژول‌های راینو ERP در پنج گروه: مالی و حسابداری، منابع انسانی، قراردادها، انبار و بازرگانی، اتوماسیون و امنیت.";

  const body = `
<main id="main">
  ${breadcrumbs([{ label: "صفحه اصلی", href: "/index.html" }, { label: "ماژول‌ها" }])}
  <section class="pt-8 pb-4">
    <div class="container-page">
      ${pageHeader({
        eyebrow: "ماژول‌ها",
        title: "۱۵ ماژول، یک سیستم",
        lead: "هر ماژول مستقل قابل استقرار است و با بقیه‌ی ماژول‌ها داده‌ی مشترک دارد؛ بنابراین گزارش‌ها همیشه با هم همخوان هستند.",
      })}
    </div>
  </section>

  <section class="section pt-10">
    <div class="container-page space-y-10">
      ${CATEGORIES.map((cat) => {
        const items = MODULES.filter((m) => m.category === cat.id);
        return `<div id="${cat.id}">
        <div class="mb-4 flex items-center gap-3">
          <span class="icon-tile">${icon(cat.icon, "size-5")}</span>
          <div>
            <h2 class="text-h3 font-extrabold">${esc(cat.label)}</h2>
            <p class="text-xs font-semibold text-ink-500">${fa(items.length)} ماژول</p>
          </div>
        </div>
        <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${items
            .map(
              (m) => `<li>
            <a href="${m.url}" class="card card-hover flex h-full flex-col p-5">
              <span class="icon-tile">${icon(m.icon, "size-5")}</span>
              <span class="mt-4 block text-base font-extrabold text-ink-900">${esc(m.name)}</span>
              <span class="mt-2 block flex-1 text-sm leading-7 text-ink-600">${esc(m.short)}</span>
              <span class="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-xs font-bold text-brand-700">
                <span>${esc(m.audience)}</span>
                <span class="flex items-center gap-1">جزئیات ${icon("arrowleft", "size-3.5")}</span>
              </span>
            </a>
          </li>`
            )
            .join("\n          ")}
        </ul>
      </div>`;
      }).join("\n      ")}
    </div>
  </section>

  ${ctaBand()}
</main>`;

  pages.push({
    path,
    html: `${head({ title, description, path, jsonLd: [orgLd, appLd] })}
<body class="bg-ink-25">
${header("/modules/index.html")}
${body}
${footer()}
</body>
</html>`,
  });
}

/* ---------- module detail pages ---------- */
for (const m of MODULES) {
  const path = `/modules/${m.slug}.html`;
  const title = `${m.name} | راینو ERP`;
  const description = `${m.name} در راینو ERP: ${m.short}. ${m.summary}`.slice(0, 300);
  const idx = MODULES.indexOf(m);
  const next = MODULES[(idx + 1) % MODULES.length];

  const body = `
<main id="main">
  ${breadcrumbs([
    { label: "صفحه اصلی", href: "/index.html" },
    { label: "ماژول‌ها", href: "/modules/index.html" },
    { label: m.name },
  ])}
  <section class="pt-8 pb-4">
    <div class="container-page">
      <div class="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div class="lg:col-span-8">
          <span class="badge">${icon(m.icon, "size-3.5")} ${esc(m.categoryLabel)}</span>
          <h1 class="mt-4 text-h2 font-extrabold sm:text-h1">${esc(m.name)}</h1>
          <p class="mt-4 text-lead text-ink-600">${esc(m.summary)}</p>
          <div class="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href="/demo.html" class="btn btn-primary">درخواست دموی این ماژول ${icon("arrowleft", "size-4")}</a>
            <a href="/modules/index.html" class="btn btn-secondary">همه ماژول‌ها</a>
          </div>
        </div>
        <aside class="lg:col-span-4">
          <div class="card p-5">
            <h2 class="text-sm font-extrabold text-ink-900">در یک نگاه</h2>
            <dl class="mt-4 space-y-3 text-sm">
              <div class="flex items-center justify-between gap-3">
                <dt class="text-ink-500">گروه</dt>
                <dd class="font-bold text-ink-900">${esc(m.categoryLabel)}</dd>
              </div>
              <div class="flex items-center justify-between gap-3">
                <dt class="text-ink-500">کاربران اصلی</dt>
                <dd class="text-end font-bold text-ink-900">${esc(m.audience)}</dd>
              </div>
              <div class="flex items-center justify-between gap-3">
                <dt class="text-ink-500">تعداد قابلیت</dt>
                <dd class="font-bold text-ink-900">${fa(m.features.length)} مورد</dd>
              </div>
            </dl>
            ${
              m.value
                ? `<div class="mt-5 rounded-lg border border-teal-200 bg-teal-50 p-4">
              <p class="flex items-center gap-1.5 text-xs font-extrabold text-teal-700">${icon("trending", "size-3.5")} ارزش برای سازمان</p>
              <p class="mt-1.5 text-xs leading-6 text-teal-700">${esc(m.value)}</p>
            </div>`
                : ""
            }
          </div>
        </aside>
      </div>
    </div>
  </section>

  <section class="section pt-10">
    <div class="container-page">
      <div class="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div class="lg:col-span-8">
          <h2 class="text-h3 font-extrabold">قابلیت‌های این ماژول</h2>
          <p class="mt-2 text-sm text-ink-500">${fa(m.features.length)} قابلیت، به تفکیک.</p>
          <ul class="mt-6 grid gap-2.5 sm:grid-cols-2">
            ${m.features
              .map(
                (f) => `<li class="flex items-start gap-2.5 rounded-lg border border-ink-200 bg-white p-3.5">
              ${icon("checkcircle", "mt-0.5 size-4 shrink-0 text-brand-600")}
              <span class="text-sm leading-6 text-ink-700">${esc(f)}</span>
            </li>`
              )
              .join("\n            ")}
          </ul>
        </div>

        <aside class="lg:col-span-4">
          <div class="card p-5">
            <h2 class="text-sm font-extrabold text-ink-900">ماژول‌های مرتبط</h2>
            <ul class="mt-4 space-y-2">
              ${MODULES.filter((x) => x.category === m.category && x.slug !== m.slug)
                .map(
                  (x) => `<li>
                <a href="${x.url}" class="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                  ${icon(x.icon, "size-4 text-ink-400")} ${esc(x.name)}
                </a>
              </li>`
                )
                .join("\n              ")}
            </ul>
            <a href="/features.html" class="btn btn-secondary btn-sm mt-4 w-full">ماتریس کامل امکانات</a>
          </div>
          <div class="card mt-4 p-5">
            <p class="text-sm font-extrabold text-ink-900">ماژول بعدی</p>
            <a href="${next.url}" class="mt-1 flex min-h-9 items-center justify-between gap-2 text-sm font-bold text-brand-700 hover:underline">
              <span>${esc(next.name)}</span>
              ${icon("arrowleft", "size-4")}
            </a>
          </div>
        </aside>
      </div>
    </div>
  </section>

  ${ctaBand()}
</main>`;

  pages.push({
    path,
    html: `${head({
      title,
      description,
      path,
      jsonLd: [
        orgLd,
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: `${m.name} — ${SITE.name}`,
          description: m.summary,
          provider: { "@type": "Organization", name: SITE.name, url: SITE.baseUrl },
          areaServed: "IR",
          serviceType: "Enterprise software module",
        },
      ],
    })}
<body class="bg-ink-25">
${header("/modules/index.html")}
${body}
${footer()}
</body>
</html>`,
  });
}

/* ---------- features ---------- */
{
  const path = "/features.html";
  const title = "ماتریس امکانات راینو ERP | فهرست کامل قابلیت‌ها";
  const description = `فهرست کامل ${fa(MATRIX.length)} قابلیت راینو ERP به تفکیک ماژول، دسته کاربر و نوع قابلیت؛ قابل جست‌وجو و فیلتر.`;

  const body = `
<main id="main">
  ${breadcrumbs([{ label: "صفحه اصلی", href: "/index.html" }, { label: "امکانات" }])}
  <section class="pt-8 pb-4">
    <div class="container-page">
      ${pageHeader({
        eyebrow: "امکانات",
        title: "همه‌ی قابلیت‌ها، بدون خلاصه‌سازی",
        lead: `فهرست کامل ${fa(MATRIX.length)} قابلیت به تفکیک ماژول، کاربر و نوع. جست‌وجو و فیلتر بدون بارگذاری صفحه انجام می‌شود.`,
      })}
    </div>
  </section>

  <section class="section pt-10">
    <div class="container-page">
      ${matrixBlock({ idPrefix: "features-matrix" })}
    </div>
  </section>

  <section class="section border-t border-ink-200 bg-white">
    <div class="container-page">
      <h2 class="text-h3 font-extrabold">قابلیت‌ها به تفکیک ماژول</h2>
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ${MODULES.map(
          (m) => `<a href="${m.url}" class="card card-hover p-5">
          <span class="icon-tile size-9">${icon(m.icon, "size-4")}</span>
          <span class="mt-3 block text-sm font-extrabold text-ink-900">${esc(m.name)}</span>
          <span class="mt-1 block text-xs text-ink-500">${fa(m.features.length)} قابلیت</span>
        </a>`
        ).join("\n        ")}
      </div>
    </div>
  </section>

  ${ctaBand()}
</main>`;

  pages.push({
    path,
    html: `${head({ title, description, path, jsonLd: [orgLd, appLd] })}
<body class="bg-ink-25">
${header("/features.html")}
${body}
${footer()}
</body>
</html>`,
  });
}

/* ---------- security ---------- */
{
  const path = "/security.html";
  const title = "امنیت و انطباق | راینو ERP";
  const description =
    "ورود دومرحله‌ای، ثبت کامل رویدادها، تفکیک وظایف و جداسازی داده‌ی هر شرکت در راینو ERP؛ به همراه جزئیات معماری فنی و امنیتی.";

  const body = `
<main id="main">
  ${breadcrumbs([{ label: "صفحه اصلی", href: "/index.html" }, { label: "امنیت و انطباق" }])}
  <section class="pt-8 pb-4">
    <div class="container-page">
      ${pageHeader({
        eyebrow: "امنیت",
        title: "امنیت سازمانی، قابل اثبات",
        lead: "دسترسی‌ها بر اساس نقش و مجوز تعیین می‌شوند، هر تغییر ثبت می‌شود و داده‌ی هر شرکت جدا نگهداری می‌شود.",
      })}
    </div>
  </section>

  <section class="section pt-10">
    <div class="container-page">
      <ul class="grid gap-4 sm:grid-cols-2">
        ${SECURITY_POINTS.map(
          (p) => `<li class="card p-6">
          <span class="icon-tile">${icon(p.icon, "size-5")}</span>
          <h2 class="mt-4 text-base font-extrabold text-ink-900">${esc(p.title)}</h2>
          <p class="mt-2 text-sm leading-7 text-ink-600">${esc(p.body)}</p>
        </li>`
        ).join("\n        ")}
      </ul>
    </div>
  </section>

  <section class="section border-y border-ink-200 bg-white" aria-labelledby="arch-title">
    <div class="container-page">
      <div class="max-w-2xl">
        <p class="eyebrow">برای تیم فنی</p>
        <h2 id="arch-title" class="text-h2 font-extrabold">معماری فنی و کنترل‌های امنیتی</h2>
        <p class="mt-3 text-sm leading-7 text-ink-600 sm:text-base">
          این بخش برای ارزیابی فنی و تیم IT سازمان تهیه شده است. اگر مدیر کسب‌وکار هستید، بخش بالا برای شما کافی است.
        </p>
      </div>
      <div class="mt-8 grid gap-4 lg:grid-cols-2">
        ${SECURITY_JARGON.map(
          (g) => `<section class="card p-6">
          <h3 class="text-sm font-extrabold text-ink-900">${esc(g.title)}</h3>
          <ul class="mt-4 space-y-2.5">
            ${g.items
              .map(
                (it) => `<li class="flex items-start gap-2.5 text-sm leading-7 text-ink-600">
              ${icon("check", "mt-1.5 size-4 shrink-0 text-teal-600")}
              <span>${esc(it)}</span>
            </li>`
              )
              .join("\n            ")}
          </ul>
        </section>`
        ).join("\n        ")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container-page">
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="card p-6">
          <h2 class="text-sm font-extrabold text-ink-900">استقرار</h2>
          <p class="mt-2 text-sm leading-7 text-ink-600">روی سرور سازمان شما یا زیرساخت ابری مورد نظر شما؛ با پیکربندی اختصاصی هر مجموعه.</p>
        </div>
        <div class="card p-6">
          <h2 class="text-sm font-extrabold text-ink-900">مهاجرت داده</h2>
          <p class="mt-2 text-sm leading-7 text-ink-600">انتقال داده‌های موجود با بازبینی و کنترل تطابق، پیش از راه‌اندازی نهایی.</p>
        </div>
        <div class="card p-6">
          <h2 class="text-sm font-extrabold text-ink-900">آموزش و پشتیبانی</h2>
          <p class="mt-2 text-sm leading-7 text-ink-600">آموزش نقش‌های کلیدی و پشتیبانی فنی در دوره‌ی استقرار و پس از آن.</p>
        </div>
      </div>
    </div>
  </section>

  ${ctaBand()}
</main>`;

  pages.push({
    path,
    html: `${head({ title, description, path, jsonLd: [orgLd] })}
<body class="bg-ink-25">
${header("/security.html")}
${body}
${footer()}
</body>
</html>`,
  });
}

/* ---------- faq ---------- */
{
  const path = "/faq.html";
  const title = "پرسش‌های متداول | راینو ERP";
  const description =
    "پاسخ پرسش‌های رایج درباره چندشرکتی بودن، امنیت اطلاعات، استقرار، ورود خودکار فاکتور، ارسال به سامانه مؤدیان و شخصی‌سازی.";

  const body = `
<main id="main">
  ${breadcrumbs([{ label: "صفحه اصلی", href: "/index.html" }, { label: "پرسش‌های متداول" }])}
  <section class="pt-8 pb-4">
    <div class="container-page">
      ${pageHeader({
        eyebrow: "پرسش‌های متداول",
        title: "سوال‌هایی که زیاد پرسیده می‌شود",
        lead: "اگر پاسخ سوال خود را پیدا نکردید، در جلسه‌ی دمو مستقیم بپرسید.",
      })}
    </div>
  </section>

  <section class="section pt-10">
    <div class="container-page max-w-4xl">
      <div class="space-y-3">
        ${FAQ.map(
          (f, i) => `<details class="accordion-item"${i === 0 ? " open" : ""}>
          <summary class="accordion-trigger">
            <span>${esc(f.q)}</span>
            ${icon("chevrondown", "accordion-chevron size-5")}
          </summary>
          <div class="accordion-panel"><p>${esc(f.a)}</p></div>
        </details>`
        ).join("\n        ")}
      </div>
      <div class="mt-8 card p-6">
        <h2 class="text-base font-extrabold text-ink-900">سوال دیگری دارید؟</h2>
        <p class="mt-2 text-sm leading-7 text-ink-600">کارشناسان ما در ساعات کاری پاسخ می‌دهند.</p>
        <div class="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <a href="/demo.html" class="btn btn-primary btn-sm">درخواست دمو</a>
          <a href="/contact.html" class="btn btn-secondary btn-sm">راه‌های تماس</a>
        </div>
      </div>
    </div>
  </section>

  ${ctaBand()}
</main>`;

  pages.push({
    path,
    html: `${head({ title, description, path, jsonLd: [orgLd, faqLd] })}
<body class="bg-ink-25">
${header("/faq.html")}
${body}
${footer()}
</body>
</html>`,
  });
}

/* ---------- demo ---------- */
{
  const path = "/demo.html";
  const title = "درخواست دموی رایگان | راینو ERP";
  const description =
    "فرم کوتاه درخواست دموی رایگان راینو ERP؛ نمایش اختصاصی ماژول‌های مالی، منابع انسانی، قرارداد، انبار و مالیات برای سازمان شما.";

  const body = `
<main id="main">
  ${breadcrumbs([{ label: "صفحه اصلی", href: "/index.html" }, { label: "درخواست دمو" }])}
  <section class="section pt-8">
    <div class="container-page">
      <div class="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div class="lg:col-span-5">
          <p class="eyebrow">دموی رایگان</p>
          <h1 class="text-h2 font-extrabold sm:text-h1">سازمان خود را در راینو ببینید</h1>
          <p class="mt-4 text-lead text-ink-600">
            در یک جلسه‌ی ۳۰ دقیقه‌ای، ماژول‌های مرتبط با سازمان شما نمایش داده می‌شود و مسیر استقرار بررسی می‌شود.
          </p>

          <ul class="mt-8 space-y-4">
            ${[
              "نمایش با داده‌ی نمونه‌ی نزدیک به سازمان شما",
              "بررسی ماژول‌های مورد نیاز و اولویت استقرار",
              "پاسخ به سوال‌های امنیت، مهاجرت داده و یکپارچه‌سازی",
            ]
              .map(
                (t) => `<li class="flex items-start gap-2.5 text-sm leading-7 text-ink-700">
              ${icon("checkcircle", "mt-0.5 size-4 shrink-0 text-teal-600")}<span>${esc(t)}</span>
            </li>`
              )
              .join("\n            ")}
          </ul>

          <div class="card mt-8 p-5">
            <p class="text-sm font-extrabold text-ink-900">ترجیح می‌دهید تلفنی صحبت کنیم؟</p>
            <div class="mt-3 space-y-2 text-sm">
              <a href="tel:${SITE.contact.phoneHref}" dir="ltr" class="flex min-h-9 items-center font-bold text-brand-700 hover:underline">${SITE.contact.phone}</a>
              <a href="tel:${SITE.contact.mobileHref}" dir="ltr" class="flex min-h-9 items-center font-bold text-brand-700 hover:underline">${SITE.contact.mobile}</a>
              <p class="text-xs text-ink-500">${esc(SITE.contact.hours)}</p>
            </div>
          </div>
        </div>

        <div class="lg:col-span-7">
          <div class="card p-5 shadow-card sm:p-8">
            <h2 class="text-h3 font-extrabold">فرم درخواست</h2>
            <p class="mt-2 text-sm text-ink-500">فقط چهار فیلد ضروری است.</p>
            <div class="mt-6">
              ${demoForm({ id: "demo-page" })}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>`;

  pages.push({
    path,
    html: `${head({ title, description, path, jsonLd: [orgLd] })}
<body class="bg-ink-25">
${header("/demo.html")}
${body}
${footer()}
</body>
</html>`,
  });
}

/* ---------- contact ---------- */
{
  const path = "/contact.html";
  const title = "تماس با ما | راینو ERP";
  const description =
    "راه‌های ارتباط مستقیم با تیم راینو: تلفن واحد فروش، موبایل پشتیبانی فنی، ایمیل سازمانی، تلگرام و واتس‌اپ.";

  const c = SITE.contact;
  const methods = [
    { icon: "phone", title: "تلفن واحد فروش", note: c.hours, value: c.phone, href: `tel:${c.phoneHref}` },
    { icon: "smartphone", title: "موبایل پشتیبانی فنی", note: "تماس مستقیم در ساعات اداری", value: c.mobile, href: `tel:${c.mobileHref}` },
    { icon: "mail", title: "ایمیل سازمانی", note: "ارسال مستندات و پیشنهاد رسمی", value: c.email, href: `mailto:${c.email}` },
    { icon: "message", title: "واتس‌اپ", note: "پاسخ‌گویی سریع پیش از خرید", value: c.whatsapp, href: c.whatsappHref },
    { icon: "send", title: "تلگرام", note: "ارتباط مستقیم با تیم فنی", value: c.telegram, href: c.telegramHref },
  ];

  const body = `
<main id="main">
  ${breadcrumbs([{ label: "صفحه اصلی", href: "/index.html" }, { label: "تماس با ما" }])}
  <section class="pt-8 pb-4">
    <div class="container-page">
      ${pageHeader({
        eyebrow: "تماس",
        title: "با تیم راینو صحبت کنید",
        lead: "برای مشاوره پیش از خرید، پشتیبانی فنی یا همکاری سازمانی از هر کانال زیر در دسترس هستیم.",
      })}
    </div>
  </section>

  <section class="section pt-10">
    <div class="container-page">
      <div class="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div class="lg:col-span-5">
          <h2 class="text-h3 font-extrabold">راه‌های ارتباطی</h2>
          <ul class="mt-6 space-y-3">
            ${methods
              .map(
                (m) => `<li class="card flex items-start gap-3.5 p-4">
              <span class="icon-tile size-10">${icon(m.icon, "size-5")}</span>
              <div class="min-w-0">
                <p class="text-sm font-extrabold text-ink-900">${esc(m.title)}</p>
                <p class="mt-0.5 text-xs text-ink-500">${esc(m.note)}</p>
                <a href="${m.href}"${m.href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""} dir="ltr"
                   class="mt-1 flex min-h-8 items-center text-sm font-bold text-brand-700 hover:underline">${esc(m.value)}</a>
              </div>
            </li>`
              )
              .join("\n            ")}
          </ul>
        </div>

        <div class="lg:col-span-7">
          <div class="card p-5 shadow-card sm:p-8">
            <h2 class="text-h3 font-extrabold">درخواست دمو</h2>
            <p class="mt-2 text-sm text-ink-500">سریع‌ترین راه برای دیدن راینو با داده‌ی نمونه.</p>
            <div class="mt-6">
              ${demoForm({ id: "contact-demo", compact: true })}
            </div>
          </div>
          <div class="card mt-4 flex items-center justify-between gap-4 p-5">
            <div>
              <p class="text-sm font-extrabold text-ink-900">نماد اعتماد الکترونیکی</p>
              <p class="mt-1 text-xs text-ink-500">راینو دارای نماد اعتماد الکترونیکی است.</p>
            </div>
            <a referrerpolicy="origin" target="_blank" rel="noopener" href="${SITE.enamadSeal.href}">
              <img referrerpolicy="origin" src="${SITE.enamadSeal.src}" alt="نماد اعتماد الکترونیکی راینو" width="88" height="88" loading="lazy" class="size-[88px] rounded-lg border border-ink-200 bg-white p-1">
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>`;

  pages.push({
    path,
    html: `${head({ title, description, path, jsonLd: [orgLd] })}
<body class="bg-ink-25">
${header("/contact.html")}
${body}
${footer()}
</body>
</html>`,
  });
}

/* ------------------------------------------------------------------ */
/* emit                                                                */
/* ------------------------------------------------------------------ */

/* fresh dist/ */
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

/* copy public static assets (css/ is emitted by build:css) */
for (const dir of ["assets", "js"]) {
  const from = join(ROOT, dir);
  if (existsSync(from)) cpSync(from, join(DIST, dir), { recursive: true });
}
/* the 1024px master logo is a source file, not a web asset */
const masterLogo = join(DIST, "assets", "rhyno-logo.png");
if (existsSync(masterLogo)) rmSync(masterLogo);
for (const file of ["41188724.txt"]) {
  const from = join(ROOT, file);
  if (existsSync(from)) cpSync(from, join(DIST, file));
}

const written = pages.map((p) => write(p.path.replace(/^\//, ""), p.html));

/* sitemap — clean URLs, matching vercel cleanUrls */
const urls = pages
  .map((p) => {
    const loc = abs(p.path);
    const isHome = p.path === "/index.html";
    return `  <url>
    <loc>${loc}</loc>
    <changefreq>${isHome ? "weekly" : "monthly"}</changefreq>
    <priority>${isHome ? "1.0" : p.path.startsWith("/modules/") ? "0.7" : "0.8"}</priority>
  </url>`;
  })
  .join("\n");

write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
);

write(
  "robots.txt",
  `User-agent: *
Allow: /

Sitemap: ${SITE.baseUrl}/sitemap.xml
`
);

console.log(`build:pages — ${written.length} pages, sitemap.xml, robots.txt`);
