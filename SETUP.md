# X-SEPTION lookbook: setup and upkeep

## 1. Files and where they go
Repo: `searchplaybook-crypto/xseption`, branch `main` (GitHub Pages).

| File | Path in the repo |
|---|---|
| index.html | `index.html` (replaces the current page) |
| catalogue.json | `catalogue.json` |
| sync-instagram.mjs | `scripts/sync-instagram.mjs` |
| sync-instagram.yml | `.github/workflows/sync-instagram.yml` |
| apple-touch-icon.png, icon-192.png | `assets/icons/` |
| llms.txt, README.md | repo root (replace the old ones) |

On a phone: open the repo in the browser, tap the 3 dots (⋯) > Add file > Create new file, type the full path (folders included), paste the content, then Commit changes.

## 2. How the edit is organised
Three sections, six groups. Every product slot is an Instagram post embed.

| Section | Groups |
|---|---|
| Shoes & sneakers | `shoes`, `sneakers` |
| Jeans & pants (Bottoms) | `jeans`, `pants` |
| Tops & jackets | `tops`, `jackets` |

The Formal / Casual switch filters every group. Until a section has posts, it shows a short "next drop lands on Instagram" panel with WhatsApp and Instagram buttons.

## 3. Add a drop by hand (works today, no setup)
Open `index.html` > tap the 3 dots (⋯) > Edit file > search for `var DROPS`. Add one line per post:
```
['https://www.instagram.com/p/POST_CODE/', 'sneakers', 'casual', 'new'],
```
- Group: `shoes` `sneakers` `jeans` `pants` `tops` `jackets`
- Line (optional): `formal` or `casual`. Defaults: shoes, pants, jackets = formal; sneakers, jeans, tops = casual.
- Status (optional): `new`, `low` or `sold`. Default is Limited drop.
- Gone for good: delete the line.

Copy the post link from Instagram: the 3 dots (⋯) on the post > Copy link.

## 4. Automatic sync from Instagram (optional, about 30 minutes once)
Needs admin access to X-SEPTION's Meta Business Suite (the integration flag in the Brand Kit report).

1. Instagram account set to Professional and linked to the X-SEPTION Facebook Page in Meta Business Suite.
2. developers.facebook.com > Create app > Business. Add the Instagram product (API setup with Facebook login).
3. Business Settings > Users > System users > Add (Admin). Assign the app, the Page and the Instagram account. Generate a token with `instagram_basic`, `pages_show_list`, `pages_read_engagement`, `business_management`. Set expiry to Never.
4. Find the Instagram account ID in Graph API Explorer: `me/accounts?fields=instagram_business_account`.
5. GitHub repo > Settings > Secrets and variables > Actions > New repository secret: `IG_ACCESS_TOKEN` and `IG_USER_ID`.
6. Actions tab > Sync Instagram edit > Run workflow. After that it runs every day at 06:17 SAST and commits only when the list changed.

The token stays in GitHub secrets. The website never calls the Instagram API; it reads `catalogue.json` and shows each post with Instagram's own embed.

### Caption tags for the sync
First caption line is the piece name. Name the brand in the caption.

| Purpose | Tags |
|---|---|
| Group (required) | `#xsShoes` `#xsSneakers` `#xsJeans` `#xsPants` `#xsTops` `#xsJackets` |
| Formal or casual (optional) | `#xsFormal` `#xsCasual` |
| Wardrobe zone (optional) | `#xsBeach` `#xsBoardwalk` `#xsSmartCasual` `#xsBoardroom` `#xsAfterHours` |
| Status | `#xsNew` `#xsLow` `#xsSoldOut` `#xsArchive` |
| Keep past 45 days | `#xsKeep` |

Example caption:
```
Jo Ghost tapered leather ankle boot
Limited sizes at Eastgate.
#xsShoes #xsAfterHours #xsNew
```

Posts without a group tag (store news, events) are never listed. Sold out: add `#xsSoldOut`. Gone for good: add `#xsArchive` or delete the post. Posts older than 45 days drop off unless tagged `#xsKeep`, so the page never shows stale stock. A line in `DROPS` overrides the synced version of the same post.

## 5. Links to use in GBP and Instagram
- Formal edit: `https://searchplaybook-crypto.github.io/xseption/?line=formal#shoes`
- Casual edit: `https://searchplaybook-crypto.github.io/xseption/?line=casual#tops`
- One post: `https://searchplaybook-crypto.github.io/xseption/?piece=POST_CODE` (opens the Ask sheet for that post)

## 6. Before go-live
- Keep `google0358e8a493fefd4f.html` in the repo root: it is the Google Search Console verification.
- The X star tab icon is built into `index.html`. The two files in `assets/icons/` add the icon for phone home screens and for Google Search results.
- After the new `index.html` is live, the old files `assets/logoxt.png` and `assets/xegstorebg1.webp` to `xegstorebg4.webp` are no longer used and can be deleted (about 1.6 MB).
- Confirm the Nelson Mandela Square level: the Brand Kit says Upper Level, the commerce brief says Lower Level. The page shows "Shop 39" only.
- Optional: Google Maps > the store listing > Share > Embed a map. Paste the `src` value into `CONFIG.stores.nms.embed` and `CONFIG.stores.eastgate.embed` in index.html to pin the exact GBP profile.
- When the site moves to x-seption.com, update the canonical, `og:url` and JSON-LD URLs in the head.

## 7. Photoreal category scenes
Three generic store scenes (generated in Canva from the store photos) illustrate Shoes, Bottoms and Tops & jackets. The page draws the lighting over each photo: lights switch on as the section scrolls in, and Formal or Casual spotlights one half and dims the other.

Rule for every scene image: **formal on the left half, casual on the right half.**

The scenes are already switched on in `index.html`. They load from six files in the repo:

| File | Path in the repo |
|---|---|
| shoes.webp, shoes-800.webp | `assets/scenes/` |
| bottoms.webp, bottoms-800.webp | `assets/scenes/` |
| tops.webp, tops-800.webp | `assets/scenes/` |

The `-800` copies are for phones (about 20 to 27 KB each); desktops get the 1600 px versions (about 60 to 76 KB). On a phone: repo > tap the 3 dots (⋯) > Add file > Upload files, open the `assets/scenes` folder path first (or type it when creating), and add all six.

To use ImageKit instead, search `scenes:` in `index.html` and paste the ImageKit link in place of each `assets/scenes/...` path; ImageKit then serves phone and desktop sizes itself. If an image ever fails, that scene is simply left out; the posts and buttons still show.

These are generated images, not photographs of the boutiques. Get Markus's sign-off before going live.

## 8. Entrance (hero): real store photos
The entrance uses only the two store photos. On the first visit the page stays dark until both photos are ready. Then the Nelson Mandela Square shopfront drops down like a screen, holds for a moment, splits down the middle and opens onto the Eastgate store, dimmed, with the X star, "Curated. Not Crowded." and Step inside. Scrolling down zooms in towards About. Repeat visits in the same session, and visitors who switch off motion, go straight to the dimmed Eastgate entrance.

| File | What it is | Path in the repo |
|---|---|---|
| eastgate.webp | Eastgate, square, laptops and desktops (about 100 KB) | `assets/hero/` |
| eastgate-m.webp | Eastgate, upright crop keeping the counter and the lit X-SEPTION sign, phones (about 57 KB) | `assets/hero/` |
| nms.webp | Nelson Mandela Square, top of the arch to the mannequins, laptops and desktops (about 74 KB) | `assets/hero/` |
| nms-m.webp | Nelson Mandela Square, full upright shot, phones (about 57 KB) | `assets/hero/` |

On a phone: repo > tap the 3 dots (⋯) > Add file > Upload files, add all four, and type `assets/hero/` in front of the names (or upload into that folder).

To change a photo later, upload a new file with the same name. Keep the rule: Eastgate is the background, Nelson Mandela Square is the doors.

If a photo is missing or slow: when the door photo is not ready within 3 seconds, the dark cover fades straight to the entrance; when the Eastgate photo is missing, the entrance shows the X star on a dark background. The old line-art entrance and drawings have been removed from the page.
