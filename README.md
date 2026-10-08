# X-SEPTION lookbook

The website of X-SEPTION, luxury menswear since 1991, at Nelson Mandela Square (Sandton) and Eastgate (Bedfordview). It is a single-page lookbook on GitHub Pages: every product is an Instagram post, and every enquiry goes to the WhatsApp concierge.

Live site: https://searchplaybook-crypto.github.io/xseption/

## What is in this repository

| Path | What it is |
|---|---|
| `index.html` | The whole site: layout, styles and script in one file |
| `assets/hero/` | Entrance photos: Eastgate (background) and Nelson Mandela Square (the doors) |
| `assets/scenes/` | Store scenes for Shoes, Bottoms and Tops & jackets |
| `assets/wardrobe/` | The wardrobe table (nine generic pieces) that the light moves across |
| `assets/icons/` | X star icons for phone home screens and Google Search (the browser tab icon is built into `index.html`) |
| `catalogue.json` | The list of Instagram posts shown on the site, written by the daily sync |
| `scripts/sync-instagram.mjs` and `.github/workflows/sync-instagram.yml` | Optional daily Instagram sync |
| `llms.txt` | Plain summary of the boutique for AI search tools |
| `google0358e8a493fefd4f.html` | Google Search Console verification. Do not delete |
| `SETUP.md` | Full setup and upkeep guide |

## Adding a drop by hand

Open `index.html`, tap the 3 dots (⋯) > Edit file, search for `var DROPS` and add one line per Instagram post:

```
['https://www.instagram.com/p/POST_CODE/', 'sneakers', 'casual', 'new'],
```

Groups: `shoes`, `sneakers`, `socks`, `jeans`, `pants`, `underwear`, `tops`, `jackets`. Delete the line when the piece is gone. SETUP.md covers the automatic Instagram sync.

Curated. Not Crowded.
