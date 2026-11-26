/**
 * Visual sanity check — verifies the design tokens actually landed in the
 * rendered page (font, colors, type scale, icon rendering, digit style).
 *
 * Usage: node build/visual.mjs
 */

import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 9336;
const BASE = process.env.AUDIT_BASE || "http://127.0.0.1:3000";
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

const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass });
  console.log(`${pass ? "✓" : "✗"} ${name}${detail ? " — " + detail : ""}`);
};

async function main() {
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      `--remote-debugging-port=${PORT}`,
      "--user-data-dir=" + join(ROOT, ".screenshots", "chrome-profile-vis"),
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
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: BASE + "/" });
  await sleep(1400);

  const evalJs = async (expr) => {
    const { result } = await send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    return result.value;
  };

  const tokens = await evalJs(`(() => {
    const cs = getComputedStyle(document.documentElement);
    const body = getComputedStyle(document.body);
    const h1 = document.querySelector('h1');
    const h1s = getComputedStyle(h1);
    const btn = document.querySelector('main a.btn-primary');
    const bs = getComputedStyle(btn);
    const card = document.querySelector('.card');
    const svg = document.querySelector('svg');
    return {
      brand600: cs.getPropertyValue('--color-brand-600').trim(),
      ink900: cs.getPropertyValue('--color-ink-900').trim(),
      radiusXl: cs.getPropertyValue('--radius-xl').trim(),
      shadowCard: cs.getPropertyValue('--shadow-card').trim().slice(0, 40),
      bodyFont: body.fontFamily,
      bodyBg: body.backgroundColor,
      bodyColor: body.color,
      h1Size: h1s.fontSize,
      h1Weight: h1s.fontWeight,
      h1Color: h1s.color,
      h1LetterSpacing: h1s.letterSpacing,
      btnBg: bs.backgroundColor,
      btnColor: bs.color,
      btnRadius: bs.borderRadius,
      btnHeight: Math.round(btn.getBoundingClientRect().height),
      cardBorder: card ? getComputedStyle(card).borderColor : null,
      svgCount: document.querySelectorAll('svg').length,
      imgCount: document.querySelectorAll('img').length,
      extScripts: [...document.querySelectorAll('script[src]')].map(s => s.src).filter(s => !s.startsWith(location.origin)),
      extLinks: [...document.querySelectorAll('link[rel="stylesheet"],link[rel="preload"],link[rel="preconnect"]')]
        .map(l => l.href).filter(h => !h.startsWith(location.origin)),
      fontLoaded: document.fonts.check('16px Vazirmatn'),
      fontStatus: [...document.fonts].map(f => f.family + ':' + f.status),
    };
  })()`);

  check("brand token resolves", tokens.brand600 === "#2563eb", tokens.brand600);
  check("ink token resolves", tokens.ink900 === "#141a22", tokens.ink900);
  check("radius token resolves", tokens.radiusXl === "1rem", tokens.radiusXl);
  check("shadow token resolves", !!tokens.shadowCard, tokens.shadowCard);
  check("Vazirmatn is the body font", /Vazirmatn/.test(tokens.bodyFont), tokens.bodyFont);
  check("Vazirmatn actually loaded", tokens.fontLoaded === true, tokens.fontStatus.join(", "));
  check("light theme background", tokens.bodyBg === "rgb(251, 252, 253)", tokens.bodyBg);
  check("body text uses ink-600", tokens.bodyColor === "rgb(74, 87, 104)", tokens.bodyColor);
  check("h1 uses display scale", parseFloat(tokens.h1Size) >= 52, tokens.h1Size);
  check("h1 is extrabold", tokens.h1Weight === "800", tokens.h1Weight);
  check("h1 uses ink-900", tokens.h1Color === "rgb(20, 26, 34)", tokens.h1Color);
  check("h1 has negative tracking", parseFloat(tokens.h1LetterSpacing) < 0, tokens.h1LetterSpacing);
  check("primary button is brand-600", tokens.btnBg === "rgb(37, 99, 235)", tokens.btnBg);
  check("primary button has white text", tokens.btnColor === "rgb(255, 255, 255)", tokens.btnColor);
  check("primary button is 44px+ tall", tokens.btnHeight >= 44, tokens.btnHeight + "px");
  check("icons are inline SVG", tokens.svgCount > 20, tokens.svgCount + " svg");
  check("no external scripts", tokens.extScripts.length === 0, tokens.extScripts.join(","));
  check("no external stylesheets/fonts", tokens.extLinks.length === 0, tokens.extLinks.join(","));

  /* Persian digits in visible copy */
  // Phone numbers and email addresses are intentionally Latin (dir="ltr").
  const digits = await evalJs(`(() => {
    const latin = [];
    const persian = [];
    document.querySelectorAll('h1,h2,h3,p,span,dd,dt,li,button,label,option,th,td').forEach(el => {
      if (el.children.length) return;
      if (el.closest('[dir="ltr"]')) return;
      const t = (el.textContent || '').trim();
      if (!t) return;
      if (/[0-9]/.test(t)) latin.push(t.slice(0, 50));
      if (/[۰-۹]/.test(t)) persian.push(t.slice(0, 30));
    });
    return { latin: latin.length, persian: persian.length, samples: latin.slice(0, 8) };
  })()`);
  check(
    "visible text uses Persian digits",
    digits.latin === 0,
    `latin=${digits.latin} persian=${digits.persian} ${JSON.stringify(digits.samples)}`
  );

  /* no neon / gradient text */
  const gradients = await evalJs(`(() => {
    const bad = [];
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el);
      if (s.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || /gradient/.test(s.backgroundImage) && el.textContent.trim().length > 0 && el.children.length === 0) {
        bad.push(el.tagName + '.' + String(el.className).slice(0,40));
      }
    });
    return bad.slice(0, 5);
  })()`);
  check("no gradient-clipped text", gradients.length === 0, gradients.join(" | "));

  /* motion respects reduced-motion */
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await sleep(300);
  const reduced = await evalJs(`(() => {
    const el = document.querySelector('a.btn-primary');
    return getComputedStyle(el).transitionDuration;
  })()`);
  check("reduced-motion collapses transitions", parseFloat(reduced) <= 0.01, reduced);
  await send("Emulation.setEmulatedMedia", { features: [] });

  ws.close();
  chrome.kill();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
