import { vi } from 'vitest'
import type { DiscoverResponse, GenreListResponse } from '../types/tmdb.ts'
import { discoverResponse, genreListFixture } from './fixtures.ts'

export function jsonResponse(body: unknown, status = 200): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

export function stubTmdb(options?: {
  discover?: DiscoverResponse | ((url: URL) => DiscoverResponse)
  genres?: GenreListResponse
  discoverError?: { status: number; body: unknown }
}): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const href = String(input)

    if (href.includes('/genre/movie/list')) {
      return jsonResponse(options?.genres ?? genreListFixture)
    }

    if (href.includes('/discover/movie')) {
      if (options?.discoverError) {
        return jsonResponse(options.discoverError.body, options.discoverError.status)
      }

      const payload =
        typeof options?.discover === 'function'
          ? options.discover(new URL(href))
          : (options?.discover ?? discoverResponse())

      return jsonResponse(payload)
    }

    return jsonResponse({ status_message: 'unmocked url' }, 404)
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

export function discoverUrls(fetchMock: ReturnType<typeof vi.fn>): URL[] {
  return fetchMock.mock.calls
    .map((call) => String(call[0]))
    .filter((href) => href.includes('/discover/movie'))
    .map((href) => new URL(href))
}
