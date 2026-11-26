/**
 * Text helpers for the blog pipeline: Persian normalization, ASCII slugs,
 * Jalali dates, excerpts and reading time.
 */

/* Persian/Arabic letter → ASCII transliteration used for stable slugs. */
const TRANSLIT = {
  "ا": "a", "آ": "a", "أ": "a", "إ": "a", "ء": "", "ب": "b", "پ": "p",
  "ت": "t", "ث": "s", "ج": "j", "چ": "ch", "ح": "h", "خ": "kh",
  "د": "d", "ذ": "z", "ر": "r", "ز": "z", "ژ": "zh", "س": "s", "ش": "sh",
  "ص": "s", "ض": "z", "ط": "t", "ظ": "z", "ع": "", "غ": "gh", "ف": "f",
  "ق": "gh", "ک": "k", "ك": "k", "گ": "g", "ل": "l", "م": "m", "ن": "n",
  "و": "v", "ؤ": "o", "ه": "h", "ة": "h", "ۀ": "h", "ی": "y", "ي": "y",
  "ئ": "y", "ى": "y",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

/** Transliterate Persian text to an ASCII slug (may return ""). */
export function translitSlug(input) {
  const s = String(input ?? "")
    .normalize("NFKC")
    .replace(/[\u200c\u200d\u200e\u200f\u200b]/g, " ")
    .toLowerCase();
  let out = "";
  for (const ch of s) {
    if (TRANSLIT[ch] !== undefined) out += TRANSLIT[ch];
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else out += " ";
  }
  return out
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const ZERO_WIDTH = /[\u200c\u200d\u200e\u200f\u200b]/g;

/**
 * Normalize Persian text for matching while keeping a map back to the
 * original string: ZWNJ/zero-width marks removed, Arabic ي/ك folded to
 * Persian ی/ک, Persian/Arabic digits folded to Latin.
 */
export function normalizeWithMap(input) {
  const s = String(input ?? "");
  let out = "";
  const map = [];
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ZERO_WIDTH.test(ch)) {
      ZERO_WIDTH.lastIndex = 0;
      continue;
    }
    let n = ch;
    if (n === "ي") n = "ی";
    else if (n === "ك") n = "ک";
    else if (n === "ۀ") n = "ه";
    else if (n >= "۰" && n <= "۹") n = String(n.charCodeAt(0) - 0x06f0);
    else if (n >= "٠" && n <= "٩") n = String(n.charCodeAt(0) - 0x0660);
    out += n;
    map.push(i);
  }
  return { out, map };
}

/** Normalize a phrase for matching (no index map needed). */
export const normalize = (s) => normalizeWithMap(s).out;

const WORD = /[\p{L}\p{N}]/u;

/** True when [start,end) in `hay` is delimited by non-word characters. */
export function isWholeWord(hay, start, end) {
  const before = start > 0 ? hay[start - 1] : "";
  const after = end < hay.length ? hay[end] : "";
  return !(before && WORD.test(before)) && !(after && WORD.test(after));
}

/** Strip Markdown/inline syntax down to plain text. */
export function stripMarkdown(md) {
  return String(md ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_~>#]+/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Trim to ~155 chars at a word boundary. */
export function excerpt(text, max = 155) {
  const t = stripMarkdown(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return (at > max * 0.6 ? cut.slice(0, at) : cut).trim() + "…";
}

/** Reading time in minutes (Persian ~200 words/min, min 1). */
export function readingMinutes(md) {
  const words = stripMarkdown(md).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/* ------------------------------------------------------------------ */
/* Jalali calendar (no dependencies)                                   */
/* ------------------------------------------------------------------ */

const div = (a, b) => ~~(a / b);

export function toJalali(gy, gm, gd) {
  const gDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  let y = gy <= 1600 ? gy - 621 : gy - 1600;
  const gy2 = gm > 2 ? y + 1 : y;
  let days =
    365 * y + div(gy2 + 3, 4) - div(gy2 + 99, 100) + div(gy2 + 399, 400) - 80 + gd + gDays[gm - 1];
  jy += 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    jy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

const FA_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export const faDigits = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

/** "2026-11-26" → "۵ آذر ۱۴۰۵" */
export function jalaliLabel(isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDate));
  if (!m) return String(isoDate);
  const [jy, jm, jd] = toJalali(Number(m[1]), Number(m[2]), Number(m[3]));
  return `${faDigits(jd)} ${FA_MONTHS[jm - 1]} ${faDigits(jy)}`;
}

/** "2026-11-26" → "1405/09/05" (ASCII digits, for <time> fallbacks) */
export function jalaliNumeric(isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDate));
  if (!m) return String(isoDate);
  const [jy, jm, jd] = toJalali(Number(m[1]), Number(m[2]), Number(m[3]));
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

/** Escape for XML (RSS) */
const AMP = "\u0026";
const XML_ESC = {
  [AMP]: AMP + "amp;",
  "<": AMP + "lt;",
  ">": AMP + "gt;",
  '"': AMP + "quot;",
  "'": AMP + "apos;",
};
export const xmlEsc = (s) => String(s).replace(/[&<>"']/g, (c) => XML_ESC[c]);
