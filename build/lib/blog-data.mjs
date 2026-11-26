/**
 * Blog content loader.
 *
 * Scans content/articles/*.md, applies front-matter defaults, validates the
 * authoring contract, plans responsive images and computes taxonomy,
 * related content and reverse module links.
 *
 * Every contract violation throws a BuildError with a clear message; missing
 * covers degrade to a generated fallback with a warning.
 */

import { readdirSync, readFileSync, statSync, existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname, basename, extname, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

import { parseFrontMatter, FrontMatterError } from "./frontmatter.mjs";
import {
  planImage,
  materialize,
  fallbackCoverSvg,
  imageDims,
  isImageFile,
  imageBase,
  COVER_WIDTHS,
  BODY_WIDTHS,
} from "./images.mjs";
import { renderMarkdown, takeFirstH1, markdownToText } from "./markdown.mjs";
import {
  excerpt,
  readingMinutes,
  translitSlug,
  jalaliLabel,
  jalaliNumeric,
  xmlEsc,
  faDigits,
} from "./text.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(here, "..", "..");
export const ARTICLES_DIR = join(ROOT, "content", "articles");
export const CACHE_ROOT = join(ROOT, ".cache", "images");
export const TAXONOMY_FILE = join(ROOT, "docs", "data", "blog-taxonomy.json");
export const LINKS_FILE = join(ROOT, "docs", "data", "internal-links.json");

export const PER_PAGE = 12;
export const FEED_LIMIT = 30;

export class BuildError extends Error {}

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/* ------------------------------------------------------------------ */
/* small helpers                                                       */
/* ------------------------------------------------------------------ */

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

/** First git commit date for a file, falling back to mtime. */
function firstCommitDate(absPath) {
  try {
    const out = execFileSync(
      "git",
      ["log", "--diff-filter=A", "--follow", "--format=%ad", "--date=short", "--", absPath],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
    const lines = out.split(/\r?\n/).filter(Boolean);
    if (lines.length) return lines[lines.length - 1];
  } catch {
    /* not a git repo, or git missing */
  }
  try {
    return statSync(absPath).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function today() {
  /* Allow deterministic builds/tests. */
  const forced = process.env.BLOG_TODAY;
  if (forced && /^\d{4}-\d{2}-\d{2}$/.test(forced)) return forced;
  return new Date().toISOString().slice(0, 10);
}

function walkMd(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkMd(full, out);
    else if (/\.md$/i.test(entry.name)) out.push(full);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* taxonomy                                                            */
/* ------------------------------------------------------------------ */

function makeTaxonomy() {
  const raw = readJson(TAXONOMY_FILE, { categories: {}, tags: {} });
  const warnings = [];
  const used = { category: new Map(), tag: new Map() };

  const resolveName = (kind, name) => {
    const table = kind === "category" ? raw.categories || {} : raw.tags || {};
    const key = String(name).trim();
    if (table[key]) return table[key];

    /* case-insensitive / normalized lookup (e.g. "OCR" vs "ocr") */
    const lower = key.toLowerCase();
    for (const [k, v] of Object.entries(table)) {
      if (k.toLowerCase() === lower) return v;
    }

    const translit = translitSlug(key);
    const slug = translit || `x-${createHash("sha1").update(key).digest("hex").slice(0, 6)}`;
    warnings.push(
      `taxonomy: no ${kind} mapping for "${key}" — using "${slug}". ` +
        `Add it to docs/data/blog-taxonomy.json for a stable URL.`
    );
    return slug;
  };

  const mapFor = (kind) => (kind === "category" ? used.category : used.tag);

  return {
    slugFor(kind, name) {
      const slug = resolveName(kind, name);
      const map = mapFor(kind);
      if (!map.has(slug)) map.set(slug, { slug, name: String(name).trim(), articles: [] });
      return slug;
    },
    addArticle(kind, slug, article) {
      const group = mapFor(kind).get(slug);
      if (group && !group.articles.includes(article)) group.articles.push(article);
    },
    groups(kind) {
      return [...mapFor(kind).values()]
        .filter((g) => g.articles.length >= 1)
        .sort((a, b) => a.name.localeCompare(b.name, "fa"));
    },
    warnings,
  };
}

/* ------------------------------------------------------------------ */
/* loader                                                              */
/* ------------------------------------------------------------------ */

export async function loadBlog({ moduleSlugs = [], log = console.log, warn = console.warn } = {}) {
  const warnings = [];
  const errors = [];

  if (!existsSync(ARTICLES_DIR)) {
    return emptyBlog();
  }

  const files = walkMd(ARTICLES_DIR);
  const seenSlugs = new Map();
  const taxonomy = makeTaxonomy();
  const linkRules = readJson(LINKS_FILE, { links: [] }).links || [];
  const todayIso = today();
  const articles = [];

  /* ---- pass 1: parse + validate ---- */
  for (const file of files) {
    const rel = relative(ROOT, file).split(sep).join("/");
    const slug = basename(file, extname(file));

    if (!slugRe.test(slug)) {
      errors.push(
        `${rel}: slug "${slug}" is invalid — use lowercase English letters, digits and hyphens only`
      );
      continue;
    }
    if (/[^\x00-\x7F]/.test(slug)) {
      errors.push(`${rel}: slug "${slug}" contains non-ASCII characters`);
      continue;
    }
    const key = slug.toLowerCase();
    if (seenSlugs.has(key)) {
      errors.push(`${rel}: duplicate slug "${slug}" (also used by ${seenSlugs.get(key)})`);
      continue;
    }
    seenSlugs.set(key, rel);

    let parsed;
    try {
      parsed = parseFrontMatter(readFileSync(file, "utf8"), rel);
    } catch (e) {
      if (e instanceof FrontMatterError) {
        errors.push(e.message);
        continue;
      }
      throw e;
    }

    let body = parsed.body ?? "";
    const fm = parsed.data || {};

    /* title: front matter, else first H1 (removed from the body) */
    let title = fm.title;
    if (!title) {
      const taken = takeFirstH1(body);
      if (taken.title) {
        title = taken.title;
        body = taken.body;
      }
    }
    if (!title) {
      errors.push(`${rel}: no title — add "title:" to front matter or start the file with "# Heading"`);
      continue;
    }

    if (!body.trim()) {
      errors.push(`${rel}: empty body — the article has no content`);
      continue;
    }

    const draft = fm.draft === true;
    const date = fm.date || firstCommitDate(file);
    const future = date > todayIso;

    /* category / tags */
    const categoryName = fm.category || "عمومی";
    const tags = (fm.tags || []).map((t) => String(t).trim()).filter(Boolean);

    /* modules from front matter (validated against the real module list) */
    let modules = (fm.modules || []).map((m) => String(m).trim()).filter(Boolean);
    for (const m of modules) {
      if (moduleSlugs.length && !moduleSlugs.includes(m)) {
        warnings.push(`${rel}: modules: "${m}" is not a known module slug — ignored`);
      }
    }
    modules = modules.filter((m) => !moduleSlugs.length || moduleSlugs.includes(m));

    /* cover image */
    const imageDir = dirname(file);
    const coverCandidates = ["jpg", "jpeg", "png", "webp", "avif"].map(
      (ext) => join(imageDir, `${slug}.${ext}`)
    );
    const coverPath = coverCandidates.find((p) => existsSync(p)) || null;

    /* body images: collect relative references */
    const bodyImageRefs = [...body.matchAll(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)]
      .map((m) => ({ alt: m[1], href: m[2] }))
      .filter((r) => !/^(https?:)?\/\//i.test(r.href) && !r.href.startsWith("data:"));

    const bodyImages = new Map();
    for (const ref of bodyImageRefs) {
      const abs = resolve(imageDir, ref.href);
      if (!existsSync(abs) || !statSync(abs).isFile()) {
        errors.push(`${rel}: image referenced in the body does not exist → ${ref.href}`);
        continue;
      }
      if (!isImageFile(abs)) {
        errors.push(`${rel}: body image is not a supported image type → ${ref.href}`);
        continue;
      }
      if (!bodyImages.has(abs)) bodyImages.set(abs, { path: abs, alt: ref.alt });
      if (!ref.alt.trim()) {
        warnings.push(`${rel}: body image "${ref.href}" has an empty alt attribute`);
      }
    }

    articles.push({
      file,
      rel,
      slug,
      title: String(title).trim(),
      description: fm.description || "",
      date,
      updated: fm.updated || "",
      categoryName,
      tags,
      modules,
      imageAlt: fm.image_alt || String(title).trim(),
      draft,
      future,
      autolink: fm.autolink !== false,
      coverPath,
      body,
      bodyImages,
      raw: readFileSync(file, "utf8"),
    });
  }

  if (errors.length) {
    throw new BuildError(
      `Blog content errors (${errors.length}):\n` + errors.map((e) => `  ✗ ${e}`).join("\n")
    );
  }

  /* ---- pass 2: publish filter + derived fields ---- */
  const published = articles
    .filter((a) => !a.draft && !a.future)
    .sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : a.date < b.date ? 1 : -1));

  const excluded = articles.filter((a) => a.draft || a.future);

  for (const a of published) {
    a.path = `/blog/${a.slug}`;
    a.url = `${a.path}`;
    a.readingMinutes = readingMinutes(a.body);

    /* taxonomy slugs are only registered for published articles */
    a.categorySlug = taxonomy.slugFor("category", a.categoryName);
    a.tagsBySlug = [];
    for (const t of a.tags) {
      const slug = taxonomy.slugFor("tag", t);
      if (!a.tagsBySlug.some((x) => x.slug === slug)) a.tagsBySlug.push({ name: t, slug });
    }
    a.tagSlugs = a.tagsBySlug.map((t) => t.slug);

    taxonomy.addArticle("category", a.categorySlug, a);
    for (const t of a.tagSlugs) taxonomy.addArticle("tag", t, a);

    const plain = markdownToText(a.body);
    a.description = a.description || excerpt(plain, 155);

    /* image plans */
    a.imageDir = join(ROOT, "dist", "blog", "img", a.slug);
    a.imagePublicDir = `/blog/img/${a.slug}`;

    if (a.coverPath) {
      const buf = readFileSync(a.coverPath);
      const dims = await imageDims(buf);
      a.coverPlan = planImage({
        buffer: buf,
        name: "cover",
        publicDir: a.imagePublicDir,
        widths: COVER_WIDTHS,
        og: true,
        width: dims.width,
        height: dims.height,
      });
      a.coverFallback = false;
    } else {
      const svg = fallbackCoverSvg(a.title);
      a.coverPlan = planImage({
        buffer: svg,
        name: "cover",
        publicDir: a.imagePublicDir,
        widths: COVER_WIDTHS,
        og: true,
        width: 1600,
        height: 900,
      });
      a.coverFallback = true;
      warnings.push(
        `${a.rel}: no cover image found (expected content/articles/${a.slug}.jpg|jpeg|png|webp) — using a generated fallback`
      );
    }

    a.bodyPlans = new Map();
    for (const [abs, info] of a.bodyImages) {
      const buf = readFileSync(abs);
      const dims = await imageDims(buf);
      const plan = planImage({
        buffer: buf,
        name: `img-${translitSlug(imageBase(abs)) || "image"}`,
        publicDir: a.imagePublicDir,
        widths: BODY_WIDTHS,
        og: false,
        width: dims.width,
        height: dims.height,
      });
      a.bodyPlans.set(abs, plan);
    }
  }

  /* ---- pass 3: render bodies (needs plans for <picture>) ---- */
  const bySlug = new Map(published.map((a) => [a.slug, a]));

  for (const a of published) {
    const rendered = renderMarkdown(a.body, {
      currentPath: a.path,
      links: linkRules,
      autolink: a.autolink,
      renderImage: (token) => {
        const abs = resolve(dirname(a.file), token.href);
        const plan = a.bodyPlans.get(abs);
        if (!plan) return "";
        return renderBodyPicture(plan, token.text || a.imageAlt);
      },
    });

    a.html = rendered.html;
    a.headings = rendered.headings.filter((h) => h.depth === 2 || h.depth === 3);
    a.autoLinks = rendered.usedLinks;
    a.inferredModules = rendered.modules;
    a.toc = a.headings.length >= 3 ? a.headings : [];

    /* modules: front matter first, then inferred from auto-links */
    a.moduleSlugs = [...new Set([...a.modules, ...a.inferredModules])];
  }

  /* ---- pass 4: related content ---- */
  for (const a of published) {
    a.related = rankRelated(a, published).slice(0, 3);
  }

  /* ---- pass 5: reverse module links ---- */
  const moduleArticles = new Map();
  for (const a of published) {
    for (const m of a.moduleSlugs) {
      if (!moduleArticles.has(m)) moduleArticles.set(m, []);
      moduleArticles.get(m).push(a);
    }
  }

  /* ---- report ---- */
  const report = [];
  for (const a of published) {
    report.push({
      slug: a.slug,
      title: a.title,
      links: a.autoLinks,
      related: a.related.map((r) => r.slug),
      modules: a.moduleSlugs,
      cover: a.coverFallback ? "fallback" : basename(a.coverPath),
    });
  }

  return {
    articles: published,
    excluded,
    bySlug,
    byModule: moduleArticles,
    categories: taxonomy.groups("category"),
    tags: taxonomy.groups("tag"),
    warnings: [...warnings, ...taxonomy.warnings],
    report,
    excludedInfo: excluded.map((a) => ({
      slug: a.slug,
      reason: a.draft ? "draft" : `scheduled for ${a.date}`,
    })),
    today: todayIso,
  };
}

function emptyBlog() {
  return {
    articles: [],
    excluded: [],
    bySlug: new Map(),
    byModule: new Map(),
    categories: [],
    tags: [],
    warnings: [],
    report: [],
    excludedInfo: [],
    today: today(),
  };
}

function renderBodyPicture(plan, alt) {
  const srcset = (fmt) =>
    plan.variants
      .filter((v) => v.format === fmt)
      .map((v) => `${v.publicPath} ${v.width}w`)
      .join(", ");
  const jpgs = plan.variants.filter((v) => v.format === "jpg");
  const fallback = jpgs[jpgs.length - 1] || plan.variants[plan.variants.length - 1];
  const largest = plan.variants.reduce((a, b) => (b.width > a.width ? b : a), plan.variants[0]);
  const sizes = "(min-width: 768px) 704px, calc(100vw - 40px)";
  return `<figure class="my-8">
  <picture>
    <source type="image/avif" srcset="${srcset("avif")}" sizes="${sizes}">
    <source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}">
    <img src="${fallback.publicPath}" srcset="${srcset("jpg")}" sizes="${sizes}" alt="${escapeAttr(
    alt
  )}" width="${largest.width}" height="${largest.height}" loading="lazy" decoding="async" class="w-full rounded-xl border border-ink-200">
  </picture>
</figure>`;
}

const AMP = "\u0026";
const ATTR_ESC = { [AMP]: AMP + "amp;", "<": AMP + "lt;", ">": AMP + "gt;", '"': AMP + "quot;" };
const escapeAttr = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ATTR_ESC[c]);

/** Rank related articles: shared tags/category/modules, then recency. */
function rankRelated(current, all) {
  const tags = new Set(current.tagSlugs);
  const mods = new Set(current.moduleSlugs);

  const scored = all
    .filter((a) => a.slug !== current.slug)
    .map((a) => {
      let score = 0;
      for (const t of a.tagSlugs) if (tags.has(t)) score += 3;
      if (a.categorySlug === current.categorySlug) score += 2;
      for (const m of a.moduleSlugs) if (mods.has(m)) score += 2;
      return { a, score };
    })
    .sort((x, y) => {
      if (y.score !== x.score) return y.score - x.score;
      return x.a.date < y.a.date ? 1 : -1;
    });

  return scored.map((s) => s.a);
}

/* ------------------------------------------------------------------ */
/* image materialization                                               */
/* ------------------------------------------------------------------ */

export async function materializeBlogImages(blog, { log = console.log } = {}) {
  if (!blog.articles.length) return { encoded: 0, cached: 0 };
  mkdirSync(CACHE_ROOT, { recursive: true });

  let encoded = 0;
  let cached = 0;

  for (const a of blog.articles) {
    const outDir = join(ROOT, "dist", "blog", "img", a.slug);
    const plans = [a.coverPlan, ...a.bodyPlans.values()];
    for (const plan of plans) {
      const res = await materialize(plan, { cacheRoot: CACHE_ROOT, outDir });
      if (res.encoded) encoded++;
      else cached++;
    }
  }

  return { encoded, cached };
}

/* ------------------------------------------------------------------ */
/* RSS                                                                 */
/* ------------------------------------------------------------------ */

export function buildFeed(blog, { baseUrl, siteName, description }) {
  const items = blog.articles.slice(0, FEED_LIMIT);
  const lastBuild = items[0]?.updated || items[0]?.date || blog.today;

  const entries = items
    .map((a) => {
      const url = `${baseUrl}${a.path}`;
      const pub = new Date(`${a.date}T09:00:00+03:30`).toUTCString();
      const mod = a.updated ? new Date(`${a.updated}T09:00:00+03:30`).toUTCString() : "";
      return `    <item>
      <title>${xmlEsc(a.title)}</title>
      <link>${xmlEsc(url)}</link>
      <guid isPermaLink="true">${xmlEsc(url)}</guid>
      <pubDate>${pub}</pubDate>
${mod ? `      <dc:date>${new Date(`${a.updated}T09:00:00+03:30`).toISOString()}</dc:date>\n` : ""}      <description>${xmlEsc(a.description)}</description>
      <category>${xmlEsc(a.categoryName)}</category>
${a.tags.map((t) => `      <category>${xmlEsc(t)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xmlEsc(siteName)} — مقالات</title>
    <link>${xmlEsc(`${baseUrl}/blog/`)}</link>
    <description>${xmlEsc(description)}</description>
    <language>fa-IR</language>
    <lastBuildDate>${new Date(`${lastBuild}T09:00:00+03:30`).toUTCString()}</lastBuildDate>
    <atom:link href="${xmlEsc(`${baseUrl}/blog/feed.xml`)}" rel="self" type="application/rss+xml"/>
${entries}
  </channel>
</rss>
`;
}

export { jalaliLabel, jalaliNumeric, faDigits, excerpt, readingMinutes };
