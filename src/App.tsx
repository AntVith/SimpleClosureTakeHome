import MovieGrid from './components/MovieGrid.tsx'
import { useGenres } from './hooks/useGenres.ts'
import { useMovies } from './hooks/useMovies.ts'

function App() {
  const movies = useMovies(null)
  const { genresById } = useGenres()

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">
            Movie Discovery
          </h1>
          <p className="mt-2 text-ink-muted">
            Browsing movies from The Movie Database.
          </p>
        </header>

        <main className="mt-8">
          {movies.status === 'loading' && (
            <p className="text-sm text-ink-muted">Loading movies...</p>
          )}
          {movies.status === 'error' && (
            <p className="text-sm text-red-400">{movies.error}</p>
          )}
          {movies.status === 'success' && (
            <MovieGrid movies={movies.data} genresById={genresById} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
