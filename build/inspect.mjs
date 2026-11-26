/**
 * Ad-hoc inspection helper (dev only).
 * Usage: node build/inspect.mjs [page]
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const page = process.argv[2] || "index.html";
const html = readFileSync(join(DIST, page), "utf8");

const header = (html.match(/<header[\s\S]*?<\/header>/) || [""])[0];
const footer = (html.match(/<footer[\s\S]*?<\/footer>/) || [""])[0];

const hrefs = (block) => [...block.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

const hashLinks = [...html.matchAll(/href="#([^"]*)"/g)].map((m) => m[1]);

console.log("page:", page);
console.log("header links:", hrefs(header).length, [...new Set(hrefs(header))].join(" "));
console.log("footer links:", hrefs(footer).length, [...new Set(hrefs(footer))].join(" "));
console.log("hash links:", hashLinks.length, [...new Set(hashLinks)].join(" "));
console.log("navs:", [...html.matchAll(/<nav[^>]*aria-label="([^"]+)"/g)].map((m) => m[1]).join(" | "));
console.log("h1:", (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, "").trim());
console.log("title:", (html.match(/<title>([^<]+)<\/title>/) || [])[1]);
console.log("desc len:", (html.match(/name="description" content="([^"]*)"/) || [])[1]?.length);
console.log("canonical:", (html.match(/rel="canonical" href="([^"]+)"/) || [])[1]);
console.log("jsonld types:", [...html.matchAll(/"@type":"([^"]+)"/g)].map((m) => m[1]).join(", "));
console.log("bytes:", html.length);
