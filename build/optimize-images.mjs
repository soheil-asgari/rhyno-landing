/**
 * Image optimizer — zero dependencies.
 * Uses headless Chrome (already required for QA) to re-encode the logo at the
 * sizes the site actually renders, plus a 1200x630 Open Graph image.
 *
 * Run: node build/optimize-images.mjs
 */

import { spawn } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 9335;
const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdp(ws) {
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
    }
  });
  return (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = ++id;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
}

const logoB64 = readFileSync(join(ROOT, "assets", "rhyno-logo.png")).toString("base64");
const logoData = `data:image/png;base64,${logoB64}`;

const TARGETS = [
  { file: "rhyno-logo-40.png", size: 80, note: "header/footer @2x (40px display)" },
  { file: "rhyno-logo-96.png", size: 96, note: "contact seal (88px display)" },
];

const OG = { file: "og-image.png", width: 1200, height: 630 };

async function main() {
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${PORT}`,
      "--user-data-dir=" + join(ROOT, ".screenshots", "chrome-profile-img"),
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let targets;
  for (let i = 0; i < 40; i++) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      if (targets.length) break;
    } catch {}
    await sleep(250);
  }
  const page = targets.find((t) => t.type === "page") || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener("open", res);
    ws.addEventListener("error", rej);
  });
  const send = await cdp(ws);
  await send("Page.enable");
  await send("Runtime.enable");

  const evalJs = async (expr) => {
    const { result } = await send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    return result.value;
  };

  /* ---- logo at display sizes ---- */
  for (const t of TARGETS) {
    const dataUrl = await evalJs(`(async () => {
      const img = new Image();
      img.src = ${JSON.stringify(logoData)};
      await img.decode();
      const c = document.createElement('canvas');
      c.width = ${t.size};
      c.height = ${t.size};
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, ${t.size}, ${t.size});
      return c.toDataURL('image/png');
    })()`);
    const buf = Buffer.from(dataUrl.split(",")[1], "base64");
    writeFileSync(join(ROOT, "assets", t.file), buf);
    console.log(`${t.file} — ${(buf.length / 1024).toFixed(1)} KB (${t.note})`);
  }

  /* ---- Open Graph card ---- */
  const ogHtml = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8">
<style>
  @font-face{font-family:V;src:url("file:///${join(ROOT, "assets", "fonts", "Vazirmatn-VariableFont_wght.ttf").replace(/\\/g, "/")}") format("truetype");font-weight:100 900}
  *{margin:0;box-sizing:border-box}
  body{width:${OG.width}px;height:${OG.height}px;font-family:V,sans-serif;background:#fbfcfd;
       display:flex;flex-direction:column;justify-content:center;padding:72px;position:relative;overflow:hidden}
  .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(20,26,34,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(20,26,34,.05) 1px,transparent 1px);background-size:56px 56px;mask-image:radial-gradient(ellipse 80% 70% at 70% 0%,#000 40%,transparent 100%)}
  .brand{display:flex;align-items:center;gap:14px;margin-bottom:34px;position:relative}
  .brand img{width:64px;height:64px;border-radius:14px}
  .brand span{font-size:30px;font-weight:800;color:#141a22}
  h1{font-size:62px;line-height:1.22;font-weight:800;color:#141a22;letter-spacing:-.02em;position:relative;max-width:900px}
  p{margin-top:26px;font-size:26px;line-height:1.7;color:#4a5768;position:relative;max-width:820px}
  .row{display:flex;gap:12px;margin-top:40px;position:relative}
  .chip{border:1px solid #dbe8fe;background:#eff5ff;color:#1d4ed8;border-radius:999px;padding:10px 22px;font-size:20px;font-weight:700}
  .bar{position:absolute;inset-inline:0;bottom:0;height:10px;background:#2563eb}
</style></head><body>
  <div class="grid"></div>
  <div class="brand"><img src="${logoData}"><span>راینو ERP</span></div>
  <h1>همه‌ی عملیات سازمان، در یک سیستم فارسی</h1>
  <p>مالی، منابع انسانی، قرارداد، انبار و مالیات؛ یکپارچه، با تقویم شمسی و انطباق با سامانه مؤدیان.</p>
  <div class="row"><span class="chip">۱۵ ماژول یکپارچه</span><span class="chip">ورود دومرحله‌ای</span><span class="chip">چندشرکتی</span></div>
  <div class="bar"></div>
</body></html>`;

  writeFileSync(join(ROOT, ".screenshots", "og.html"), ogHtml, "utf8");
  await send("Page.navigate", { url: `file:///${join(ROOT, ".screenshots", "og.html").replace(/\\/g, "/")}` });
  await sleep(1200);
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width: OG.width, height: OG.height, scale: 1 },
  });
  const ogBuf = Buffer.from(shot.data, "base64");
  writeFileSync(join(ROOT, "assets", OG.file), ogBuf);
  console.log(`${OG.file} — ${(ogBuf.length / 1024).toFixed(1)} KB (${OG.width}x${OG.height})`);

  ws.close();
  chrome.kill();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
