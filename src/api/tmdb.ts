import type { SortDirection, SortKey } from '../lib/sortMovies.ts'
import { toTmdbSortBy } from '../lib/sortMovies.ts'
import type {
  DiscoverResponse,
  Genre,
  GenreListResponse,
  Movie,
  TmdbErrorResponse,
} from '../types/tmdb.ts'

/** TMDB refuses discover pages past 500 even when total_pages is larger. */
export const TMDB_MAX_PAGE = 500

const BASE_URL = 'https://api.themoviedb.org/3'

/**
 * vote_average is an unweighted mean, so a film with four votes and a 9.0
 * average outranks a genuinely acclaimed one under our default rating sort.
 * This floor keeps statistically meaningless entries out of the results.
 */
export const MIN_VOTE_COUNT = 200

export class TmdbError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'TmdbError'
    this.status = status
  }
}

export interface DiscoverParams {
  /** Defaults to all genres; pass a TMDB genre id to narrow the results. */
  genreId?: number | null
  minVoteCount?: number
  page?: number
  sortKey?: SortKey
  direction?: SortDirection
}

export interface DiscoverPage {
  movies: Movie[]
  page: number
  totalPages: number
}

function apiKey(): string {
  const key = import.meta.env.VITE_TMDB_API_KEY
  if (!key) {
    throw new Error(
      'Missing VITE_TMDB_API_KEY. Copy .env.example to .env and add a TMDB API key.',
    )
  }
  return key
}

/**
 * Built separately from the fetch so the query-string logic is unit-testable
 * without mocking the network.
 *
 * sort_by is sent to TMDB so page 2 continues the same ranking as page 1.
 * sortMovies still reorders the current page as a display pass.
 */
export function buildDiscoverUrl({
  genreId = null,
  minVoteCount = MIN_VOTE_COUNT,
  page = 1,
  sortKey = 'vote_average',
  direction = 'desc',
}: DiscoverParams = {}): string {
  const url = new URL(`${BASE_URL}/discover/movie`)
  url.searchParams.set('api_key', apiKey())
  url.searchParams.set('language', 'en-US')
  url.searchParams.set('page', String(page))
  url.searchParams.set('sort_by', toTmdbSortBy(sortKey, direction))
  url.searchParams.set('include_adult', 'false')
  url.searchParams.set('include_video', 'false')
  url.searchParams.set('vote_count.gte', String(minVoteCount))

  if (genreId) {
    url.searchParams.set('with_genres', String(genreId))
  }

  return url.toString()
}

export function buildGenresUrl(): string {
  const url = new URL(`${BASE_URL}/genre/movie/list`)
  url.searchParams.set('api_key', apiKey())
  url.searchParams.set('language', 'en-US')
  return url.toString()
}

async function tmdbFetch<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })

  // fetch only rejects on network failure; 4xx and 5xx resolve with ok: false.
  // TMDB puts a human-readable reason in status_message, so prefer it.
  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as TmdbErrorResponse | null

    throw new TmdbError(
      body?.status_message ?? `TMDB request failed with status ${response.status}`,
      response.status,
    )
  }

  return (await response.json()) as T
}

export async function fetchDiscoverMovies(
  params: DiscoverParams = {},
  signal?: AbortSignal,
): Promise<DiscoverPage> {
  const data = await tmdbFetch<DiscoverResponse>(
    buildDiscoverUrl(params),
    signal,
  )
  return {
    movies: data.results,
    page: data.page,
    totalPages: Math.min(data.total_pages, TMDB_MAX_PAGE),
  }
}

export async function fetchGenres(signal?: AbortSignal): Promise<Genre[]> {
  const data = await tmdbFetch<GenreListResponse>(buildGenresUrl(), signal)
  return data.genres
}
