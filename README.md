# KIROKU — Anime Archive / Cinematic React UI V3

A cinematic anime discovery and personal watchlist website built using **React 19, Next.js App Router, TypeScript, and CSS**. KIROKU replaces the previous KYO. interface without replacing the existing anime API, routes, or watchlist storage format.

## What's new in V3

- Rebranded from KYO. to **KIROKU** throughout the interface, page titles, and metadata.
- Removed decorative asterisk/starburst symbols from visible UI, replacing them with film-inspired lines, discs, minimal dots, and clean insignia.
- Larger headline typography and more legible navigation, cards, synopsis text, search, library, and details.
- Rebuilt featured anime spotlight with **cinematic reveal**, slow background zoom, framed poster artwork, manual next/previous navigation, and timed slide rotation (paused on hover/focus).
- **Top 10 numbers moved to the upper-left**, partly outside the artwork, with muted translucency rather than massive solid numerals covering posters.
- **First-visit cinematic intro:** KIROKU wordmark, animated lighting, progress indicator, animated curtain exit, and a Skip Intro button.
- Smooth entrance and film-light wipe transitions between React pages, plus scroll-entrance reveals on the homepage.
- Subtle animated ambient particles. Effects respect `prefers-reduced-motion` and never block clicks.
- Maintained responsive designs for desktop, tablet, and mobile.

## Run locally

Requires **Node.js 20.9+**.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To verify production readiness, run:

```bash
npm run lint
npm run build
npm start
```

**Note:** `npm run lint` uses `tsc --noEmit` as the previous starter did.

## Deploy on Vercel

1. Extract this archive into a directory, preserving its structure.
2. Upload the project files to your GitHub repository, or replace the previous project's files.
3. In Vercel, import that repository as a Next.js project (or redeploy your existing Git-connected project).
4. No environment variables are required for this API prototype.
5. Verify catalog response and image loading after deploy. The catalog depends on third-party API uptime.

## Working functionality retained

- Popularity-based Top 10 and rating-ranked Top 10 via Kitsu API
- Currently airing anime feed
- Search `/search?q=...`, details `/anime/[id]`, and collection `/library`
- Personal browser collection: add/remove titles, watch status, episode progress
- Browser-local storage key **`kyo:library:v1` stays the same**, so people updating an existing KYO site on the *same domain and browser* won't lose their saved watchlists. The key is a compatibility detail, not visible branding.
- Teen-appropriate rating filter for catalog content (known G, PG, and PG-13)

## Where to edit

- `app/page.tsx` — homepage content, shelves, editorial sections
- `app/cinematic.css` — V3 colors, typography, cinematic motion, Top 10 layout, responsive overrides
- `components/cinematic-intro.tsx` — once-per-session intro; `kiroku:intro:seen:v3` session storage flag
- `components/ambient-particles.tsx` — floating decorative particles
- `components/page-transition.tsx` — React route entrance and light wipe
- `components/scroll-reveals.tsx` — intersection-based scroll animations
- `components/spotlight-hero.tsx` — animated featured anime carousel
- `components/site-header.tsx` — navigation and keyboard-driven search modal
- `components/charts.tsx` and `components/anime-card.tsx` — shelf scroll controls and poster cards
- `lib/kitsu.ts` — API adapter (unchanged)
- `components/library-provider.tsx` — storage logic (unchanged)

## Responsible use / next phase

The popularity and rating charts are based on **Kitsu data**, not Netflix viewership or KIROKU's own activity metrics. External catalog terms, caching policies, poster/cover licenses, and platform branding permissions should be reviewed before a public or commercial-scale launch. This starter doesn't stream anime, manage accounts, or provide cloud synchronization.

After we approve this V3 UI, Step 2 is adding Supabase authentication and cloud watchlist sync, including a safe migration from the browser collection.

**Tip:** The cinematic intro plays once per browser tab/session so it doesn't interrupt every navigation. Use the **Replay Intro** control in the footer to watch it again.


## V3.1 final visual polish

- Expanded the desktop header search field and widened the search dialog and Explore search bar.
- Reduced overlarge display headings slightly for better fit across desktop, tablet, and phone sizes.
- Moved **SCROLL TO DISCOVER** and the featured-anime navigation into one responsive bottom bar: side-by-side on desktop, stacked with reserved space on phones. This fixes their collision.
- No changes to Kitsu requests, route URLs, library storage format, or cinematic intro/particle logic.


## V3.2 spotlight title visibility

- Reduced featured anime title size on desktop, tablet, and mobile while keeping other headings intact.
- Long anime titles automatically use a smaller responsive font size.
- Removed the three-line cutoff for featured titles; long titles wrap in full, with the hero height able to grow rather than clipping them.
- No changes to the API, local library data, search, animation, or other page styles.
