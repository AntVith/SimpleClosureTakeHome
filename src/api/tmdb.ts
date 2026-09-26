import type {
  DiscoverResponse,
  Genre,
  GenreListResponse,
  Movie,
  TmdbErrorResponse,
} from '../types/tmdb.ts'

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
 * sort_by here is a *selection* criterion: it decides which 20 of ~760,000
 * results land on page 1. Display order is handled client-side by sortMovies.
 */
export function buildDiscoverUrl({
  genreId = null,
  minVoteCount = MIN_VOTE_COUNT,
  page = 1,
}: DiscoverParams = {}): string {
  const url = new URL(`${BASE_URL}/discover/movie`)
  url.searchParams.set('api_key', apiKey())
  url.searchParams.set('language', 'en-US')
  url.searchParams.set('page', String(page))
  url.searchParams.set('sort_by', 'popularity.desc')
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
): Promise<Movie[]> {
  const data = await tmdbFetch<DiscoverResponse>(
    buildDiscoverUrl(params),
    signal,
  )
  return data.results
}

export async function fetchGenres(signal?: AbortSignal): Promise<Genre[]> {
  const data = await tmdbFetch<GenreListResponse>(buildGenresUrl(), signal)
  return data.genres
}
