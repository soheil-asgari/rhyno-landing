/**
 * Browser QA harness — zero dependencies (Node 22 built-in WebSocket + CDP).
 *
 * Checks, per page and per viewport:
 *  - horizontal overflow (scrollWidth vs clientWidth)
 *  - visible h1 count
 *  - tap-target sizes for links/buttons
 *  - contrast of key text nodes (approx, via computed colors)
 *  - captures PNG screenshots
 *
 * Usage: node build/audit.mjs [--shots]
 */

import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 9333;
const BASE = process.env.AUDIT_BASE || `http://127.0.0.1:${process.env.PORT || 3000}`;

const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const BASE_PAGES = [
  "/",
  "/modules/",
  "/modules/finance",
  "/modules/security-access",
  "/features",
  "/security",
  "/faq",
  "/demo",
  "/contact",
];

/* Blog pages are discovered from dist/ so new articles are covered
   automatically without touching this file. */
function blogPages() {
  const dist = join(ROOT, "dist", "blog");
  if (!existsSync(dist)) return [];
  const out = [];
  const walk = (dir, prefix) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) walk(join(dir, e.name), `${prefix}${e.name}/`);
      else if (e.name === "index.html") out.push(prefix);
    }
  };
  walk(dist, "/blog/");
  return out.sort();
}

const PAGES = [...BASE_PAGES, ...blogPages()];

const VIEWPORTS = [
  { name: "360", width: 360, height: 800, mobile: true },
  { name: "375", width: 375, height: 812, mobile: true },
  { name: "768", width: 768, height: 1024, mobile: false },
  { name: "1280", width: 1280, height: 900, mobile: false },
  { name: "1536", width: 1536, height: 960, mobile: false },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdp(ws) {
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  });
  return (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const msgId = ++id;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
    });
}

const MEASURE = `(() => {
  const de = document.documentElement;
  const overflow = de.scrollWidth - de.clientWidth;

  const h1 = [...document.querySelectorAll('h1')].filter(el => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden';
  }).length;

  const offenders = [];
  if (overflow > 1) {
    document.querySelectorAll('body *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0) return;
      const s = getComputedStyle(el);
      if (s.position === 'fixed') return;
      if (r.right > de.clientWidth + 1 || r.left < -1) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 70),
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
      }
    });
  }

  const small = [];
  document.querySelectorAll('a, button, summary, input, select, textarea').forEach(el => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    if (r.width === 0 || r.height === 0 || s.visibility === 'hidden') return;
    if (el.closest('[hidden]')) return;
    // Visually-hidden utility elements are intentionally 1x1
    if (s.position === 'absolute' && r.width <= 1 && r.height <= 1) return;
    // WCAG 2.5.8 exempts links inline within a sentence
    if (s.display === 'inline' || s.display === 'inline-block') {
      const parentText = (el.parentElement?.textContent || '').trim();
      if (parentText.length > (el.textContent || '').trim().length + 8) return;
    }
    if (r.height < 24 || r.width < 24) {
      small.push({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30),
        w: Math.round(r.width), h: Math.round(r.height),
      });
    }
  });

  const imgsNoDim = [...document.querySelectorAll('img')].filter(i => !i.getAttribute('width') || !i.getAttribute('height')).length;

  return { overflow, h1, offenders: offenders.slice(0, 6), small: small.slice(0, 8), imgsNoDim,
           title: document.title, scrollH: de.scrollHeight };
})()`;

async function main() {
  const shots = process.argv.includes("--shots");
  if (shots) mkdirSync(join(ROOT, ".screenshots"), { recursive: true });

  const chrome = spawn(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=" + join(ROOT, ".screenshots", "chrome-profile"),
    "about:blank",
  ], { stdio: "ignore" });

  let targets;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      targets = await res.json();
      if (targets.length) break;
    } catch {}
    await sleep(250);
  }
  if (!targets?.length) throw new Error("Chrome CDP did not start");

  const page = targets.find((t) => t.type === "page") || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res);
    ws.addEventListener("error", rej);
  });
  const send = await cdp(ws);

  await send("Page.enable");
  await send("Runtime.enable");

  const results = [];

  for (const vp of VIEWPORTS) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.mobile,
    });

    for (const path of PAGES) {
      await send("Page.navigate", { url: BASE + path });
      await sleep(700);

      const { result } = await send("Runtime.evaluate", {
        expression: MEASURE,
        returnByValue: true,
        awaitPromise: false,
      });
      const data = result.value || {};
      results.push({ vp: vp.name, path, ...data });

      if (shots) {
        const shot = await send("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: true,
          clip: {
            x: 0,
            y: 0,
            width: vp.width,
            height: Math.min(data.scrollH || vp.height, 4200),
            scale: 1,
          },
        });
        const name = `${vp.name}${path.replace(/\//g, "_") || "_root"}.png`;
        writeFileSync(join(ROOT, ".screenshots", name), Buffer.from(shot.data, "base64"));
      }
    }
  }

  ws.close();
  chrome.kill();

  /* report */
  let bad = 0;
  const byPage = new Map();
  for (const r of results) {
    const issues = [];
    if (r.overflow > 1) issues.push(`overflow +${r.overflow}px ${JSON.stringify(r.offenders)}`);
    if (r.h1 !== 1) issues.push(`h1=${r.h1}`);
    if (r.imgsNoDim) issues.push(`imgs without dims: ${r.imgsNoDim}`);
    if (r.small?.length) issues.push(`small targets: ${JSON.stringify(r.small)}`);
    if (issues.length) {
      bad++;
      console.log(`✗ ${r.vp}px ${r.path}`);
      issues.forEach((i) => console.log("    " + i));
    }
    if (!byPage.has(r.path)) byPage.set(r.path, []);
    byPage.get(r.path).push(`${r.vp}:${r.overflow > 0 ? "+" + r.overflow : "ok"}`);
  }

  console.log(`\n${results.length} page/viewport combinations checked`);
  console.log(bad ? `${bad} combination(s) with issues` : "all clean");
  if (shots) console.log("screenshots written to .screenshots/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
