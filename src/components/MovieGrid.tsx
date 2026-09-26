import type { Movie } from '../types/tmdb.ts'
import MovieCard from './MovieCard.tsx'

interface MovieGridProps {
  movies: Movie[]
  genresById: Map<number, string>
}

function MovieGrid({ movies, genresById }: MovieGridProps) {
  return (
    // auto-fill rather than a fixed column count at each breakpoint: the track
    // count follows the container width, so it stays correct at any viewport.
    <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 p-0 sm:gap-5">
      {movies.map((movie) => (
        <li key={movie.id}>
          <MovieCard
            movie={movie}
            genre={genresById.get(movie.genre_ids[0] ?? -1)}
          />
        </li>
      ))}
    </ul>
  )
}

export default MovieGrid
