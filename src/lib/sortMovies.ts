import type { Movie } from '../types/tmdb.ts'

export const SORT_KEYS = [
  'vote_average',
  'popularity',
  'release_date',
  'title',
] as const

export type SortKey = (typeof SORT_KEYS)[number]
export type SortDirection = 'asc' | 'desc'

export const SORT_LABELS: Record<SortKey, string> = {
  vote_average: 'Rating',
  popularity: 'Popularity',
  release_date: 'Release date',
  title: 'Title',
}

/**
 * Describes the current order in the same terms as the list, not as
 * "ascending/descending" — those words read as the next click, not the state.
 */
export function directionLabel(key: SortKey, direction: SortDirection): string {
  if (key === 'title') {
    return direction === 'desc' ? 'Z to A' : 'A to Z'
  }
  if (key === 'release_date') {
    return direction === 'desc' ? 'Newest first' : 'Oldest first'
  }
  return direction === 'desc' ? 'High to low' : 'Low to high'
}

/** Type guards, so untrusted input (a query string) can be narrowed safely. */
export function isSortKey(value: unknown): value is SortKey {
  return SORT_KEYS.includes(value as SortKey)
}

export function isSortDirection(value: unknown): value is SortDirection {
  return value === 'asc' || value === 'desc'
}

const TMDB_SORT_FIELD: Record<SortKey, string> = {
  vote_average: 'vote_average',
  popularity: 'popularity',
  release_date: 'primary_release_date',
  title: 'title',
}

/** Maps our sort controls onto TMDB's sort_by so each page continues that order. */
export function toTmdbSortBy(key: SortKey, direction: SortDirection): string {
  return `${TMDB_SORT_FIELD[key]}.${direction}`
}

/**
 * TMDB sends an empty release_date for unscheduled titles, and Date.parse('')
 * is NaN. A NaN comparator result silently corrupts the whole sort, so unknown
 * dates are pinned before every real date instead, which puts them at the end
 * of the default newest-first ordering.
 */
const UNKNOWN_DATE = Number.MIN_SAFE_INTEGER

function releaseTime(movie: Movie): number {
  const parsed = Date.parse(movie.release_date)
  return Number.isNaN(parsed) ? UNKNOWN_DATE : parsed
}

const comparators: Record<SortKey, (a: Movie, b: Movie) => number> = {
  vote_average: (a, b) => a.vote_average - b.vote_average,
  popularity: (a, b) => a.popularity - b.popularity,
  release_date: (a, b) => releaseTime(a) - releaseTime(b),
  title: (a, b) => a.title.localeCompare(b.title),
}

/** Returns a new array: sorting React state in place would not re-render. */
export function sortMovies(
  movies: Movie[],
  key: SortKey,
  direction: SortDirection,
): Movie[] {
  const sign = direction === 'asc' ? 1 : -1
  return [...movies].sort((a, b) => comparators[key](a, b) * sign)
}
