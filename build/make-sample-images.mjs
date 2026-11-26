/**
 * Generates the sample cover images used by the demo articles.
 *
 * These are throwaway placeholders so the pipeline can be proven end to end;
 * delete this script together with the sample articles before launch.
 *
 * Run: node build/make-sample-images.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "content", "articles");
mkdirSync(OUT, { recursive: true });

const W = 1600;
const H = 900;

const AMP = "\u0026";
const svgEsc = (s) =>
  String(s).replace(/[&<>]/g, (c) => ({ [AMP]: AMP + "amp;", "<": AMP + "lt;", ">": AMP + "gt;" })[c]);

function coverSvg({ title, subtitle, from, to, accent }) {
  const safe = svgEsc;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g opacity="0.16" fill="none" stroke="#ffffff" stroke-width="2">
    ${Array.from({ length: 7 }, (_, i) => `<circle cx="${W - 180}" cy="180" r="${90 + i * 74}"/>`).join("")}
  </g>
  <g opacity="0.9">
    <rect x="96" y="150" width="${accent}" height="10" rx="5" fill="#ffffff"/>
  </g>
  <text x="${W - 96}" y="300" text-anchor="end" direction="rtl"
        font-family="Vazirmatn, Tahoma, DejaVu Sans, sans-serif" font-size="72" font-weight="700" fill="#ffffff">${safe(
          title
        )}</text>
  <text x="${W - 96}" y="392" text-anchor="end" direction="rtl"
        font-family="Vazirmatn, Tahoma, DejaVu Sans, sans-serif" font-size="40" font-weight="500" fill="#dbe8fe">${safe(
          subtitle
        )}</text>
  <text x="96" y="${H - 80}" font-family="sans-serif" font-size="32" fill="#dbe8fe">Rhyno ERP</text>
</svg>`;
}

function bodySvg({ caption }) {
  const safe = svgEsc;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="800" viewBox="0 0 1400 800">
  <rect width="1400" height="800" fill="#f6f8fa"/>
  <rect x="60" y="60" width="1280" height="680" rx="24" fill="#ffffff" stroke="#e2e7ee" stroke-width="3"/>
  <rect x="60" y="60" width="1280" height="86" rx="24" fill="#eff5ff"/>
  <circle cx="112" cy="103" r="10" fill="#bfd7fe"/>
  <circle cx="146" cy="103" r="10" fill="#bfd7fe"/>
  <circle cx="180" cy="103" r="10" fill="#bfd7fe"/>
  ${Array.from({ length: 6 }, (_, i) => {
    const y = 210 + i * 78;
    return `<rect x="120" y="${y}" width="${380 + ((i * 97) % 320)}" height="26" rx="13" fill="${
      i % 3 === 0 ? "#dbe8fe" : "#eef1f5"
    }"/>
    <rect x="560" y="${y}" width="${180 + ((i * 53) % 220)}" height="26" rx="13" fill="#eef1f5"/>
    <rect x="1060" y="${y}" width="180" height="26" rx="13" fill="${i % 2 ? "#d1fae9" : "#fef3c7"}"/>`;
  }).join("")}
  <text x="700" y="740" text-anchor="middle" direction="rtl"
        font-family="Vazirmatn, Tahoma, DejaVu Sans, sans-serif" font-size="30" fill="#4a5768">${safe(
          caption
        )}</text>
</svg>`;
}

const covers = [
  {
    file: "sample-financial-close.jpg",
    svg: coverSvg({
      title: "بستن دوره مالی",
      subtitle: "چک‌لیست گام‌به‌گام",
      from: "#2563eb",
      to: "#172554",
      accent: 220,
    }),
  },
  {
    file: "sample-payroll-checklist.jpg",
    svg: coverSvg({
      title: "حقوق و دستمزد",
      subtitle: "پنج خطای رایج",
      from: "#0d9488",
      to: "#134e4a",
      accent: 190,
    }),
  },
  {
    file: "sample-contract-tracking.jpg",
    svg: coverSvg({
      title: "ردیابی قرارداد",
      subtitle: "از امضا تا سررسید",
      from: "#1d4ed8",
      to: "#0b0f14",
      accent: 240,
    }),
  },
];

for (const c of covers) {
  const buf = await sharp(Buffer.from(c.svg)).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  writeFileSync(join(OUT, c.file), buf);
  console.log(`wrote content/articles/${c.file} (${(buf.length / 1024).toFixed(0)} KB)`);
}

/* one body image, referenced from the first sample article */
const body = await sharp(
  Buffer.from(bodySvg({ caption: "نمای تراز آزمایشی — محتوای نمونه" }))
)
  .jpeg({ quality: 86, mozjpeg: true })
  .toBuffer();
writeFileSync(join(OUT, "sample-financial-close-2.jpg"), body);
console.log(
  `wrote content/articles/sample-financial-close-2.jpg (${(body.length / 1024).toFixed(0)} KB)`
);
