#!/usr/bin/env node
/**
 * X-SEPTION | Instagram -> catalogue.json sync
 *
 * Runs in GitHub Actions (see .github/workflows/sync-instagram.yml). The access
 * token lives in repository secrets and never reaches the browser. The website
 * reads the static catalogue.json written here and shows each listed post with
 * Instagram's own embed, so no images are copied into the repo.
 *
 * Only posts tagged with a group hashtag are listed:
 *   #xsShoes  #xsSneakers  #xsSocks  #xsJeans  #xsPants  #xsUnderwear  #xsSwimwear  #xsTops  #xsJackets   (required, pick one)
 *   #xsFormal  #xsCasual                                                (optional)
 *   #xsBeach  #xsBoardwalk  #xsSmartCasual  #xsBoardroom  #xsAfterHours  (optional zone)
 *   #xsNew  #xsLow  #xsSoldOut  #xsArchive                              (status; default limited drop)
 *   #xsKeep                                                             (stops the age-out rule)
 * First caption line = piece name. Brand is detected from the caption text.
 *
 * Environment:
 *   IG_ACCESS_TOKEN  (secret, required)  System-user or long-lived token
 *   IG_USER_ID       (secret, required)  Instagram professional account ID ("me" on graph.instagram.com)
 *   IG_API_HOST      (optional)          graph.facebook.com (default) or graph.instagram.com
 *   GRAPH_VERSION    (optional)          default v23.0
 *   MAX_AGE_DAYS     (optional)          default 45; older posts drop off unless #xsKeep
 *   MAX_ITEMS        (optional)          default 60
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUT_FILE = path.join(process.cwd(), 'catalogue.json');
const TOKEN = process.env.IG_ACCESS_TOKEN || '';
const USER_ID = process.env.IG_USER_ID || '';
const HOST = process.env.IG_API_HOST || 'graph.facebook.com';
const VERSION = process.env.GRAPH_VERSION || 'v23.0';
const MAX_AGE_DAYS = Number(process.env.MAX_AGE_DAYS || 45);
const MAX_ITEMS = Number(process.env.MAX_ITEMS || 60);
const MAX_PAGES = 6;

/* Houses on the floor (logo doc, Oct 2026). Most specific aliases first. */
const BRANDS = [
  ['Cesare Paciotti', ['cesare paciotti', 'paciotti']],
  ['Avenue George V Paris', ['avenue george v', 'george v']],
  ['A Fish Named Fred', ['a fish named fred', 'fish named fred']],
  ['R2 Amsterdam', ['r2 amsterdam']],
  ['Rock Revival', ['rock revival']],
  ['Psycho Bunny', ['psycho bunny']],
  ['Jo Ghost', ['jo ghost', 'joghost']],
  ['Milestone', ['milestone']],
  ['ALBERTO', ['alberto']],
  ['bugatti', ['bugatti']],
  ['Venturo', ['venturo']],
  ['Bruno Banani', ['bruno banani']],
  ['XPOOOS', ['xpooos']]
];
const GROUP_TAGS = { xsshoes: 'shoes', xssneakers: 'sneakers', xssocks: 'socks', xsjeans: 'jeans', xspants: 'pants', xsunderwear: 'underwear', xsswimwear: 'underwear', xstops: 'tops', xsjackets: 'jackets' };
const GROUP_LINE = { shoes: 'formal', sneakers: 'casual', socks: 'any', jeans: 'casual', pants: 'formal', underwear: 'any', tops: 'casual', jackets: 'formal' };
/* House lines (owner's list, 8 Oct 2026). Casual-only houses list as Casual; Milestone outerwear spans
   semi-formal to casual, so it shows under both. Houses not listed follow the group default. */
const BRAND_LINE = { 'Avenue George V Paris': 'casual', 'Psycho Bunny': 'casual', 'Rock Revival': 'casual', 'Venturo': 'casual', 'Milestone': 'any' };
const ZONE_TAGS = { xsbeach: 'Beach', xsboardwalk: 'Boardwalk', xssmartcasual: 'Smart Casual', xsboardroom: 'Boardroom', xsafterhours: 'After Hours' };
const FORMAL_ZONES = new Set(['Smart Casual', 'Boardroom']);
const STATUS_TAGS = { xsnew: 'new', xslow: 'low', xssoldout: 'sold', xsarchive: 'archived' };
const STATUS_ORDER = { new: 0, limited: 1, low: 2, sold: 3 };
const HASHTAG = /#[\p{L}\p{N}_]+/gu;
const PERMALINK = /^https:\/\/www\.instagram\.com\/(?:[\w.]+\/)?(p|reel|tv)\/([A-Za-z0-9_-]{5,40})\/?/;

function fail(message) {
  console.error(`sync-instagram: ${message}`);
  process.exit(1);
}

async function getJSON(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    /* Never print the URL: it carries the access token. */
    const msg = (body && body.error && body.error.message) || res.statusText;
    throw new Error(`Graph API ${res.status}: ${msg}`);
  }
  return body;
}

async function fetchMedia() {
  const fields = 'id,caption,permalink,timestamp,media_type';
  let url = `https://${HOST}/${VERSION}/${encodeURIComponent(USER_ID)}/media?fields=${encodeURIComponent(fields)}&limit=50&access_token=${encodeURIComponent(TOKEN)}`;
  const all = [];
  for (let page = 0; url && page < MAX_PAGES; page += 1) {
    const data = await getJSON(url);
    if (Array.isArray(data.data)) all.push(...data.data);
    url = data.paging && data.paging.next ? data.paging.next : null;
  }
  return all;
}

const tagsOf = (caption) => new Set((caption.match(HASHTAG) || []).map((t) => t.slice(1).toLowerCase()));
const textLines = (caption) => caption.split(/\r?\n/).map((l) => l.replace(HASHTAG, '').replace(/\s+/g, ' ').trim()).filter(Boolean);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function detectBrand(caption) {
  const text = ` ${caption.toLowerCase()} `;
  for (const [name, aliases] of BRANDS) {
    if (aliases.some((a) => new RegExp(`(^|[^a-z0-9])${escapeRe(a)}([^a-z0-9]|$)`).test(text))) return name;
  }
  return '';
}

function toItem(media) {
  const caption = typeof media.caption === 'string' ? media.caption : '';
  const tags = tagsOf(caption);
  const groupTag = Object.keys(GROUP_TAGS).find((t) => tags.has(t));
  if (!groupTag) return null;
  const group = GROUP_TAGS[groupTag];

  const link = typeof media.permalink === 'string' ? PERMALINK.exec(media.permalink) : null;
  if (!link) return null;

  let status = 'limited';
  for (const [tag, value] of Object.entries(STATUS_TAGS)) if (tags.has(tag)) status = value;
  const ageDays = (Date.now() - Date.parse(media.timestamp)) / 86400000;
  if (status !== 'archived' && Number.isFinite(ageDays) && ageDays > MAX_AGE_DAYS && !tags.has('xskeep')) status = 'archived';
  if (status === 'archived') return null;

  const zoneTag = Object.keys(ZONE_TAGS).find((t) => tags.has(t));
  const zone = zoneTag ? ZONE_TAGS[zoneTag] : '';
  const brand = detectBrand(caption);
  const line = tags.has('xsformal') ? 'formal'
    : tags.has('xscasual') ? 'casual'
    : zone ? (FORMAL_ZONES.has(zone) ? 'formal' : 'casual')
    : BRAND_LINE[brand] || GROUP_LINE[group];
  const lines = textLines(caption);

  return {
    id: link[2],
    group,
    line,
    zone,
    status,
    brand,
    name: (lines[0] || '').slice(0, 90),
    ig: `https://www.instagram.com/${link[1]}/${link[2]}/`,
    posted: typeof media.timestamp === 'string' ? media.timestamp.slice(0, 10) : ''
  };
}

async function readPrevious() {
  try { return JSON.parse(await readFile(OUT_FILE, 'utf8')); } catch { return null; }
}

async function main() {
  if (!TOKEN || !USER_ID) fail('IG_ACCESS_TOKEN and IG_USER_ID must be set as repository secrets.');
  const media = await fetchMedia();
  const items = media.map(toItem).filter(Boolean)
    .sort((a, b) => (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) || (a.posted < b.posted ? 1 : a.posted > b.posted ? -1 : 0))
    .slice(0, MAX_ITEMS);

  const previous = await readPrevious();
  if (previous && JSON.stringify(previous.items) === JSON.stringify(items)) {
    console.log(`sync-instagram: no changes (${items.length} posts listed).`);
    return;
  }
  const payload = { updated: new Date().toISOString(), source: 'instagram', items };
  await writeFile(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`sync-instagram: listed ${items.length} of ${media.length} posts.`);
}

main().catch((err) => fail(err.message));
