/**
 * Interaction QA — drives the real page over CDP.
 * Covers: mobile nav, matrix filter, form validation, FAQ accordion, keyboard.
 *
 * Usage: node build/interact.mjs
 */

import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 9334;
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
  results.push({ name, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${name}${detail ? " — " + detail : ""}`);
};

async function main() {
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${PORT}`,
      "--user-data-dir=" + join(ROOT, ".screenshots", "chrome-profile-2"),
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
  await send("Page.bringToFront");
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });

  const evalJs = async (expr) => {
    const { result, exceptionDetails } = await send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (exceptionDetails) throw new Error(JSON.stringify(exceptionDetails));
    return result.value;
  };

  const goto = async (path) => {
    await send("Page.navigate", { url: BASE + path });
    await sleep(600);
  };

  /* ---------- 1. Mobile nav ---------- */
  await send("Emulation.setDeviceMetricsOverride", {
    width: 375,
    height: 812,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await goto("/");

  check(
    "mobile nav starts closed",
    (await evalJs(`document.getElementById('mobileNav').hidden === true`)) === true
  );
  check(
    "nav toggle has aria-expanded=false",
    (await evalJs(`document.getElementById('navToggle').getAttribute('aria-expanded')`)) === "false"
  );

  await evalJs(`document.getElementById('navToggle').click()`);
  await sleep(120);
  check(
    "nav opens on click",
    (await evalJs(`document.getElementById('mobileNav').hidden === false`)) === true
  );
  check(
    "aria-expanded flips to true",
    (await evalJs(`document.getElementById('navToggle').getAttribute('aria-expanded')`)) === "true"
  );
  check(
    "close icon shown when open",
    (await evalJs(
      `document.querySelector('[data-nav-icon="close"]').hidden === false`
    )) === true
  );

  await evalJs(
    `document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`
  );
  await sleep(120);
  check(
    "Escape closes nav",
    (await evalJs(`document.getElementById('mobileNav').hidden === true`)) === true
  );
  check(
    "focus returns to toggle after Escape",
    (await evalJs(`document.activeElement.id`)) === "navToggle"
  );

  /* ---------- 2. Matrix filter ---------- */
  await goto("/features");
  const total = await evalJs(`document.querySelectorAll('.matrix-row').length`);
  check("matrix rows pre-rendered", total === 54, `${total} rows`);

  await evalJs(`(() => {
    const i = document.getElementById('features-matrix-search');
    i.value = 'OCR';
    i.dispatchEvent(new Event('input', {bubbles:true}));
  })()`);
  await sleep(300);
  const afterSearch = await evalJs(
    `[...document.querySelectorAll('.matrix-row')].filter(r=>!r.hidden).length`
  );
  check("search filters rows", afterSearch > 0 && afterSearch < total, `${afterSearch} visible`);

  const countText = await evalJs(
    `document.querySelector('[data-matrix-count]').textContent.trim()`
  );
  check("result count updates", /نمایش/.test(countText), countText);

  await evalJs(`(() => {
    const s = document.getElementById('features-matrix-kind');
    s.value = 'گزارش';
    s.dispatchEvent(new Event('change', {bubbles:true}));
  })()`);
  await sleep(250);
  const afterKind = await evalJs(
    `[...document.querySelectorAll('.matrix-row')].filter(r=>!r.hidden).length`
  );
  check("kind filter combines with search", afterKind <= afterSearch, `${afterKind} visible`);

  await evalJs(`document.querySelector('[data-matrix-reset]').click()`);
  await sleep(250);
  const afterReset = await evalJs(
    `[...document.querySelectorAll('.matrix-row')].filter(r=>!r.hidden).length`
  );
  check("reset restores all rows", afterReset === total, `${afterReset} visible`);
  check(
    "reset button hidden again",
    (await evalJs(`document.querySelector('[data-matrix-reset]').hidden`)) === true
  );

  /* ---------- 3. Form validation ---------- */
  await goto("/demo");
  const formId = "demo-page";

  await evalJs(`document.getElementById('${formId}').requestSubmit()`);
  await sleep(200);
  check(
    "empty submit blocks and marks name invalid",
    (await evalJs(`document.getElementById('${formId}-name').getAttribute('aria-invalid')`)) ===
      "true"
  );
  check(
    "error message is visible",
    (await evalJs(`document.getElementById('${formId}-name-error').hidden === false`)) === true
  );
  check(
    "focus moved to first invalid field",
    (await evalJs(`document.activeElement.id`)) === `${formId}-name`
  );

  await evalJs(`(() => {
    document.getElementById('${formId}-name').value = 'سارا محمدی';
    document.getElementById('${formId}-org').value = 'گروه آریا';
    document.getElementById('${formId}-phone').value = '0912123456';
    document.getElementById('${formId}').requestSubmit();
  })()`);
  await sleep(200);
  check(
    "invalid phone (10 digits) rejected",
    (await evalJs(`document.getElementById('${formId}-phone').getAttribute('aria-invalid')`)) ===
      "true"
  );

  await evalJs(`(() => {
    document.getElementById('${formId}-phone').value = '08121234567';
    document.getElementById('${formId}').requestSubmit();
  })()`);
  await sleep(200);
  check(
    "phone not starting with 09 rejected",
    (await evalJs(`document.getElementById('${formId}-phone').getAttribute('aria-invalid')`)) ===
      "true"
  );

  await evalJs(`(() => {
    document.getElementById('${formId}-phone').value = '۰۹۱۲۱۲۳۴۵۶۷';
    document.getElementById('${formId}').requestSubmit();
  })()`);
  await sleep(900);
  check(
    "Persian-digit phone normalises and passes validation",
    (await evalJs(`document.getElementById('${formId}-phone').getAttribute('aria-invalid')`)) ===
      null
  );
  const statusShown = await evalJs(
    `!document.querySelector('#${formId} [data-form-status]').hidden`
  );
  check("status region shows a result (error without a real key)", statusShown === true);

  check(
    "honeypot input is present and hidden",
    (await evalJs(
      `(() => { const h = document.querySelector('#${formId} input[name="company_website"]');
         return !!h && h.closest('[aria-hidden="true"]') !== null && h.tabIndex === -1; })()`
    )) === true
  );

  /* ---------- 4. FAQ accordion ---------- */
  await goto("/faq");
  const openCount = await evalJs(`document.querySelectorAll('.accordion-item[open]').length`);
  check("one FAQ open by default", openCount === 1, `${openCount} open`);

  await evalJs(`(() => {
    const items = document.querySelectorAll('.accordion-item');
    items[2].open = true;
    items[2].dispatchEvent(new Event('toggle'));
  })()`);
  await sleep(200);
  const openAfter = await evalJs(`document.querySelectorAll('.accordion-item[open]').length`);
  check("opening another closes the first", openAfter === 1, `${openAfter} open`);

  /* ---------- 5. Keyboard focus visibility ---------- */
  await goto("/");

  // Real Tab from the top of the document: first stop must be the skip link
  await evalJs(`document.activeElement && document.activeElement.blur()`);
  await send("Input.dispatchKeyEvent", {
    type: "rawKeyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9,
  });
  await sleep(250);

  const skipLink = await evalJs(`(() => {
    const el = document.activeElement;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      isSkip: el.classList.contains('skip-link'),
      w: Math.round(r.width),
      h: Math.round(r.height),
      href: el.getAttribute('href'),
      outline: s.outlineStyle + ' ' + s.outlineWidth,
    };
  })()`);
  check(
    "first Tab reveals the skip link",
    !!skipLink && skipLink.isSkip && skipLink.w > 40 && skipLink.h > 20,
    JSON.stringify(skipLink)
  );

  // The focused element must actually paint a visible outline
  check(
    "focused element paints a visible outline",
    !!skipLink && /solid|dashed|dotted/.test(skipLink.outline) && parseFloat(skipLink.outline.split(" ")[1]) >= 2,
    skipLink && skipLink.outline
  );

  // And the same rule applies to a keyboard-focused button
  const btnRing = await evalJs(`(() => {
    const b = document.querySelector('main a.btn-primary');
    b.focus();
    const s = getComputedStyle(b);
    return { matches: b.matches(':focus-visible'), style: s.outlineStyle, width: s.outlineWidth };
  })()`);
  check(
    "keyboard focus shows an outline on the primary button",
    btnRing.matches && btnRing.style !== "none" && parseFloat(btnRing.width) >= 2,
    JSON.stringify(btnRing)
  );

  /* ---------- 6. No JS dependency for content ---------- */
  await send("Emulation.setScriptExecutionDisabled", { value: true });
  await goto("/");
  const noJs = await evalJs(`(() => ({
    h1: document.querySelectorAll('h1').length,
    rows: document.querySelectorAll('.matrix-row').length,
    faq: document.querySelectorAll('.accordion-item').length,
    modules: document.querySelectorAll('a[href^="/modules/"]').length,
  }))()`);
  await send("Emulation.setScriptExecutionDisabled", { value: false });
  check(
    "core content present with JS disabled",
    noJs.h1 === 1 && noJs.rows === 54 && noJs.faq === 7 && noJs.modules >= 15,
    JSON.stringify(noJs)
  );

  /* ---------- 7. Blog article navigation ---------- */
  await goto("/blog");
  const blogIndex = await evalJs(`(() => ({
    h1: document.querySelectorAll('h1').length,
    cards: document.querySelectorAll('main article').length,
    blogLinks: document.querySelectorAll('a[href^="/blog/"]').length,
    firstArticle: document.querySelector('main article a[href^="/blog/"]')?.getAttribute('href') || null,
  }))()`);

  const blogPath = blogIndex.firstArticle;
  check(
    "blog index renders article cards",
    blogIndex.h1 === 1 && blogIndex.cards >= 1 && blogIndex.blogLinks >= 1,
    JSON.stringify(blogIndex)
  );

  if (blogPath) {
    await goto(blogPath);
    const article = await evalJs(`(() => ({
      h1: document.querySelectorAll('h1').length,
      toc: !!document.querySelector('[aria-labelledby="toc-title"]'),
      tocLinksResolve: [...document.querySelectorAll('[aria-labelledby="toc-title"] a[href^="#"]')]
        .every(a => !!document.getElementById(a.getAttribute('href').slice(1))),
      eagerCover: !!document.querySelector('picture img[fetchpriority="high"]'),
      lazyBelow: [...document.querySelectorAll('img')].filter(i => i.getAttribute('loading') === 'lazy').length,
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].length,
      demoCta: !!document.querySelector('main a[href="/demo"]'),
    }))()`);
    check(
      "article page: single h1, TOC anchors resolve, eager cover",
      article.h1 === 1 && article.tocLinksResolve && article.eagerCover,
      JSON.stringify(article)
    );
    check(
      "article page has JSON-LD and a demo CTA",
      article.jsonLd >= 2 && article.demoCta === true,
      JSON.stringify({ jsonLd: article.jsonLd, demoCta: article.demoCta })
    );
  }

  /* ---------- 8. 404 / unknown route ---------- */
  await goto("/this-page-does-not-exist");
  check(
    "unknown route returns 404 page",
    (await evalJs(`document.body.textContent.includes('404')`)) === true
  );

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
