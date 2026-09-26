import { TMDB_MAX_PAGE } from '../api/tmdb.ts'
import type { SortDirection, SortKey } from './sortMovies.ts'
import { isSortDirection, isSortKey } from './sortMovies.ts'

export interface ViewState {
  genreId: number | null
  sortKey: SortKey
  direction: SortDirection
  page: number
}

export const DEFAULT_VIEW: ViewState = {
  genreId: null,
  sortKey: 'vote_average',
  direction: 'desc',
  page: 1,
}

/**
 * Query params are untrusted. Anything not in the whitelist becomes a default
 * so a crafted URL cannot produce a malformed TMDB request or a bad sort.
 */
export function parseViewState(search: string): ViewState {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)

  const rawGenre = params.get('genre')
  const parsedGenre = rawGenre === null ? NaN : Number(rawGenre)
  const genreId =
    Number.isInteger(parsedGenre) && parsedGenre > 0 ? parsedGenre : DEFAULT_VIEW.genreId

  const sort = params.get('sort')
  const dir = params.get('dir')
  const parsedPage = Number(params.get('page'))
  const page =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? Math.min(parsedPage, TMDB_MAX_PAGE)
      : DEFAULT_VIEW.page

  return {
    genreId,
    sortKey: isSortKey(sort) ? sort : DEFAULT_VIEW.sortKey,
    direction: isSortDirection(dir) ? dir : DEFAULT_VIEW.direction,
    page,
  }
}

/** Defaults are omitted so the first-load URL stays clean. */
export function buildSearchString(state: ViewState): string {
  const params = new URLSearchParams()

  if (state.genreId) {
    params.set('genre', String(state.genreId))
  }
  if (state.sortKey !== DEFAULT_VIEW.sortKey) {
    params.set('sort', state.sortKey)
  }
  if (state.direction !== DEFAULT_VIEW.direction) {
    params.set('dir', state.direction)
  }
  if (state.page !== DEFAULT_VIEW.page) {
    params.set('page', String(state.page))
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export function writeViewState(state: ViewState): void {
  const next = `${window.location.pathname}${buildSearchString(state)}`
  window.history.replaceState(null, '', next)
}
