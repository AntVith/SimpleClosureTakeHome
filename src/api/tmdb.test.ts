import { afterEach, describe, expect, it, vi } from 'vitest'
import { discoverResponse } from '../test/fixtures.ts'
import { jsonResponse } from '../test/mockFetch.ts'
import {
  MIN_VOTE_COUNT,
  TMDB_MAX_PAGE,
  TmdbError,
  buildDiscoverUrl,
  fetchDiscoverMovies,
} from './tmdb.ts'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('buildDiscoverUrl', () => {
  it('omits with_genres when no genre is selected', () => {
    const url = new URL(buildDiscoverUrl())

    expect(url.origin + url.pathname).toBe(
      'https://api.themoviedb.org/3/discover/movie',
    )
    expect(url.searchParams.has('with_genres')).toBe(false)
    expect(url.searchParams.get('api_key')).toBeTruthy()
    expect(url.searchParams.get('language')).toBe('en-US')
    expect(url.searchParams.get('include_adult')).toBe('false')
    expect(url.searchParams.get('vote_count.gte')).toBe(String(MIN_VOTE_COUNT))
    expect(url.searchParams.get('page')).toBe('1')
    expect(url.searchParams.get('sort_by')).toBe('vote_average.desc')
  })

  it('sends with_genres when a genre is selected', () => {
    const url = new URL(buildDiscoverUrl({ genreId: 28 }))

    expect(url.searchParams.get('with_genres')).toBe('28')
  })

  it('forwards page and sort_by so later pages keep the same ranking', () => {
    const url = new URL(
      buildDiscoverUrl({
        page: 3,
        sortKey: 'popularity',
        direction: 'asc',
      }),
    )

    expect(url.searchParams.get('page')).toBe('3')
    expect(url.searchParams.get('sort_by')).toBe('popularity.asc')
  })

  it('maps release date onto TMDB primary_release_date', () => {
    const url = new URL(
      buildDiscoverUrl({ sortKey: 'release_date', direction: 'desc' }),
    )

    expect(url.searchParams.get('sort_by')).toBe('primary_release_date.desc')
  })
})

describe('fetchDiscoverMovies', () => {
  it('maps a successful payload onto DiscoverPage', async () => {
    const payload = discoverResponse({ page: 2, total_pages: 12 })
    const fetchMock = vi.fn((_input: RequestInfo | URL) => jsonResponse(payload))
    vi.stubGlobal('fetch', fetchMock)

    const page = await fetchDiscoverMovies({
      page: 2,
      sortKey: 'vote_average',
      direction: 'desc',
    })

    expect(page.movies).toEqual(payload.results)
    expect(page.page).toBe(2)
    expect(page.totalPages).toBe(12)

    const called = new URL(String(fetchMock.mock.calls[0]?.[0]))
    expect(called.searchParams.get('page')).toBe('2')
    expect(called.searchParams.get('sort_by')).toBe('vote_average.desc')
  })

  it('caps totalPages at TMDB_MAX_PAGE', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => jsonResponse(discoverResponse({ total_pages: 999 }))),
    )

    const page = await fetchDiscoverMovies()

    expect(page.totalPages).toBe(TMDB_MAX_PAGE)
  })

  it('throws TmdbError when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        jsonResponse(
          { status_message: 'Invalid API key: You must be granted a valid key.' },
          401,
        ),
      ),
    )

    const error = await fetchDiscoverMovies().catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(TmdbError)
    expect(error).toMatchObject({
      name: 'TmdbError',
      status: 401,
      message: 'Invalid API key: You must be granted a valid key.',
    })
  })

  it('passes an abort signal through to fetch', async () => {
    const controller = new AbortController()
    controller.abort()

    const fetchMock = vi.fn((_url: RequestInfo | URL, init?: RequestInit) => {
      if (init?.signal?.aborted) {
        return Promise.reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
      }
      return jsonResponse(discoverResponse())
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchDiscoverMovies({}, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    })
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), {
      signal: controller.signal,
    })
  })
})
