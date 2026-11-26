/**
 * Minimal static server that mimics Vercel's cleanUrls + trailingSlash:false.
 * Zero dependencies. Used for local QA and Lighthouse.
 *
 * Usage: node build/serve.mjs [port]
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const PORT = Number(process.argv[2] || process.env.PORT || 3000);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
};

async function isFile(p) {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}

async function resolve(pathname) {
  const clean = decodeURIComponent(pathname.split("?")[0]);
  const rel = clean.replace(/^\/+/, "");

  // Never serve internal sources
  if (/^(docs|build|templates|node_modules|\.git|\.screenshots)(\/|$)/.test(rel)) return null;

  const direct = join(ROOT, rel);
  if (rel && (await isFile(direct))) return direct;

  if (await isFile(direct + ".html")) return direct + ".html";

  if (await isFile(join(direct, "index.html"))) return join(direct, "index.html");

  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const file = await resolve(url.pathname);

  if (!file) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>404</h1><p>Not found</p>");
    return;
  }

  // 301 for explicit .html requests, matching vercel.json redirects
  if (/\.html$/.test(url.pathname)) {
    const to = url.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
    res.writeHead(301, { Location: to + url.search });
    res.end();
    return;
  }

  const body = await readFile(file);
  res.writeHead(200, {
    "Content-Type": TYPES[extname(file)] || "application/octet-stream",
    "Cache-Control": "no-cache",
  });
  res.end(body);
}).listen(PORT, () => {
  console.log(`serving ${ROOT} on http://127.0.0.1:${PORT}`);
});
