/**
 * QA: internal link check + jargon scan + structural checks.
 * Run: node build/check.mjs
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git" || name === ".screenshots") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

const files = walk(ROOT);
const problems = [];

/* internal sources must never appear in dist/ */
for (const forbidden of ["docs", "build", "templates", "contract.md", "task.md", "website_showcase_data.md", "README.md"]) {
  if (existsSync(join(ROOT, forbidden))) problems.push(`dist/ leaks internal file: ${forbidden}`);
}

/* map clean URL -> file */
function resolveHref(href, fromFile) {
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return null;
  let p = href.split("#")[0].split("?")[0];
  if (!p) return null;
  if (p.startsWith("/")) {
    const rel = p.replace(/^\//, "");
    const candidates = [
      join(ROOT, rel),
      join(ROOT, rel + ".html"),
      join(ROOT, rel, "index.html"),
    ];
    return candidates.find((c) => existsSync(c) && statSync(c).isFile()) || "MISSING";
  }
  const base = dirname(fromFile);
  const candidates = [join(base, p), join(base, p + ".html")];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) || "MISSING";
}

/* /security.html is the deliberate home for technical detail. */
const JARGON_ALLOWED_ON = new Set(["/security.html"]);

const JARGON = [
  "EF Core", "DbContext", "RabbitMQ", "Outbox", "SignalR", "Tesseract",
  "ABAC", "SIEM", "ASP.NET", "React Flow", "SQL Server", "Multi-Tenant",
  "multi-tenant", "showcase", "شوکیس", "در حال بارگذاری",
];

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const rel = file.replace(ROOT, "").replace(/\\/g, "/");

  // links
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const h of hrefs) {
    const r = resolveHref(h, file);
    if (r === "MISSING") problems.push(`${rel}: broken link ${h}`);
  }

  // h1 count
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) problems.push(`${rel}: ${h1s} h1 elements`);

  // landmarks
  if (!html.includes("<main")) problems.push(`${rel}: no <main>`);
  if (!html.includes('lang="fa"')) problems.push(`${rel}: missing lang=fa`);
  if (!html.includes('dir="rtl"')) problems.push(`${rel}: missing dir=rtl`);

  // canonical / og
  if (!html.includes('rel="canonical"')) problems.push(`${rel}: no canonical`);
  if (!html.includes('property="og:title"')) problems.push(`${rel}: no og:title`);
  if (!html.includes('name="enamad"')) problems.push(`${rel}: no enamad meta`);

  // jargon — allowed only on the dedicated technical page
  if (!JARGON_ALLOWED_ON.has(rel)) {
    for (const j of JARGON) {
      if (html.includes(j)) problems.push(`${rel}: jargon "${j}"`);
    }
  }

  // images need dimensions
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\bwidth=/.test(m[0]) || !/\bheight=/.test(m[0]))
      problems.push(`${rel}: img without width/height -> ${m[0].slice(0, 80)}`);
  }

  // latin digits in visible Persian copy is hard to detect; check for common leaks
  if (/در حال بارگذاری جدول/.test(html)) problems.push(`${rel}: loading placeholder`);
}

/* required files */
for (const f of ["sitemap.xml", "robots.txt", "css/tailwind.css", "js/site.js", "41188724.txt"]) {
  if (!existsSync(join(ROOT, f))) problems.push(`missing file: ${f}`);
}

/* ---- blog checks ---- */
const blogFiles = files.filter((f) => {
  const rel = f.replace(ROOT, "").replace(/\\/g, "/");
  return rel.startsWith("/blog/");
});

if (blogFiles.length) {
  const articleFiles = blogFiles.filter((f) => {
    const rel = f.replace(ROOT, "").replace(/\\/g, "/");
    return /^\/blog\/[a-z0-9-]+\/index\.html$/.test(rel);
  });

  /* the feed is only built when at least one article is published */
  if (articleFiles.length && !existsSync(join(ROOT, "blog", "feed.xml")))
    problems.push("missing file: blog/feed.xml");

  for (const file of articleFiles) {
    const html = readFileSync(file, "utf8");
    const rel = file.replace(ROOT, "").replace(/\\/g, "/");

    /* exactly one Article JSON-LD with required fields */
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => {
        try {
          return JSON.parse(m[1]);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const article = ld.find((o) => o["@type"] === "Article");
    if (!article) problems.push(`${rel}: no Article JSON-LD`);
    else {
      for (const key of ["headline", "image", "datePublished", "dateModified", "author", "publisher"]) {
        if (!article[key]) problems.push(`${rel}: Article JSON-LD missing ${key}`);
      }
    }
    if (!ld.some((o) => o["@type"] === "BreadcrumbList"))
      problems.push(`${rel}: no BreadcrumbList JSON-LD`);

    /* og:type=article + times */
    if (!html.includes('property="og:type" content="article"'))
      problems.push(`${rel}: og:type is not article`);
    if (!html.includes('property="article:published_time"'))
      problems.push(`${rel}: no article:published_time`);

    /* images: alt + dimensions */
    for (const m of html.matchAll(/<img\b[^>]*>/g)) {
      if (!/\balt=/.test(m[0])) problems.push(`${rel}: img without alt -> ${m[0].slice(0, 80)}`);
    }
    for (const m of html.matchAll(/<picture>[\s\S]*?<\/picture>/g)) {
      if (!/<img\b/.test(m[0])) problems.push(`${rel}: <picture> without <img> fallback`);
    }

    /* heading anchors unique */
    const ids = [...html.matchAll(/<h[23][^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
    const dup = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
    if (dup.length) problems.push(`${rel}: duplicate heading ids ${dup.join(", ")}`);

    /* TOC only when >= 3 headings, and every TOC link resolves */
    const tocLinks = [...html.matchAll(/<nav aria-labelledby="toc-title"[\s\S]*?<\/nav>/g)].join("");
    if (tocLinks) {
      if (ids.length < 3) problems.push(`${rel}: TOC rendered with fewer than 3 headings`);
      for (const m of tocLinks.matchAll(/href="#([^"]+)"/g)) {
        if (!ids.includes(m[1])) problems.push(`${rel}: TOC link #${m[1]} has no heading`);
      }
    }

    /* no auto-link inside an article heading (card titles may link) */
    for (const m of html.matchAll(/<h[1-6]\b[^>]*\bid="[^"]+"[^>]*>([\s\S]*?)<\/h[1-6]>/g)) {
      if (/<a\b/.test(m[1])) problems.push(`${rel}: auto-link inside an article heading`);
    }

    /* cleanUrls: no internal href may point at an index.html file */
    for (const m of html.matchAll(/href="([^"]*index\.html[^"]*)"/g)) {
      problems.push(`${rel}: href leaks index.html -> ${m[1]}`);
    }
  }

  /* latest-articles section is all-or-nothing: no empty heading, no empty grid */
  {
    const home = join(ROOT, "index.html");
    const html = readFileSync(home, "utf8");
    const section = html.match(/<section[^>]*aria-labelledby="blog-title"[\s\S]*?<\/section>/);
    const cards = section ? [...section[0].matchAll(/<article\b/g)].length : 0;
    if (section && cards === 0) problems.push("/: latest-articles section rendered with 0 cards");
    if (!section && /تازه‌ترین راهنماها/.test(html))
      problems.push("/: latest-articles heading rendered without a section");
  }

  /* sitemap: every published article exactly once */
  const sitemapXml = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
  const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const file of articleFiles) {
    const rel = file.replace(ROOT, "").replace(/\\/g, "/");
    const clean = rel.replace(/\/index\.html$/, "/");
    const url = `https://www.rhynoai.ir${clean}`;
    const count = locs.filter((l) => l === url).length;
    if (count !== 1) problems.push(`sitemap: ${url} appears ${count} times (expected 1)`);
  }
}

/* sitemap entries resolve */
const sitemap = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const loc of locs) {
  const path = loc.replace("https://www.rhynoai.ir", "").replace(/\/$/, "");
  const rel = path === "" ? "index.html" : path.replace(/^\//, "");
  const candidates = [join(ROOT, rel), join(ROOT, rel + ".html"), join(ROOT, rel, "index.html")];
  if (!candidates.some((c) => existsSync(c))) problems.push(`sitemap: ${loc} has no file`);
}

/* sitemap must not contain .html (cleanUrls) */
const htmlLocs = locs.filter((l) => /\.html$/.test(l));
if (htmlLocs.length) problems.push(`sitemap contains .html URLs: ${htmlLocs.slice(0, 3).join(", ")}`);

console.log(`checked ${files.length} pages, ${locs.length} sitemap URLs`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  problems.forEach((p) => console.log(" - " + p));
  process.exitCode = 1;
} else {
  console.log("no problems found");
}
