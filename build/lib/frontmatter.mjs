/**
 * Minimal, strict YAML-subset front matter parser for blog articles.
 *
 * Supported:
 *   key: value
 *   key: [a, b]          (inline list)
 *   key:                 (block list follows)
 *     - a
 *     - b
 *
 * Anything else is reported as invalid front matter so a typo cannot
 * silently publish a broken article.
 */

const ALLOWED = new Set([
  "title",
  "description",
  "date",
  "updated",
  "category",
  "tags",
  "image_alt",
  "modules",
  "draft",
  "autolink",
]);

export class FrontMatterError extends Error {}

const unquote = (v) => {
  const s = v.trim();
  if (
    (s.startsWith('"') && s.endsWith('"') && s.length > 1) ||
    (s.startsWith("'") && s.endsWith("'") && s.length > 1)
  ) {
    return s.slice(1, -1);
  }
  return s;
};

export function parseFrontMatter(raw, file) {
  const text = String(raw).replace(/^\uFEFF/, "");
  if (!/^---\s*\r?\n/.test(text)) return { data: {}, body: text, hasFrontMatter: false };

  const end = text.slice(3).search(/\r?\n---\s*(\r?\n|$)/);
  if (end === -1) {
    throw new FrontMatterError(`${file}: front matter opened with "---" but never closed`);
  }
  const block = text.slice(3, 3 + end);
  const body = text.slice(3 + end).replace(/^\r?\n---\s*(\r?\n|$)/, "");

  const data = {};
  const lines = block.split(/\r?\n/);
  let currentKey = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || /^\s*#/.test(line)) continue;

    const listItem = /^\s*-\s*(.*)$/.exec(line);
    if (listItem) {
      if (!currentKey || !Array.isArray(data[currentKey])) {
        throw new FrontMatterError(
          `${file}: front matter line ${i + 1}: list item without a list key`
        );
      }
      const value = unquote(listItem[1]);
      if (value) data[currentKey].push(value);
      continue;
    }

    const kv = /^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/.exec(line);
    if (!kv) {
      throw new FrontMatterError(
        `${file}: front matter line ${i + 1} is not "key: value" → ${JSON.stringify(line)}`
      );
    }
    const key = kv[1];
    const rest = kv[2].trim();
    if (!ALLOWED.has(key)) {
      throw new FrontMatterError(
        `${file}: unknown front matter key "${key}" (allowed: ${[...ALLOWED].join(", ")})`
      );
    }
    if (key in data) {
      throw new FrontMatterError(`${file}: duplicate front matter key "${key}"`);
    }

    if (rest === "") {
      data[key] = [];
      currentKey = key;
      continue;
    }

    currentKey = null;
    if (rest.startsWith("[") && rest.endsWith("]")) {
      data[key] = rest
        .slice(1, -1)
        .split(",")
        .map((s) => unquote(s))
        .filter(Boolean);
      continue;
    }
    if (/^(true|false)$/i.test(rest)) {
      data[key] = rest.toLowerCase() === "true";
      continue;
    }
    data[key] = unquote(rest);
  }

  /* typed validation */
  for (const key of ["tags", "modules"]) {
    if (key in data && !Array.isArray(data[key])) data[key] = [data[key]];
  }
  for (const key of ["title", "description", "date", "updated", "category", "image_alt"]) {
    if (key in data && Array.isArray(data[key])) {
      if (data[key].length === 1) data[key] = data[key][0];
      else throw new FrontMatterError(`${file}: "${key}" must be a single value`);
    }
  }
  for (const key of ["date", "updated"]) {
    if (key in data && !/^\d{4}-\d{2}-\d{2}$/.test(String(data[key]))) {
      throw new FrontMatterError(
        `${file}: "${key}" must be YYYY-MM-DD, got ${JSON.stringify(data[key])}`
      );
    }
  }
  for (const key of ["draft", "autolink"]) {
    if (key in data && typeof data[key] !== "boolean") {
      throw new FrontMatterError(`${file}: "${key}" must be true or false`);
    }
  }

  return { data, body, hasFrontMatter: true };
}
