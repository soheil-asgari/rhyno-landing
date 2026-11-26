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

/* sitemap entries resolve */
const sitemap = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const loc of locs) {
  const path = loc.replace("https://www.rhynoai.ir", "");
  const rel = path === "/" ? "index.html" : path.replace(/^\//, "");
  const candidates = [join(ROOT, rel), join(ROOT, rel + ".html"), join(ROOT, rel, "index.html")];
  if (!candidates.some((c) => existsSync(c))) problems.push(`sitemap: ${loc} has no file`);
}

console.log(`checked ${files.length} pages, ${locs.length} sitemap URLs`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  problems.forEach((p) => console.log(" - " + p));
  process.exitCode = 1;
} else {
  console.log("no problems found");
}
