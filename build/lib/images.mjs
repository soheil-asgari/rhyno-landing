/**
 * Image pipeline for the blog.
 *
 * Two phases so page rendering never waits on sharp:
 *   1. planImage()  — pure: derives variant filenames/dimensions from a hash.
 *   2. materialize() — encodes AVIF/WebP/JPEG into .cache/ (keyed by source
 *      hash) and copies the results into dist/.
 *
 * Rebuilding with unchanged sources therefore only copies files.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

export const COVER_WIDTHS = [480, 800, 1200];
export const BODY_WIDTHS = [480, 800, 1200];

const FORMATS = [
  { ext: "avif", type: "image/avif", opts: { quality: 55, effort: 4 } },
  { ext: "webp", type: "image/webp", opts: { quality: 78, effort: 4 } },
  { ext: "jpg", type: "image/jpeg", opts: { quality: 80, mozjpeg: true } },
];

const BRAND = "#2563eb";
const BRAND_DARK = "#172554";
const CACHE_VERSION = "v1";

export const hashOf = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 10);

const ensure = (dir) => {
  mkdirSync(dir, { recursive: true });
  return dir;
};

const AMP = "\u0026";
const ATTR_ESC = { [AMP]: AMP + "amp;", "<": AMP + "lt;", ">": AMP + "gt;", '"': AMP + "quot;" };

export const escapeAttr = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ATTR_ESC[c]);

/** Brand-gradient cover used when an article has no image file. */
export function fallbackCoverSvg(title, width = 1600, height = 900) {
  const safe = String(title ?? "").replace(/[&<>]/g, (c) => ATTR_ESC[c]);
  const words = safe.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > 30) {
      if (line) lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line.trim());
  const shown = lines.slice(0, 3);
  const startY = height / 2 - (shown.length - 1) * 48;
  const text = shown
    .map(
      (l, i) =>
        `<text x="${width / 2}" y="${startY + i * 96}" text-anchor="middle" direction="rtl" ` +
        `font-family="Vazirmatn, Tahoma, DejaVu Sans, sans-serif" font-size="60" font-weight="700" fill="#ffffff">${l}</text>`
    )
    .join("");
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BRAND}"/>
      <stop offset="100%" stop-color="${BRAND_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <g opacity="0.10" fill="none" stroke="#ffffff" stroke-width="2">
    ${Array.from({ length: 8 }, (_, i) => `<circle cx="${width - 140}" cy="140" r="${70 + i * 52}"/>`).join("")}
  </g>
  ${text}
  <text x="${width - 64}" y="${height - 56}" text-anchor="end" font-family="sans-serif" font-size="30" fill="#dbe8fe">Rhyno ERP</text>
</svg>`
  );
}

/**
 * Derive the full output plan for one source image (no encoding).
 */
export function planImage({
  buffer,
  name,
  publicDir,
  widths = COVER_WIDTHS,
  og = false,
  width,
  height,
}) {
  const srcHash = hashOf(buffer);
  const origW = Math.max(1, Math.round(width || 1200));
  const origH = Math.max(1, Math.round(height || Math.round((origW * 9) / 16)));

  let targets = [...new Set(widths.filter((w) => w <= origW))].sort((a, b) => a - b);
  if (!targets.length) targets = [Math.min(origW, Math.max(...widths))];

  const variants = [];
  for (const w of targets) {
    const h = Math.max(1, Math.round((origH * w) / origW));
    for (const f of FORMATS) {
      const file = `${name}-${srcHash}-${w}.${f.ext}`;
      variants.push({
        format: f.ext,
        type: f.type,
        width: w,
        height: h,
        file,
        publicPath: `${publicDir}/${file}`,
      });
    }
  }

  const ogEntry = og
    ? {
        file: `${name}-${srcHash}-og.jpg`,
        publicPath: `${publicDir}/${name}-${srcHash}-og.jpg`,
        width: 1200,
        height: 630,
      }
    : null;

  return {
    name,
    srcHash,
    width: origW,
    height: origH,
    variants,
    og: ogEntry,
    buffer,
    cacheKey: hashOf(
      Buffer.from(`${srcHash}|${name}|${targets.join(",")}|${og ? 1 : 0}|${CACHE_VERSION}`)
    ),
  };
}

/**
 * Encode (or copy from cache) every variant of a plan into `outDir`.
 * @returns {Promise<{ encoded: boolean }>}
 */
export async function materialize(plan, { cacheRoot, outDir }) {
  const cacheDir = join(cacheRoot, plan.cacheKey);
  const manifestPath = join(cacheDir, "manifest.json");
  let encoded = false;

  if (!existsSync(manifestPath)) {
    encoded = true;
    ensure(cacheDir);
    const buf = plan.buffer;

    for (const v of plan.variants) {
      const pipeline = sharp(buf, { failOn: "none" })
        .rotate()
        .resize({ width: v.width, withoutEnlargement: true });
      if (v.format === "jpg") pipeline.flatten({ background: "#ffffff" });
      const fmt = v.format === "jpg" ? "jpeg" : v.format;
      const opts = FORMATS.find((f) => f.ext === v.format).opts;
      await pipeline.toFormat(fmt, opts).toFile(join(cacheDir, v.file));
    }

    if (plan.og) {
      await sharp(buf, { failOn: "none" })
        .rotate()
        .resize({ width: 1200, height: 630, fit: "cover", position: "attention" })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(join(cacheDir, plan.og.file));
    }

    writeFileSync(
      manifestPath,
      JSON.stringify({
        srcHash: plan.srcHash,
        files: [...plan.variants.map((v) => v.file), ...(plan.og ? [plan.og.file] : [])],
      }),
      "utf8"
    );
  }

  ensure(outDir);
  for (const v of plan.variants) copyFileSync(join(cacheDir, v.file), join(outDir, v.file));
  if (plan.og) copyFileSync(join(cacheDir, plan.og.file), join(outDir, plan.og.file));

  return { encoded };
}

/** <picture> markup with srcset/sizes and explicit dimensions. */
export function pictureMarkup(
  plan,
  { alt, sizes, className = "", loading = "lazy", fetchpriority, decoding = "async" }
) {
  const srcset = (fmt) =>
    plan.variants
      .filter((v) => v.format === fmt)
      .map((v) => `${v.publicPath} ${v.width}w`)
      .join(", ");
  const jpgs = plan.variants.filter((v) => v.format === "jpg");
  const fallback = jpgs[jpgs.length - 1] || plan.variants[plan.variants.length - 1];
  const largest = plan.variants.reduce((a, b) => (b.width > a.width ? b : a), plan.variants[0]);

  const attrs = [
    `alt="${escapeAttr(alt)}"`,
    `width="${largest.width}"`,
    `height="${largest.height}"`,
    `sizes="${sizes}"`,
    `loading="${loading}"`,
    `decoding="${decoding}"`,
    fetchpriority ? `fetchpriority="${fetchpriority}"` : "",
    className ? `class="${className}"` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<picture>
    <source type="image/avif" srcset="${srcset("avif")}" sizes="${sizes}">
    <source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}">
    <img src="${fallback.publicPath}" srcset="${srcset("jpg")}" ${attrs}>
  </picture>`;
}

export const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|tiff?)$/i;
export const isImageFile = (f) => IMAGE_EXT.test(f);
export const imageBase = (f) => basename(f, extname(f));

/** Read intrinsic dimensions without decoding the whole file. */
export async function imageDims(buffer) {
  try {
    const meta = await sharp(buffer, { failOn: "none" }).metadata();
    return { width: meta.width, height: meta.height };
  } catch {
    return { width: undefined, height: undefined };
  }
}

export function readImageSafe(path) {
  try {
    return readFileSync(path);
  } catch {
    return null;
  }
}

export function fileSize(path) {
  try {
    return statSync(path).size;
  } catch {
    return 0;
  }
}
