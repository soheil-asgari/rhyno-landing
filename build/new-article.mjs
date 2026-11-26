/**
 * Scaffold a new blog article.
 *
 * Usage:
 *   npm run new-article -- <slug> "<title>"
 *
 * Creates content/articles/<slug>.md with front matter placeholders and a
 * heading skeleton. Refuses to overwrite an existing file.
 */

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "content", "articles");

const [slug, title] = process.argv.slice(2);

if (!slug || !title) {
  console.error('Usage: npm run new-article -- <slug> "<title>"');
  process.exit(1);
}
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error(
    `Invalid slug "${slug}". Use lowercase English letters, digits and hyphens only (e.g. "financial-close-checklist").`
  );
  process.exit(1);
}

const file = join(DIR, `${slug}.md`);
if (existsSync(file)) {
  console.error(`Refusing to overwrite existing file: content/articles/${slug}.md`);
  process.exit(1);
}

mkdirSync(DIR, { recursive: true });

const today = new Date().toISOString().slice(0, 10);

const template = `---
title: "${title.replace(/"/g, '\\"')}"
description: ""            # optional — defaults to the first paragraph, trimmed to ~155 chars
date: "${today}"           # optional — defaults to the file's first git commit date
# updated: ""              # optional — shown as "به‌روزرسانی" when set
category: "عمومی"          # see docs/data/blog-taxonomy.json
tags: []                   # e.g. ["حسابداری", "بستن دوره"]
image_alt: ""              # optional — defaults to the title
modules: []                # module slugs, e.g. ["finance", "reports-search"]
# draft: true              # set to true to keep the article out of the site
# autolink: false          # set to false to disable automatic internal links
---

# ${title}

مقدمه: مسئله‌ای که این مقاله حل می‌کند را در دو یا سه جمله توضیح دهید.

## چرا این موضوع مهم است؟

دلایل و زمینه‌ی مسئله را بنویسید.

## گام‌های اجرا

### گام یک

توضیح گام یک.

### گام دو

توضیح گام دو.

### گام سه

توضیح گام سه.

## جمع‌بندی

خلاصه‌ی کاربردی و یک فراخوان به اقدام.
`;

writeFileSync(file, template, "utf8");

console.log(`created content/articles/${slug}.md`);
console.log(`next: add a cover image at content/articles/${slug}.jpg (recommended 1600×900, under 2 MB)`);
