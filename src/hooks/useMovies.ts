import { useCallback, useEffect, useState } from 'react'
import { fetchDiscoverMovies } from '../api/tmdb.ts'
import type { DiscoverPage, DiscoverParams } from '../api/tmdb.ts'
import type { AsyncState } from '../lib/asyncState.ts'
import { errorMessage } from '../lib/errors.ts'

export type UseMoviesResult = AsyncState<DiscoverPage> & { retry: () => void }

interface Snapshot {
  request: DiscoverParams
  attempt: number
  state: AsyncState<DiscoverPage>
}

function sameRequest(left: DiscoverParams, right: DiscoverParams): boolean {
  return (
    left.genreId === right.genreId &&
    left.page === right.page &&
    left.sortKey === right.sortKey &&
    left.direction === right.direction
  )
}

export function useMovies(request: DiscoverParams): UseMoviesResult {
  const { genreId = null, page = 1, sortKey = 'vote_average', direction = 'desc' } =
    request
  const currentRequest: DiscoverParams = { genreId, page, sortKey, direction }

  const [attempt, setAttempt] = useState(0)
  const [snapshot, setSnapshot] = useState<Snapshot>({
    request: currentRequest,
    attempt,
    state: { status: 'loading' },
  })

  const isCurrent =
    sameRequest(snapshot.request, currentRequest) && snapshot.attempt === attempt
  const state: AsyncState<DiscoverPage> = isCurrent
    ? snapshot.state
    : { status: 'loading' }

  useEffect(() => {
    const controller = new AbortController()
    const nextRequest: DiscoverParams = { genreId, page, sortKey, direction }

    fetchDiscoverMovies(nextRequest, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setSnapshot({
          request: nextRequest,
          attempt,
          state: { status: 'success', data: result },
        })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setSnapshot({
          request: nextRequest,
          attempt,
          state: { status: 'error', error: errorMessage(error) },
        })
      })

    return () => controller.abort()
  }, [genreId, page, sortKey, direction, attempt])

  const retry = useCallback(() => {
    setAttempt((count) => count + 1)
  }, [])

  return { ...state, retry }
}
