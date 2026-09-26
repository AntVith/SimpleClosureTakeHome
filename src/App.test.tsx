import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { discoverResponse, genreListFixture } from './test/fixtures.ts'
import { discoverUrls, jsonResponse, stubTmdb } from './test/mockFetch.ts'

afterEach(() => {
  vi.unstubAllGlobals()
})

async function renderedGrid() {
  render(<App />)
  return screen.findByRole('heading', { name: 'Dune' })
}

describe('App', () => {
  it('shows a loading grid, then the fetched cards', async () => {
    let releaseDiscover!: (value: Response) => void
    const discoverPromise = new Promise<Response>((resolve) => {
      releaseDiscover = resolve
    })

    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const href = String(input)
        if (href.includes('/genre/movie/list')) return jsonResponse(genreListFixture)
        if (href.includes('/discover/movie')) return discoverPromise
        return jsonResponse({ status_message: 'unmocked url' }, 404)
      }),
    )

    render(<App />)

    expect(screen.getByLabelText('Loading movies')).toBeInTheDocument()
    expect(screen.getByText('Loading movies')).toBeInTheDocument()

    releaseDiscover(
      new Response(JSON.stringify(discoverResponse()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    expect(await screen.findByRole('heading', { name: 'Dune' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Arrival' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Loading movies')).not.toBeInTheDocument()
  })

  it('refetches with with_genres when the genre changes, and resets to page 1', async () => {
    window.history.replaceState(null, '', '/?page=2')
    const fetchMock = stubTmdb()
    const user = userEvent.setup()

    await renderedGrid()
    await user.selectOptions(screen.getByLabelText('Genre'), '28')

    await waitFor(() => {
      const last = discoverUrls(fetchMock).at(-1)
      expect(last?.searchParams.get('with_genres')).toBe('28')
      expect(last?.searchParams.get('page')).toBe('1')
    })
  })

  it('refetches with a new sort_by when the sort changes', async () => {
    const fetchMock = stubTmdb()
    const user = userEvent.setup()

    await renderedGrid()
    const before = discoverUrls(fetchMock).length

    await user.selectOptions(screen.getByLabelText('Sort by'), 'popularity')

    await waitFor(() => {
      const urls = discoverUrls(fetchMock)
      expect(urls.length).toBeGreaterThan(before)
      expect(urls.at(-1)?.searchParams.get('sort_by')).toBe('popularity.desc')
      expect(urls.at(-1)?.searchParams.get('page')).toBe('1')
    })
  })

  it('refetches with the next page when Next is clicked', async () => {
    const fetchMock = stubTmdb()
    const user = userEvent.setup()

    await renderedGrid()
    await user.click(screen.getAllByRole('button', { name: 'Next page' })[0]!)

    await waitFor(() => {
      expect(discoverUrls(fetchMock).at(-1)?.searchParams.get('page')).toBe('2')
    })
    expect(window.location.search).toBe('?page=2')
  })

  it('shows an error and retries the same request', async () => {
    let fail = true
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const href = String(input)
        if (href.includes('/genre/movie/list')) return jsonResponse(genreListFixture)
        if (href.includes('/discover/movie')) {
          if (fail) {
            return jsonResponse(
              { status_message: 'Invalid API key: You must be granted a valid key.' },
              401,
            )
          }
          return jsonResponse(discoverResponse())
        }
        return jsonResponse({ status_message: 'unmocked url' }, 404)
      }),
    )
    const user = userEvent.setup()

    render(<App />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Invalid API key: You must be granted a valid key.')

    fail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('heading', { name: 'Dune' })).toBeInTheDocument()
  })

  it('shows an empty state when the page has no results', async () => {
    stubTmdb({
      discover: discoverResponse({ results: [], total_pages: 1, total_results: 0 }),
    })

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'No movies found' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument()
  })
})
