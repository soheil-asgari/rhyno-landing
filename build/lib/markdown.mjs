/**
 * Markdown → HTML for blog articles.
 *
 * Uses marked's lexer and a custom token walker instead of the renderer so we
 * can:
 *  - generate stable heading ids and a table of contents,
 *  - run automatic internal linking only on plain text nodes (never inside
 *    headings, links, code, image alt text or the TOC),
 *  - rewrite local body images into responsive <picture> markup.
 */

import { Marked } from "marked";
import { normalizeWithMap, isWholeWord, translitSlug } from "./text.mjs";

const md = new Marked({ gfm: true, breaks: false });

const AMP = "\u0026";
const ESC = { [AMP]: AMP + "amp;", "<": AMP + "lt;", ">": AMP + "gt;", '"': AMP + "quot;" };
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ESC[c]);

const INLINE_TAGS = new Set(["strong", "em", "del", "codespan", "br", "escape", "html", "link", "image"]);

/* ------------------------------------------------------------------ */
/* heading ids                                                         */
/* ------------------------------------------------------------------ */

function makeIdFactory() {
  const used = new Map();
  return (text) => {
    let base = translitSlug(text).slice(0, 60) || "section";
    const n = (used.get(base) || 0) + 1;
    used.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
}

/* ------------------------------------------------------------------ */
/* autolink planning                                                   */
/* ------------------------------------------------------------------ */

/**
 * Collect every plain-text node that may receive an auto-link, in document
 * order, excluding headings, links, code and image alt text.
 */
function collectTextNodes(tokens, out, { inHeading = false } = {}) {
  for (const t of tokens || []) {
    switch (t.type) {
      case "heading":
        collectTextNodes(t.tokens, out, { inHeading: true });
        break;
      case "paragraph":
        collectTextNodes(t.tokens, out, { inHeading });
        break;
      case "text":
        if (!inHeading) out.push(t);
        break;
      case "blockquote":
        collectTextNodes(t.tokens, out, { inHeading });
        break;
      case "list":
        for (const item of t.items || []) collectTextNodes(item.tokens, out, { inHeading });
        break;
      case "table":
        for (const cell of t.header || []) collectTextNodes(cell.tokens, out, { inHeading });
        for (const row of t.rows || [])
          for (const cell of row) collectTextNodes(cell.tokens, out, { inHeading });
        break;
      case "strong":
      case "em":
      case "del":
        collectTextNodes(t.tokens, out, { inHeading });
        break;
      case "link":
      case "image":
      case "codespan":
      case "code":
      case "html":
        break;
      default:
        if (t.type === "text" && !inHeading) out.push(t);
        break;
    }
  }
  return out;
}

const hrefKey = (href) =>
  String(href || "")
    .replace(/\/index\.html$/, "/")
    .replace(/\.html$/, "")
    .replace(/\/$/, "") || "/";

/**
 * Plan auto-links: longest phrase first, first occurrence per phrase,
 * max `limit` links, never to the current page, never overlapping.
 *
 * @returns {{ insertions: Map<object, Array<{start,end,phrase,href}>>, used: Array<{phrase,href}> }}
 */
export function planAutolinks(tokens, { links, limit = 5, currentPath = "", enabled = true }) {
  const insertions = new Map();
  const used = [];
  if (!enabled || !links?.length) return { insertions, used };

  const nodes = collectTextNodes(tokens, []);
  const phrases = links
    .map((l) => ({ ...l, norm: normalizeWithMap(l.phrase).out }))
    .filter((l) => l.norm.length > 1 && hrefKey(l.href) !== hrefKey(currentPath))
    .sort((a, b) => b.norm.length - a.norm.length);

  for (const p of phrases) {
    if (used.length >= limit) break;
    let found = null;

    for (const node of nodes) {
      const raw = node.text ?? "";
      if (!raw) continue;
      const { out, map } = normalizeWithMap(raw);
      let idx = out.indexOf(p.norm);
      while (idx !== -1) {
        const s = map[idx];
        const e = map[idx + p.norm.length - 1] + 1;
        if (isWholeWord(out, idx, idx + p.norm.length) && !overlaps(insertions.get(node), s, e)) {
          found = { node, start: s, end: e };
          break;
        }
        idx = out.indexOf(p.norm, idx + 1);
      }
      if (found) break;
    }

    if (found) {
      const list = insertions.get(found.node) || [];
      list.push({ start: found.start, end: found.end, phrase: p.phrase, href: p.href });
      list.sort((a, b) => a.start - b.start);
      insertions.set(found.node, list);
      used.push({ phrase: p.phrase, href: p.href });
    }
  }

  return { insertions, used };
}

function overlaps(list, s, e) {
  if (!list) return false;
  return list.some((x) => s < x.end && e > x.start);
}

/* ------------------------------------------------------------------ */
/* inline rendering                                                    */
/* ------------------------------------------------------------------ */

function renderTextNode(t, ctx) {
  const raw = t.text ?? "";
  const ins = ctx.insertions.get(t);
  if (!ins?.length) return esc(raw);

  let out = "";
  let cursor = 0;
  for (const i of ins) {
    out += esc(raw.slice(cursor, i.start));
    out += `<a href="${esc(i.href)}" class="text-brand-700 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-600">${esc(
      raw.slice(i.start, i.end)
    )}</a>`;
    cursor = i.end;
  }
  out += esc(raw.slice(cursor));
  return out;
}

function renderInline(tokens, ctx) {
  let out = "";
  for (const t of tokens || []) {
    switch (t.type) {
      case "text":
        out += renderTextNode(t, ctx);
        break;
      case "escape":
        out += esc(t.text);
        break;
      case "strong":
        out += `<strong>${renderInline(t.tokens, ctx)}</strong>`;
        break;
      case "em":
        out += `<em>${renderInline(t.tokens, ctx)}</em>`;
        break;
      case "del":
        out += `<del>${renderInline(t.tokens, ctx)}</del>`;
        break;
      case "codespan":
        out += `<code dir="ltr" class="rounded bg-ink-100 px-1.5 py-0.5 text-[0.9em] text-ink-800">${esc(
          t.text
        )}</code>`;
        break;
      case "br":
        out += "<br>";
        break;
      case "link": {
        const href = t.href || "#";
        const external = /^https?:/i.test(href);
        const rel = external ? ' target="_blank" rel="noopener"' : "";
        out += `<a href="${esc(href)}"${rel} class="text-brand-700 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-600">${renderInline(
          t.tokens,
          ctx
        )}</a>`;
        break;
      }
      case "image":
        out += ctx.renderImage(t);
        break;
      case "html":
        out += t.text;
        break;
      default:
        if (t.tokens) out += renderInline(t.tokens, ctx);
        else if (t.text) out += esc(t.text);
        break;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* block rendering                                                     */
/* ------------------------------------------------------------------ */

function renderBlocks(tokens, ctx) {
  let out = "";
  for (const t of tokens || []) {
    switch (t.type) {
      case "space":
      case "def":
        break;

      case "heading": {
        const depth = Math.min(6, Math.max(2, t.depth));
        const id = ctx.nextId(t.text);
        ctx.headings.push({ depth, id, text: t.text });
        const inner = renderInline(t.tokens, { ...ctx, insertions: new Map() });
        out += `<h${depth} id="${id}" class="scroll-mt-24 group">${inner}</h${depth}>\n`;
        break;
      }

      case "paragraph":
        out += `<p>${renderInline(t.tokens, ctx)}</p>\n`;
        break;

      case "text":
        out += `<p>${renderInline(t.tokens || [{ type: "text", text: t.text }], ctx)}</p>\n`;
        break;

      case "blockquote":
        out += `<blockquote class="my-6 border-s-4 border-brand-200 bg-brand-50/50 px-5 py-3 text-ink-700">${renderBlocks(
          t.tokens,
          ctx
        )}</blockquote>\n`;
        break;

      case "list": {
        const tag = t.ordered ? "ol" : "ul";
        const cls = t.ordered ? "list-decimal" : "list-disc";
        out += `<${tag} class="my-5 ${cls} space-y-2 ps-6 marker:text-brand-500">\n`;
        for (const item of t.items || []) {
          const inner = renderBlocks(item.tokens, ctx).replace(/<\/p>\s*$/, "");
          out += `<li>${inner.replace(/^<p>/, "")}</li>\n`;
        }
        out += `</${tag}>\n`;
        break;
      }

      case "code": {
        const lang = (t.lang || "").split(/\s+/)[0];
        out += `<div class="my-6 overflow-x-auto rounded-xl border border-ink-200 bg-ink-950/95 p-4" dir="ltr"><pre class="text-[13px] leading-7 text-ink-100"><code${
          lang ? ` class="language-${esc(lang)}"` : ""
        }>${esc(t.text)}</code></pre></div>\n`;
        break;
      }

      case "table": {
        const head = (t.header || [])
          .map(
            (c) =>
              `<th scope="col" class="border-b border-ink-200 bg-ink-50 px-3 py-2 text-start text-xs font-extrabold text-ink-800">${renderInline(
                c.tokens,
                ctx
              )}</th>`
          )
          .join("");
        const body = (t.rows || [])
          .map(
            (row) =>
              `<tr class="border-b border-ink-100 last:border-0">${row
                .map(
                  (c) =>
                    `<td class="px-3 py-2 align-top text-sm text-ink-700">${renderInline(c.tokens, ctx)}</td>`
                )
                .join("")}</tr>`
          )
          .join("");
        out += `<div class="my-6 overflow-x-auto rounded-xl border border-ink-200"><table class="w-full border-collapse text-start"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>\n`;
        break;
      }

      case "hr":
        out += `<hr class="my-10 border-ink-200">\n`;
        break;

      case "html":
        out += t.text;
        break;

      default:
        if (t.tokens) out += renderBlocks(t.tokens, ctx);
        else if (t.text) out += `<p>${esc(t.text)}</p>\n`;
        break;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * @param {string} body            Markdown body (front matter already removed)
 * @param {object} opts
 * @param {string} opts.currentPath  canonical path of the article (for link exclusion)
 * @param {Array}  opts.links        internal-link rules
 * @param {boolean} opts.autolink
 * @param {(token) => string} opts.renderImage  body-image renderer
 */
export function renderMarkdown(body, { currentPath = "", links = [], autolink = true, renderImage }) {
  const tokens = md.lexer(body);
  const { insertions, used } = planAutolinks(tokens, { links, currentPath, enabled: autolink });

  const ctx = {
    insertions,
    headings: [],
    nextId: makeIdFactory(),
    renderImage: renderImage || ((t) => `<img src="${esc(t.href)}" alt="${esc(t.text)}" loading="lazy" decoding="async">`),
  };

  const html = renderBlocks(tokens, ctx);

  return {
    html,
    headings: ctx.headings,
    usedLinks: used,
    modules: [...new Set(used.map((u) => /^\/modules\/([a-z0-9-]+)/.exec(u.href)?.[1]).filter(Boolean))],
  };
}

/** Extract the first H1 (text + raw) so it can become the page title. */
export function takeFirstH1(body) {
  const tokens = md.lexer(body);
  let found = null;

  const strip = (list) =>
    list.filter((t) => {
      if (found) return true;
      if (t.type === "heading" && t.depth === 1) {
        found = { text: t.text.trim(), raw: t.raw };
        return false;
      }
      return true;
    });

  const walk = (list) =>
    list.map((t) => {
      if (found) return t;
      if (t.type === "blockquote" || t.type === "list") {
        if (t.items) t.items = t.items.map((it) => ({ ...it, tokens: walk(it.tokens) }));
        else t.tokens = walk(t.tokens);
        return t;
      }
      return t;
    });

  const remaining = walk(strip(tokens));

  if (!found) return { title: null, body };

  /* Rebuild the body from the raw source so formatting is preserved exactly. */
  const idx = body.indexOf(found.raw);
  const rebuilt = idx === -1 ? body : body.slice(0, idx) + body.slice(idx + found.raw.length);
  return { title: found.text, body: rebuilt.replace(/^\s*\n/, "") };
}

/** Plain text of a Markdown body (for excerpts / meta descriptions). */
export function markdownToText(body) {
  const walk = (tokens) => {
    let s = "";
    for (const t of tokens || []) {
      if (t.type === "heading" || t.type === "paragraph" || t.type === "text") {
        s += (t.text || "") + " ";
      } else if (t.type === "list") {
        for (const item of t.items || []) s += walk(item.tokens) + " ";
      } else if (t.type === "blockquote") {
        s += walk(t.tokens) + " ";
      } else if (t.type === "table") {
        for (const row of t.rows || []) for (const c of row) s += (c.text || "") + " ";
      }
    }
    return s;
  };
  return walk(md.lexer(body))
    .replace(/[*_`#>]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export { esc as escapeHtml };
