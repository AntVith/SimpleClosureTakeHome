import { useMemo } from 'react'
import Controls from './components/Controls.tsx'
import MovieGrid from './components/MovieGrid.tsx'
import Navbar from './components/Navbar.tsx'
import { useGenres } from './hooks/useGenres.ts'
import { useMovies } from './hooks/useMovies.ts'
import { useViewState } from './hooks/useViewState.ts'
import { sortMovies } from './lib/sortMovies.ts'

function App() {
  const { state, update } = useViewState()
  const { genreId, sortKey, direction } = state

  const movies = useMovies(genreId)
  const genres = useGenres()

  // Held separately from `movies` so the memo key is the results array itself,
  // which is stable across renders, rather than the hook's wrapper object.
  const results = movies.status === 'success' ? movies.data : null

  const sorted = useMemo(
    () => (results ? sortMovies(results, sortKey, direction) : []),
    [results, sortKey, direction],
  )

  return (
    <div className="min-h-dvh">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <Controls
          genres={genres.status === 'success' ? genres.data : []}
          genresUnavailable={genres.status === 'error'}
          genreId={genreId}
          sortKey={sortKey}
          direction={direction}
          onGenreChange={(nextGenreId) => update({ genreId: nextGenreId })}
          onSortKeyChange={(nextSortKey) => update({ sortKey: nextSortKey })}
          onDirectionToggle={() =>
            update({ direction: direction === 'desc' ? 'asc' : 'desc' })
          }
        />

        <p className="sr-only" aria-live="polite">
          {movies.status === 'success' && `${sorted.length} movies`}
        </p>

        <main className="mt-8">
          {movies.status === 'loading' && (
            <p className="text-sm text-ink-muted">Loading movies...</p>
          )}
          {movies.status === 'error' && (
            <p className="text-sm text-red-400">{movies.error}</p>
          )}
          {movies.status === 'success' && (
            <MovieGrid movies={sorted} genresById={genres.genresById} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
