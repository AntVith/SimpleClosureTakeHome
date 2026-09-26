# Marquee

A TMDB movie discover grid: filter by genre, sort by rating / popularity / date / title, and page through results. Built as a SimpleClosure take-home.

**Stack:** Vite 8, React 19, TypeScript, Tailwind v4.

## Quickstart

```bash
npm i
npm start
```

That is the only required path. `start` is an alias for Vite's dev server (`vite --open`).

A TMDB v3 API key lives in `.env` as `VITE_TMDB_API_KEY` so a clean clone runs. The brief published the key; see [Security](#security) for why that is a tradeoff, not a pattern. To use your own key, copy `.env.example` and request one at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).

| Script | What it does |
| --- | --- |
| `npm start` | Dev server |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest, watch mode |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | Oxlint |
| `npm run build` | Typecheck, then production bundle |

## Architecture

One screen, no router, no state library. View state is the URL. Data is two hooks over a thin TMDB client. UI is presentational.

```
App
├── useViewState    URL ↔ { genreId, sortKey, direction, page }
├── useMovies       GET /discover/movie  (aborts in-flight on change)
├── useGenres       GET /genre/movie/list  (once; failure does not block the grid)
└── Controls / Pagination / MovieGrid
        └── MovieCard
```

`src/api/tmdb.ts` is the only module that knows TMDB's query string. `buildDiscoverUrl` is pure so the request shape can be tested without `fetch`. Hooks never build URLs; they pass a `DiscoverParams` object.

### Why the request looks the way it does

The brief asks for one API filter. This app sends two, for different reasons:

- **`vote_count.gte=200` is always on.** `vote_average` is an unweighted mean. Without a floor, a 9.0 from four votes outranks a 7.8 from twenty thousand, and rating-desc looks broken. This is a data-quality decision, not the user-facing filter.
- **`with_genres` is optional.** First paint is all genres. Picking Action (or any other row from `/genre/movie/list`) adds `with_genres`. The list is fetched live rather than hardcoded so the dropdown stays a TMDB concern.

Sort is not client-only. Changing sort or page sends `sort_by` and `page` to TMDB so page 2 continues the same ranking as page 1. `sortMovies` still reorders the current page as a display pass (and is what the unit tests exercise). A client-only sort over a 20-item page would lie once pagination existed.

TMDB refuses discover pages past 500 even when `total_pages` is larger. The client caps there.

### URL as the source of truth

`?genre=27&sort=title&dir=asc&page=2` is the whole view. Defaults are omitted, so the first load stays `/`. `history.replaceState` writes changes; `pushState` would make Back undo each filter click.

Query params are untrusted. The parser is a whitelist: unknown sort keys, non-integer genres, and out-of-range pages become defaults. That is correctness for *this* app (a `NaN` genre produces a bad request), not a security control for TMDB.

### Async state and races

`useMovies` / `useGenres` share an `AsyncState<T>` union: loading, success, or error. Empty is not a status. It is a successful page with `results: []`.

Rapid filter changes abort the previous request. Loading is derived: if the in-flight snapshot does not match the current `{ genre, sort, page }`, the UI shows the skeleton even if an older page is still in memory. That avoids a flash of the wrong grid.

Genre fetch failure disables the genre `<select>` and leaves the movie grid up. Sorting and paging still work.

### Cards and grid

The grid is one `auto-fill` track (`minmax(150px, 1fr)`), not a column count per breakpoint. Skeletons use the same class so the layout does not jump when data arrives.

Each card has a poster (or a fallback), title, rating badge, and a `year · genre` line. Hover or keyboard focus lifts the card, gold-outlines it, and reveals the overview. `:focus-visible` is used instead of `:focus` so a pointer click does not leave a leftover ring; controls blur after a completed pick for the same reason. `prefers-reduced-motion` turns the motion off.

## Requirements

| Brief | What shipped |
| --- | --- |
| Repo ready for `npm i && npm start` | `start` script; key in `.env` |
| `GET /discover/movie` | `fetchDiscoverMovies`; page 1 is the default |
| One API filter | Always-on `vote_count.gte=200`; user-driven `with_genres` |
| Sort by a method and property | `Array.prototype.sort` on rating, popularity, date, or title; same order sent as `sort_by` |
| Grid of cards | `auto-fill` grid |
| Poster, title, extra property | Poster, title, rating (year and genre as well) |
| One interactive element | Hover / focus-visible lift, outline, and overview |

Beyond the brief: live genre list, URL-addressable state, pagination (capped at 500), loading / error / empty, and a Vitest suite.

## Testing

`npm test` runs 41 tests in jsdom. TMDB is never called; `fetch` is stubbed.

| Layer | File | What it proves |
| --- | --- | --- |
| URL builder | `src/api/tmdb.test.ts` | `with_genres` omitted vs set, `sort_by` / `page` forwarded, release date mapped to `primary_release_date` |
| Fetcher | same | Happy path, `TmdbError` on `!ok`, abort signal passed through, `total_pages` capped at 500 |
| Sort | `src/lib/sortMovies.test.ts` | Each key and direction, no mutation, `localeCompare` for titles, empty `release_date` pinned so newest-first puts unknowns last |
| Format | `src/lib/format.test.ts` | Year, `8 → 8.0`, null poster |
| URL state | `src/lib/urlState.test.ts` | Whitelist, page cap, defaults omitted, parse/build round-trip, `replaceState` |
| Errors | `src/lib/errors.test.ts` | TMDB message, network `TypeError`, unknown fallback |
| Card | `src/components/MovieCard.test.tsx` | Title, rating, poster alt, no-poster and no-date fallbacks |
| App | `src/App.test.tsx` | Skeleton then cards; genre / sort / page each refetch with the new query; genre and sort reset to page 1; error + retry; empty page |

Sort and page changes **must** hit the network. The suite asserts that. An older design sorted only on the client; the tests were written after pagination made that dishonest.

## Security

The real vulnerability is the API key. `VITE_*` values are inlined into the client bundle, so anyone can lift the key from DevTools and burn the quota. It is committed here only because the brief distributed it and `npm i && npm start` has to work. The correct production shape is a thin server-side proxy that holds the key; the browser would call that endpoint, not `api.themoviedb.org`.

SQL injection is not in scope: there is no database. XSS is the applicable class. React escapes JSX interpolation; this app never uses `dangerouslySetInnerHTML` and never writes a raw query param into the DOM. Genre names on screen come from the fetched id-to-name map, not from `?genre=`.

The URL whitelist does not protect TMDB. An attacker would call their API directly. It exists so *this* UI cannot construct a malformed request from a crafted link.

## Extending to other TMDB resources

`/discover/tv` is not shape-compatible with `/discover/movie`. TV items use `name`, `first_air_date`, and `original_name`. Supporting both is a mapping problem, not a folder problem.

The refactor I would do, and did not pre-build, because the brief only asked for movies:

```ts
// Wire types stay in src/types/tmdb.ts, named as TMDB sends them.

interface MediaItem {
  kind: 'movie' | 'tv'
  id: number
  title: string
  releaseDate: string
  posterPath: string | null
  voteAverage: number
  genreIds: number[]
}

function movieToMedia(movie: Movie): MediaItem { /* title, release_date, … */ }
function tvToMedia(show: TmdbTvShow): MediaItem { /* name, first_air_date, … */ }
```

Map once at the API boundary. Cards, sort, and format speak `MediaItem` and do not care which resource produced it. Building that layer now would be an unused abstraction.

A router would appear at the same time as a real second screen (movie detail, `/tv`). Until then it is a provider for one URL.

## With more time

**Playwright first.** Unit tests cannot see grid reflow, focus order, or a real browser's `history`. I would add Playwright across Chromium, Firefox, and WebKit, stub TMDB with `page.route()` so runs do not depend on a live third-party, take visual snapshots at three viewport widths, run `@axe-core/playwright` on the loaded grid and the error state, and wire a GitHub Actions workflow with trace-on-retry.

After that, in order:

- **MSW** so the unit, integration, and E2E layers share one network contract instead of hand-rolled `fetch` stubs.
- **TanStack Query** for cache, backoff, and dedupe, replacing the bespoke hooks.
- **Infinite scroll or a page-number jump.** Next/Prev is honest but slow if you want page 40.
- **The proxy above**, so the key never reaches the client.
- **A React error boundary** around the grid, for render-time failures the fetch `catch` does not see.
- **A Bayesian rating** (IMDb Top 250-style) instead of a hard `vote_count` floor, so a 7.8 from 20k votes can still outrank a 9.0 from 210.
- **A bundled genre fallback** if `/genre/movie/list` fails. More resilient, but it reintroduces the hardcoded list the live fetch was meant to avoid.
- **Storybook** for card states (no poster, no date, long title) without booting the app.

## What I did not add

No router, no Redux/Zustand, no component library, no `MediaItem` layer. Each would earn its keep on a second screen or a second TMDB resource. On one discover view they would hide the decisions this assignment is meant to show.
