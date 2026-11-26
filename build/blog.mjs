/**
 * Blog page renderer.
 *
 * Pure rendering: receives the loaded blog model plus the site's shared
 * partials (head/header/footer/…) and returns page objects in the same shape
 * build/pages.mjs uses for the marketing pages.
 */

import { pictureMarkup } from "./lib/images.mjs";
import { PER_PAGE } from "./lib/blog-data.mjs";
import { jalaliLabel } from "./lib/text.mjs";

/* ------------------------------------------------------------------ */
/* cards                                                               */
/* ------------------------------------------------------------------ */

function coverPicture(a, helpers, { eager = false, sizes = "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw", className = "aspect-[16/9] w-full object-cover" } = {}) {
  return pictureMarkup(a.coverPlan, {
    alt: a.imageAlt,
    sizes,
    className,
    loading: eager ? "eager" : "lazy",
    fetchpriority: eager ? "high" : undefined,
  });
}

function metaLine(a, helpers) {
  const { icon, fa } = helpers;
  return `<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-ink-500">
    <span class="badge-neutral">${helpers.esc(a.categoryName)}</span>
    <span class="inline-flex items-center gap-1">${icon("calendar", "size-3.5")}
      <time datetime="${a.date}T09:00:00+03:30">${jalaliLabel(a.date)}</time>
    </span>
    <span class="inline-flex items-center gap-1">${icon("clock", "size-3.5")}${fa(a.readingMinutes)} دقیقه مطالعه</span>
  </div>`;
}

export function articleCard(a, helpers) {
  return `<article class="card card-hover flex h-full flex-col overflow-hidden">
  <a href="${a.path}" class="block overflow-hidden rounded-t-xl bg-ink-100" tabindex="-1" aria-hidden="true">
    ${coverPicture(a, helpers)}
  </a>
  <div class="flex flex-1 flex-col p-5">
    ${metaLine(a, helpers)}
    <h2 class="mt-3 text-base font-extrabold leading-7 text-ink-900">
      <a href="${a.path}" class="hover:text-brand-700">${helpers.esc(a.title)}</a>
    </h2>
    <p class="mt-2 flex-1 text-sm leading-7 text-ink-600">${helpers.esc(a.description)}</p>
    <a href="${a.path}" class="mt-4 inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-brand-700 hover:underline">
      ادامه مطلب ${helpers.icon("arrowleft", "size-3.5")}
    </a>
  </div>
</article>`;
}

/* ------------------------------------------------------------------ */
/* /blog and /blog/page/N                                              */
/* ------------------------------------------------------------------ */

function pagination({ page, totalPages, basePath }) {
  if (totalPages <= 1) return "";
  const hrefFor = (n) => (n === 1 ? "/blog/" : `/blog/page/${n}/`);
  const items = [];

  for (let n = 1; n <= totalPages; n++) {
    const active = n === page;
    items.push(
      `<li>${
        active
          ? `<span aria-current="page" class="inline-flex size-10 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">${n}</span>`
          : `<a href="${hrefFor(n)}" class="inline-flex size-10 items-center justify-center rounded-lg border border-ink-200 bg-white text-sm font-bold text-ink-700 hover:border-ink-300 hover:bg-ink-50">${n}</a>`
      }</li>`
    );
  }

  return `<nav aria-label="صفحه‌بندی مقالات" class="mt-10 flex items-center justify-center gap-2">
  <ul class="flex flex-wrap items-center justify-center gap-2">${items.join("")}</ul>
</nav>`;
}

export function renderBlogIndex(blog, helpers, page = 1) {
  const { head, header, footer, breadcrumbs, ctaBand, esc, fa, icon } = helpers;
  const totalPages = Math.max(1, Math.ceil(blog.articles.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const items = blog.articles.slice(start, start + PER_PAGE);

  const path = page === 1 ? "/blog/index.html" : `/blog/page/${page}/index.html`;
  const title =
    page === 1
      ? "مقالات راینو ERP | راهنمای مالی، منابع انسانی، قرارداد و انبار"
      : `مقالات راینو ERP — صفحه ${fa(page)}`;
  const description =
    page === 1
      ? "مقالات کاربردی راینو درباره حسابداری، حقوق و دستمزد، قرارداد، انبار، مالیات و اتوماسیون اداری برای سازمان‌های ایرانی."
      : `صفحه ${fa(page)} از فهرست مقالات راینو ERP؛ راهنماهای کاربردی مالی، منابع انسانی، قرارداد، انبار و مالیات.`;

  const prev = page > 1 ? (page === 2 ? "/blog/" : `/blog/page/${page - 1}/`) : null;
  const next = page < totalPages ? `/blog/page/${page + 1}/` : null;

  const body = `
<main id="main">
  ${breadcrumbs(
    page === 1
      ? [{ label: "صفحه اصلی", href: "/index.html" }, { label: "مقالات" }]
      : [
          { label: "صفحه اصلی", href: "/index.html" },
          { label: "مقالات", href: "/blog/" },
          { label: `صفحه ${fa(page)}` },
        ]
  )}
  <section class="pt-8 pb-4">
    <div class="container-page">
      <div class="max-w-3xl">
        <p class="eyebrow">${icon("book", "size-3.5")} مقالات</p>
        <h1 class="text-h2 font-extrabold sm:text-h1">راهنمای کاربردی سازمان</h1>
        <p class="mt-4 text-lead text-ink-600">
          تجربه‌های عملی از پیاده‌سازی مالی، منابع انسانی، قرارداد، انبار و مالیات در سازمان‌های ایرانی.
        </p>
      </div>
      ${
        blog.categories.length
          ? `<ul class="mt-6 flex flex-wrap gap-2">
        ${blog.categories
          .map(
            (c) =>
              `<li><a href="/blog/category/${c.slug}/" class="badge-neutral min-h-6 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700">${esc(
                c.name
              )} <span class="text-ink-400">${fa(c.articles.length)}</span></a></li>`
          )
          .join("\n        ")}
      </ul>`
          : ""
      }
    </div>
  </section>

  <section class="section pt-8">
    <div class="container-page">
      ${
        items.length
          ? `<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        ${items.map((a) => articleCard(a, helpers)).join("\n        ")}
      </div>
      ${pagination({ page, totalPages, basePath: "/blog" })}`
          : `<div class="card p-8 text-center">
        <p class="text-sm font-bold text-ink-700">هنوز مقاله‌ای منتشر نشده است.</p>
        <p class="mt-2 text-sm text-ink-500">به‌زودی راهنماهای کاربردی اینجا منتشر می‌شود.</p>
      </div>`
      }
    </div>
  </section>

  ${ctaBand()}
</main>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: helpers.abs(path),
      inLanguage: "fa-IR",
      isPartOf: { "@type": "WebSite", name: helpers.SITE.name, url: helpers.SITE.baseUrl },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [{ "@type": "ListItem", position: 1, name: "مقالات", item: `${helpers.SITE.baseUrl}/blog/` }],
    },
  ];

  return {
    path,
    html: `${head({
      title,
      description,
      path,
      jsonLd,
      prev,
      next,
      robots: items.length ? "index,follow,max-image-preview:large" : "noindex,follow",
    })}
<body class="bg-ink-25">
${header("/blog/index.html")}
${body}
${footer()}
</body>
</html>`,
    sitemap: {
      lastmod: blog.articles[0]?.updated || blog.articles[0]?.date,
      changefreq: "daily",
      priority: page === 1 ? "0.9" : "0.4",
    },
  };
}

/* ------------------------------------------------------------------ */
/* /blog/<slug>                                                        */
/* ------------------------------------------------------------------ */

function tocBlock(a, helpers) {
  if (!a.toc.length) return "";
  const { esc } = helpers;
  return `<nav aria-labelledby="toc-title" class="card mb-8 p-5">
    <h2 id="toc-title" class="text-sm font-extrabold text-ink-900">فهرست مطالب</h2>
    <ol class="mt-3 space-y-1.5 text-sm">
      ${a.toc
        .map(
          (h) =>
            `<li class="${h.depth === 3 ? "ps-4" : ""}">
        <a href="#${h.id}" class="inline-flex min-h-8 items-center text-ink-600 hover:text-brand-700">${esc(h.text)}</a>
      </li>`
        )
        .join("\n      ")}
    </ol>
  </nav>`;
}

function relatedModulesBox(a, helpers) {
  const { MODULES, esc, icon } = helpers;
  const mods = a.moduleSlugs.map((s) => MODULES.find((m) => m.slug === s)).filter(Boolean);
  if (!mods.length) return "";

  return `<aside class="card mt-10 p-6" aria-labelledby="related-modules-title">
    <h2 id="related-modules-title" class="text-sm font-extrabold text-ink-900">ماژول‌های مرتبط</h2>
    <p class="mt-1 text-xs text-ink-500">این مقاله به این بخش‌های راینو اشاره دارد.</p>
    <ul class="mt-4 grid gap-2 sm:grid-cols-2">
      ${mods
        .map(
          (m) => `<li>
        <a href="/modules/${m.slug}" class="flex items-center gap-2.5 rounded-lg border border-ink-200 px-3 py-2.5 text-sm font-semibold text-ink-700 hover:border-brand-200 hover:bg-brand-50">
          ${icon(m.icon, "size-4 text-brand-600")} ${esc(m.name)}
        </a>
      </li>`
        )
        .join("\n      ")}
    </ul>
  </aside>`;
}

function relatedArticlesBlock(a, helpers) {
  if (!a.related.length) return "";
  return `<section class="section border-t border-ink-200 bg-white" aria-labelledby="related-articles-title">
    <div class="container-page">
      <h2 id="related-articles-title" class="text-h3 font-extrabold">مقالات مرتبط</h2>
      <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        ${a.related.map((r) => articleCard(r, helpers)).join("\n        ")}
      </div>
    </div>
  </section>`;
}

function demoCta(helpers) {
  const { icon } = helpers;
  return `<section class="section">
    <div class="container-page">
      <div class="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-l from-brand-50 via-white to-white p-7 sm:p-10">
        <div class="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div class="max-w-xl">
            <h2 class="text-h3 font-extrabold sm:text-h2">این فرآیند را در راینو ببینید</h2>
            <p class="mt-3 text-sm leading-7 text-ink-600">
              در یک جلسه‌ی ۳۰ دقیقه‌ای، ماژول‌های مرتبط با سازمان شما با داده‌ی نمونه نمایش داده می‌شود.
            </p>
          </div>
          <div class="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
            <a href="/demo" class="btn btn-primary">درخواست دموی رایگان ${icon("arrowleft", "size-4")}</a>
            <a href="/modules/" class="btn btn-secondary">مشاهده ماژول‌ها</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

export function renderArticle(a, helpers) {
  const { head, header, footer, breadcrumbs, esc, fa, icon, SITE } = helpers;
  const canonical = helpers.abs(a.path);
  const ogImage = `${SITE.baseUrl}${a.coverPlan.og.publicPath}`;
  const iso = `${a.date}T09:00:00+03:30`;
  const isoModified = a.updated ? `${a.updated}T09:00:00+03:30` : iso;

  const title = `${a.title} | راینو ERP`;

  const body = `
<main id="main">
  ${breadcrumbs([
    { label: "صفحه اصلی", href: "/index.html" },
    { label: "مقالات", href: "/blog/" },
    { label: a.title },
  ])}

  <article class="pt-8">
    <div class="container-page">
      <div class="mx-auto max-w-[72ch]">
        <span class="badge">${icon("book", "size-3.5")} ${esc(a.categoryName)}</span>
        <h1 class="mt-4 text-h2 font-extrabold sm:text-h1">${esc(a.title)}</h1>
        <p class="mt-4 text-lead text-ink-600">${esc(a.description)}</p>

        <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-ink-200 py-3 text-xs font-semibold text-ink-500">
          <span class="inline-flex items-center gap-1.5">${icon("calendar", "size-4")}
            <span>انتشار: <time datetime="${iso}">${jalaliLabel(a.date)}</time></span>
          </span>
          ${
            a.updated
              ? `<span class="inline-flex items-center gap-1.5">${icon("refresh", "size-4")}
            <span>به‌روزرسانی: <time datetime="${isoModified}">${jalaliLabel(a.updated)}</time></span>
          </span>`
              : ""
          }
          <span class="inline-flex items-center gap-1.5">${icon("clock", "size-4")}${fa(a.readingMinutes)} دقیقه مطالعه</span>
        </div>

        <figure class="mt-6 overflow-hidden rounded-xl border border-ink-200 bg-ink-100">
          ${pictureMarkup(a.coverPlan, {
            alt: a.imageAlt,
            sizes: "(min-width: 768px) 704px, calc(100vw - 40px)",
            className: "w-full",
            loading: "eager",
            fetchpriority: "high",
          })}
        </figure>

        <div class="mt-8">
          ${tocBlock(a, helpers)}
          <div class="prose-article">${a.html}</div>
          ${relatedModulesBox(a, helpers)}
          ${
            a.tagsBySlug.length
              ? `<ul class="mt-6 flex flex-wrap gap-2" aria-label="برچسب‌ها">
            ${a.tagsBySlug
              .map(
                (t) =>
                  `<li><a href="/blog/tag/${t.slug}/" class="badge-neutral min-h-6 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700">${esc(
                    t.name
                  )}</a></li>`
              )
              .join("\n            ")}
          </ul>`
              : ""
          }
        </div>
      </div>
    </div>
  </article>

  ${relatedArticlesBlock(a, helpers)}
  ${demoCta(helpers)}
</main>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.title,
      description: a.description,
      image: [ogImage],
      datePublished: iso,
      dateModified: isoModified,
      inLanguage: "fa-IR",
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      author: { "@type": "Organization", name: SITE.name, url: SITE.baseUrl },
      publisher: {
        "@type": "Organization",
        name: SITE.name,
        logo: { "@type": "ImageObject", url: `${SITE.baseUrl}/assets/rhyno-logo-96.png`, width: 96, height: 96 },
      },
      articleSection: a.categoryName,
      keywords: a.tags.join(", "),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "صفحه اصلی", item: `${SITE.baseUrl}/` },
        { "@type": "ListItem", position: 2, name: "مقالات", item: `${SITE.baseUrl}/blog/` },
        { "@type": "ListItem", position: 3, name: a.title, item: canonical },
      ],
    },
  ];

  return {
    path: `${a.path}/index.html`,
    html: `${head({
      title,
      description: a.description,
      path: `${a.path}/index.html`,
      jsonLd,
      ogType: "article",
      image: ogImage,
      imageAlt: a.imageAlt,
      publishedTime: iso,
      modifiedTime: isoModified,
    })}
<body class="bg-ink-25">
${header("/blog/index.html")}
${body}
${footer()}
</body>
</html>`,
    sitemap: { lastmod: a.updated || a.date, changefreq: "monthly", priority: "0.8" },
  };
}

/* ------------------------------------------------------------------ */
/* taxonomy pages                                                      */
/* ------------------------------------------------------------------ */

export function renderTaxonomy(kind, group, blog, helpers) {
  const { head, header, footer, breadcrumbs, ctaBand, esc, fa, icon } = helpers;
  const isCategory = kind === "category";
  const path = `/blog/${kind}/${group.slug}/index.html`;
  const title = isCategory
    ? `${group.name} | مقالات راینو ERP`
    : `برچسب ${group.name} | مقالات راینو ERP`;
  const description = isCategory
    ? `مقالات دسته ${group.name} در راینو ERP؛ ${fa(group.articles.length)} مقاله کاربردی درباره ${group.name}.`
    : `مقالات برچسب ${group.name} در راینو ERP؛ ${fa(group.articles.length)} مقاله کاربردی.`;

  const body = `
<main id="main">
  ${breadcrumbs([
    { label: "صفحه اصلی", href: "/index.html" },
    { label: "مقالات", href: "/blog/" },
    { label: isCategory ? group.name : `برچسب ${group.name}` },
  ])}
  <section class="pt-8 pb-4">
    <div class="container-page">
      <div class="max-w-3xl">
        <p class="eyebrow">${icon(isCategory ? "grid" : "link", "size-3.5")} ${isCategory ? "دسته" : "برچسب"}</p>
        <h1 class="text-h2 font-extrabold sm:text-h1">${esc(group.name)}</h1>
        <p class="mt-4 text-lead text-ink-600">${fa(group.articles.length)} مقاله در این ${
    isCategory ? "دسته" : "برچسب"
  }.</p>
      </div>
    </div>
  </section>

  <section class="section pt-8">
    <div class="container-page">
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        ${group.articles.map((a) => articleCard(a, helpers)).join("\n        ")}
      </div>
    </div>
  </section>

  ${ctaBand()}
</main>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: helpers.abs(path),
      inLanguage: "fa-IR",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "مقالات", item: `${helpers.SITE.baseUrl}/blog/` },
        { "@type": "ListItem", position: 2, name: group.name, item: helpers.abs(path) },
      ],
    },
  ];

  return {
    path,
    html: `${head({ title, description, path, jsonLd })}
<body class="bg-ink-25">
${header("/blog/index.html")}
${body}
${footer()}
</body>
</html>`,
    sitemap: {
      lastmod: group.articles[0]?.updated || group.articles[0]?.date,
      changefreq: "weekly",
      priority: "0.6",
    },
  };
}

/* ------------------------------------------------------------------ */
/* landing-page section                                                */
/* ------------------------------------------------------------------ */

export function latestArticlesSection(blog, helpers) {
  if (!blog.articles.length) return "";
  const { icon } = helpers;
  const items = blog.articles.slice(0, 3);
  return `<section class="section" aria-labelledby="blog-title">
    <div class="container-page">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="max-w-2xl">
          <p class="eyebrow">${icon("book", "size-3.5")} مقالات</p>
          <h2 id="blog-title" class="text-h2 font-extrabold">تازه‌ترین راهنماها</h2>
          <p class="mt-3 text-sm leading-7 text-ink-600 sm:text-base">
            تجربه‌های عملی از پیاده‌سازی مالی، منابع انسانی، قرارداد، انبار و مالیات.
          </p>
        </div>
        <a href="/blog/" class="btn btn-secondary btn-sm self-start sm:self-auto">همه مقالات ${icon(
          "arrowleft",
          "size-3.5"
        )}</a>
      </div>
      <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        ${items.map((a) => articleCard(a, helpers)).join("\n        ")}
      </div>
    </div>
  </section>`;
}

/* ------------------------------------------------------------------ */
/* all blog pages                                                      */
/* ------------------------------------------------------------------ */

export function renderBlogPages(blog, helpers) {
  const pages = [];

  const totalPages = Math.max(1, Math.ceil(blog.articles.length / PER_PAGE));
  for (let p = 1; p <= totalPages; p++) pages.push(renderBlogIndex(blog, helpers, p));

  for (const a of blog.articles) pages.push(renderArticle(a, helpers));

  for (const c of blog.categories) pages.push(renderTaxonomy("category", c, blog, helpers));
  for (const t of blog.tags) pages.push(renderTaxonomy("tag", t, blog, helpers));

  return pages;
}
