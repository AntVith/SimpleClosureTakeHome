import { useEffect, useMemo, useState } from 'react'
import { fetchGenres } from '../api/tmdb.ts'
import type { AsyncState } from '../lib/asyncState.ts'
import { errorMessage } from '../lib/errors.ts'
import type { Genre } from '../types/tmdb.ts'

export type UseGenresResult = AsyncState<Genre[]> & {
  /** For turning a movie's genre_ids into labels. Empty until loaded. */
  genresById: Map<number, string>
}

/**
 * Discover results carry only genre_ids, so the id-to-name map has to come
 * from here. The list is effectively static, so this runs once and never
 * refetches; a failure here degrades the genre filter without blocking the grid.
 */
export function useGenres(): UseGenresResult {
  const [state, setState] = useState<AsyncState<Genre[]>>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    fetchGenres(controller.signal)
      .then((genres) => {
        if (controller.signal.aborted) return
        setState({ status: 'success', data: genres })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ status: 'error', error: errorMessage(error) })
      })

    return () => controller.abort()
  }, [])

  const genresById = useMemo(() => {
    if (state.status !== 'success') return new Map<number, string>()
    return new Map(state.data.map((genre) => [genre.id, genre.name]))
  }, [state])

  return { ...state, genresById }
}
