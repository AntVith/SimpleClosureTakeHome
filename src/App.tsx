import { useMemo } from 'react'
import Controls from './components/Controls.tsx'
import MovieGrid from './components/MovieGrid.tsx'
import Navbar from './components/Navbar.tsx'
import Pagination from './components/Pagination.tsx'
import EmptyState from './components/states/EmptyState.tsx'
import ErrorState from './components/states/ErrorState.tsx'
import SkeletonGrid from './components/states/SkeletonGrid.tsx'
import { useGenres } from './hooks/useGenres.ts'
import { useMovies } from './hooks/useMovies.ts'
import { useViewState } from './hooks/useViewState.ts'
import { sortMovies } from './lib/sortMovies.ts'

function App() {
  const { state, update } = useViewState()
  const { genreId, sortKey, direction, page } = state

  const movies = useMovies({ genreId, sortKey, direction, page })
  const genres = useGenres()

  const results = movies.status === 'success' ? movies.data.movies : null

  const sorted = useMemo(
    () => (results ? sortMovies(results, sortKey, direction) : []),
    [results, sortKey, direction],
  )

  const showPager =
    movies.status === 'success' &&
    movies.data.totalPages > 1 &&
    sorted.length > 0

  function goToPage(nextPage: number) {
    update({ page: nextPage })
  }

  return (
    <div className="min-h-dvh">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <Controls
            genres={genres.status === 'success' ? genres.data : []}
            genresUnavailable={genres.status === 'error'}
            genreId={genreId}
            sortKey={sortKey}
            direction={direction}
            onGenreChange={(nextGenreId) =>
              update({ genreId: nextGenreId, page: 1 })
            }
            onSortKeyChange={(nextSortKey) =>
              update({ sortKey: nextSortKey, page: 1 })
            }
            onDirectionToggle={() =>
              update({
                direction: direction === 'desc' ? 'asc' : 'desc',
                page: 1,
              })
            }
          />
          {showPager && (
            <Pagination
              page={page}
              totalPages={movies.data.totalPages}
              onPageChange={goToPage}
              className="self-end sm:mb-0.5"
            />
          )}
        </div>

        <p className="sr-only" aria-live="polite">
          {movies.status === 'loading' && 'Loading movies'}
          {movies.status === 'error' && movies.error}
          {movies.status === 'success' &&
            (sorted.length === 0
              ? 'No movies found'
              : `${page} of ${movies.data.totalPages}, ${sorted.length} movies`)}
        </p>

        <main className="mt-8">
          {movies.status === 'loading' && <SkeletonGrid />}
          {movies.status === 'error' && (
            <ErrorState message={movies.error} onRetry={movies.retry} />
          )}
          {movies.status === 'success' &&
            (sorted.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <MovieGrid movies={sorted} genresById={genres.genresById} />
                {showPager && (
                  <Pagination
                    page={page}
                    totalPages={movies.data.totalPages}
                    onPageChange={goToPage}
                    scrollOnChange
                    className="mt-10 justify-center"
                  />
                )}
              </>
            ))}
        </main>
      </div>
    </div>
  )
}

export default App
