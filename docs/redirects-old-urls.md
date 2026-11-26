# Old indexed URLs → new URLs (301)

`vercel.json` must stay strict JSON (Vercel does not allow comments), so the
placeholder for the old indexed URLs lives here instead.

All URLs changed in the redesign, so every previously indexed address needs a
301. Paste the entries below into the `redirects` array in `vercel.json`
(after the two existing `index.html` entries).

```json
{
  "redirects": [
    { "source": "/index.html", "destination": "/", "permanent": true },
    { "source": "/modules/index.html", "destination": "/modules/", "permanent": true },

    "// ---- OLD INDEXED URLS — FILL IN BEFORE DEPLOY ----",
    { "source": "/OLD-PATH-1", "destination": "/modules/finance", "permanent": true },
    { "source": "/OLD-PATH-2", "destination": "/security", "permanent": true }
  ]
}
```

## Known old → new mapping

| Old address | New address |
|---|---|
| `/contact.html` | `/contact` |
| `/#categoryOverview` | `/modules/` |
| `/#detail-highlights` | `/features` |
| `/#detail-modules` | `/modules/` |
| `/#detail-tech` | `/security` |
| `/#detail-matrix` | `/features` |
| `/#detail-faq` | `/faq` |
| `/index.html#pricing` | `/demo` |
| `/index.html#features` | `/features` |
| `/login` | portal (external) |

## How to collect the real list

1. Google Search Console → **Pages** → export the list of indexed URLs.
2. Bing Webmaster Tools → **Site Explorer** → indexed URLs.
3. Any analytics tool → top landing pages for the last 12 months.
4. Map each old path to the closest new page (or `/` when nothing matches).

`cleanUrls` is enabled, so `/contact.html` also resolves to `/contact`
automatically. Explicit 301s are still preferred so link equity is transferred
without an extra hop.
