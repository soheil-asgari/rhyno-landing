# Rhyno ERP — سایت بازاریابی

سایت استاتیک فارسی (RTL) برای راینو ERP. بدون فریم‌ورک، بدون وابستگی زمان اجرا.

## اجرا

```bash
npm install
npm run build      # تولید dist/ (HTML + CSS + sitemap + robots)
npm run serve      # http://127.0.0.1:3000
```

`npm run build` دو مرحله دارد:

1. `build:pages` — [`build/pages.mjs`](../build/pages.mjs) تمام صفحه‌های HTML، `sitemap.xml` و `robots.txt` را در `dist/` می‌سازد.
2. `build:css` — Tailwind v4 از [`tailwind.input.css`](../tailwind.input.css) فایل `dist/css/tailwind.css` را می‌سازد.

فقط `dist/` منتشر می‌شود؛ بنابراین `docs/`، `build/` و این فایل هرگز روی وب در دسترس نیستند.

## ساختار

```
build/
  data.mjs            مدل محتوا (ماژول‌ها، ماتریس، FAQ، کپی بازاریابی)
  pages.mjs           تولیدکننده صفحه‌ها (header/footer مشترک)
  icons.mjs           مجموعه آیکون SVG درون‌خطی
  serve.mjs           سرور استاتیک محلی، شبیه‌ساز cleanUrls ورسل
  check.mjs           بررسی لینک‌ها، h1، canonical، واژه‌های فنی
  audit.mjs           سرریز افقی، اندازه هدف لمسی، اسکرین‌شات
  interact.mjs        تست تعاملی ناوبری، فیلتر، فرم، آکاردئون، کیبورد
  visual.mjs          بررسی توکن‌های طراحی در مرورگر
  optimize-images.mjs تولید لوگو در اندازه‌های واقعی + تصویر OG
  audit.mjs ...
docs/
  website_showcase_data.md   منبع محتوای ماژول‌ها، ماتریس و FAQ
  redirects-old-urls.md      نگاشت آدرس‌های قدیمی → جدید
  contract.md, task.md       اسناد داخلی (منتشر نمی‌شوند)
js/site.js            تنها اسکریپت زمان اجرا
assets/               فونت وزیرمتن، لوگو، تصویر OG
```

## افزودن یا ویرایش محتوا

- **ماژول‌ها، ماتریس امکانات، FAQ** از `docs/website_showcase_data.md` خوانده می‌شوند. برای تغییر متن، همان سند را ویرایش کنید و `npm run build` بزنید.
- **کپی بازاریابی** (مزایا، امنیت، بخش AI، لینک‌های ناوبری) در `build/data.mjs` است.
- **واژه‌های فنی** در `SANITIZE` داخل `build/data.mjs` به زبان کاربر ترجمه می‌شوند؛ جزئیات فنی فقط در `/security.html` مجاز است.

## کیفیت

```bash
npm run qa          # لینک‌ها + چیدمان + توکن‌ها + تعامل
```

`npm run qa` به سرور محلی روی پورت ۳۰۰۰ نیاز دارد (`npm run serve`).

Lighthouse موبایل (پیش‌فرض: ۳۷۵×۸۱۲، شبیه‌سازی throttle):

```bash
npx lighthouse http://127.0.0.1:3000/ --form-factor=mobile \
  --screenEmulation.mobile=true --screenEmulation.width=375 \
  --screenEmulation.height=812 --output=json --output-path=.lighthouse/home.json \
  --chrome-flags="--headless=new --no-sandbox" --quiet
```

## استقرار

`vercel.json`:

- `outputDirectory: "dist"`
- `cleanUrls: true`، `trailingSlash: false`
- هدرهای امنیتی و کش دارایی‌ها
- آرایه `redirects` برای آدرس‌های قدیمی — فهرست کامل در [`redirects-old-urls.md`](redirects-old-urls.md)

## کارهای باقی‌مانده

- `demoAccessKey` در [`build/data.mjs`](../build/data.mjs) مقدار جایگزین `YOUR_WEB3FORMS_ACCESS_KEY` دارد و باید با کلید واقعی Web3Forms جایگزین شود. تا آن زمان فرم در حالت خطا پیام راهنما نشان می‌دهد و هیچ درخواستی را موفق اعلام نمی‌کند.
- فونت به‌صورت TTF با `preload` بارگذاری می‌شود؛ تبدیل به woff2 زیرمجموعه‌شده گام بعدی بهینه‌سازی است.
- فهرست آدرس‌های قدیمی ایندکس‌شده باید در `vercel.json` تکمیل شود.
