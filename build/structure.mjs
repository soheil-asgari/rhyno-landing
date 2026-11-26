/**
 * Structural QA — duplicate ids, leftover legacy hooks, placeholder text,
 * heading order, and JSON-LD validity.
 *
 * Usage: node build/structure.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");

function collect(dir, out = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, name.name);
    if (name.isDirectory()) collect(full, out);
    else if (name.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const files = collect(DIST);
const problems = [];

const PLACEHOLDER = [
  "TODO", "FIXME", "lorem ipsum", "Lorem ipsum", "و غیره…",
  "در حال بارگذاری", "coming soon", "به‌زودی", "placeholder text",
];
const LEGACY = [
  "faq-answer-", "matrixTableBody", "highlightsContainer",
  "moduleSidebar", "moduleContentArea", "techStackContainer",
  "uxCardsContainer", "faqAccordionContainer", "demoModal",
  "openCategory(", "lucide", "data-lucide",
];

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const rel = file.replace(DIST, "").replace(/\\/g, "/");

  /* duplicate ids */
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
  if (dupes.length) problems.push(`${rel}: duplicate id(s) ${dupes.join(", ")}`);

  /* leftover legacy hooks */
  for (const hook of LEGACY) {
    if (html.includes(hook)) problems.push(`${rel}: legacy hook "${hook}"`);
  }

  /* placeholder text, ignoring form placeholders and aria labels */
  const visible = html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/\splaceholder="[^"]*"/g, "")
    .replace(/\saria-label="[^"]*"/g, "")
    .replace(/\salt="[^"]*"/g, "")
    .replace(/\scontent="[^"]*"/g, "");
  for (const p of PLACEHOLDER) {
    if (visible.includes(p)) problems.push(`${rel}: placeholder text "${p}"`);
  }

  /* heading order: no skipped levels */
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  let prev = 0;
  levels.forEach((lvl, i) => {
    if (i === 0 && lvl !== 1) problems.push(`${rel}: first heading is h${lvl}`);
    if (prev && lvl > prev + 1) problems.push(`${rel}: h${prev} → h${lvl} skips a level`);
    prev = lvl;
  });

  /* JSON-LD parses and has @context/@type */
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const obj = JSON.parse(m[1]);
      if (!obj["@context"] || !obj["@type"]) problems.push(`${rel}: JSON-LD missing @context/@type`);
    } catch (e) {
      problems.push(`${rel}: invalid JSON-LD (${e.message})`);
    }
  }

  /* labels must point at a real control */
  for (const m of html.matchAll(/<label[^>]*\sfor="([^"]+)"/g)) {
    if (!ids.includes(m[1])) problems.push(`${rel}: label for="${m[1]}" has no matching id`);
  }

  /* aria-describedby targets exist */
  for (const m of html.matchAll(/aria-describedby="([^"]+)"/g)) {
    for (const id of m[1].split(/\s+/)) {
      if (!ids.includes(id)) problems.push(`${rel}: aria-describedby="${id}" missing`);
    }
  }

  /* aria-controls targets exist */
  for (const m of html.matchAll(/aria-controls="([^"]+)"/g)) {
    if (!ids.includes(m[1])) problems.push(`${rel}: aria-controls="${m[1]}" missing`);
  }
}

console.log(`checked ${files.length} pages`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  problems.forEach((p) => console.log(" - " + p));
  process.exitCode = 1;
} else {
  console.log("no structural issues");
}
