import { useGenres } from './hooks/useGenres.ts'
import { useMovies } from './hooks/useMovies.ts'

function App() {
  const movies = useMovies(null)
  const genres = useGenres()

  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">
          Movie Discovery
        </h1>
        <p className="mt-2 text-ink-muted">
          Browsing movies from The Movie Database.
        </p>

        <dl className="mt-8 space-y-1 text-sm text-ink-muted">
          <div>
            <dt className="inline font-medium text-ink">movies: </dt>
            <dd className="inline">
              {movies.status === 'loading' && 'loading'}
              {movies.status === 'success' && `${movies.data.length} results`}
              {movies.status === 'error' && movies.error}
            </dd>
          </div>
          <div>
            <dt className="inline font-medium text-ink">genres: </dt>
            <dd className="inline">
              {genres.status === 'loading' && 'loading'}
              {genres.status === 'success' && `${genres.data.length} available`}
              {genres.status === 'error' && genres.error}
            </dd>
          </div>
        </dl>
      </header>
    </div>
  )
}

export default App
