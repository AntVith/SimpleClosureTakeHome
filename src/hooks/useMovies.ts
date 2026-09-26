import { useCallback, useEffect, useState } from 'react'
import { fetchDiscoverMovies } from '../api/tmdb.ts'
import type { AsyncState } from '../lib/asyncState.ts'
import { errorMessage } from '../lib/errors.ts'
import type { Movie } from '../types/tmdb.ts'

export type UseMoviesResult = AsyncState<Movie[]> & { retry: () => void }

/** The request a stored result belongs to, so stale results can be ignored. */
interface Snapshot {
  genreId: number | null
  attempt: number
  state: AsyncState<Movie[]>
}

/**
 * Refetches whenever the genre changes. Kept separate from useGenres because
 * the two have different lifecycles: this one is driven by user input, the
 * genre list is fetched once.
 */
export function useMovies(genreId: number | null): UseMoviesResult {
  const [attempt, setAttempt] = useState(0)
  const [snapshot, setSnapshot] = useState<Snapshot>({
    genreId,
    attempt,
    state: { status: 'loading' },
  })

  // A snapshot from a previous genre is stale, so loading is derived here
  // during render rather than assigned from inside the effect, which would
  // queue an extra render pass on every filter change.
  const isCurrent = snapshot.genreId === genreId && snapshot.attempt === attempt
  const state: AsyncState<Movie[]> = isCurrent
    ? snapshot.state
    : { status: 'loading' }

  useEffect(() => {
    const controller = new AbortController()

    fetchDiscoverMovies({ genreId }, controller.signal)
      .then((movies) => {
        if (controller.signal.aborted) return
        setSnapshot({
          genreId,
          attempt,
          state: { status: 'success', data: movies },
        })
      })
      .catch((error: unknown) => {
        // A superseded request is our own doing, so it must not surface as an
        // error or every filter change would flash a failure state. Checking
        // the signal avoids sniffing at DOMException shapes.
        if (controller.signal.aborted) return
        setSnapshot({
          genreId,
          attempt,
          state: { status: 'error', error: errorMessage(error) },
        })
      })

    return () => controller.abort()
  }, [genreId, attempt])

  const retry = useCallback(() => {
    setAttempt((count) => count + 1)
  }, [])

  return { ...state, retry }
}
