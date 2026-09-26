import { formatRating, posterUrl, releaseYear } from '../lib/format.ts'
import type { Movie } from '../types/tmdb.ts'

interface MovieCardProps {
  movie: Movie
  /** Primary genre label, resolved from the fetched genre list. */
  genre?: string
}

function MovieCard({ movie, genre }: MovieCardProps) {
  const poster = posterUrl(movie.poster_path, 'w342')
  const year = releaseYear(movie.release_date)

  return (
    // tabIndex makes the overview reachable by keyboard: it is only revealed on
    // hover, so without focus parity it would be unavailable to anyone not
    // using a pointer.
    //
    // The outline stays 2px at all times and merely changes colour, so it can
    // fade in; transitioning outline-width would snap instead.
    <article
      tabIndex={0}
      className="group h-full overflow-hidden rounded-xl border border-edge bg-card outline-2 outline-offset-2 outline-transparent transition duration-300 ease-card hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60 hover:outline-gold focus-visible:-translate-y-1 focus-visible:outline-gold motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-2/3 overflow-hidden bg-canvas">
        {poster ? (
          <img
            src={poster}
            alt={`Poster for ${movie.title}`}
            width={342}
            height={513}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-card group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <p className="flex h-full items-center justify-center px-4 text-center text-xs text-ink-muted">
            No poster available
          </p>
        )}

        {movie.vote_count > 0 && (
          <span className="absolute top-2 right-2 rounded-md bg-black/75 px-2 py-1 text-xs font-semibold text-gold">
            {formatRating(movie.vote_average)}
          </span>
        )}

        {movie.overview && (
          <p className="absolute inset-x-0 bottom-0 line-clamp-6 translate-y-full bg-linear-to-t from-black/95 to-black/10 p-3 pt-12 text-xs leading-relaxed text-ink opacity-0 transition duration-300 ease-card group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none">
            {movie.overview}
          </p>
        )}
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-medium" title={movie.title}>
          {movie.title}
        </h3>
        <p className="mt-1 truncate text-xs text-ink-muted">
          {[year, genre].filter(Boolean).join(' \u00b7 ') || 'Release date unknown'}
        </p>
      </div>
    </article>
  )
}

export default MovieCard
