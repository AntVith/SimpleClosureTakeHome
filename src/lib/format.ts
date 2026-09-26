const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

export type PosterSize = 'w185' | 'w342' | 'w500' | 'w780'

/** Returns null when TMDB has no artwork, letting the caller pick a fallback. */
export function posterUrl(
  posterPath: string | null,
  size: PosterSize = 'w500',
): string | null {
  return posterPath ? `${IMAGE_BASE_URL}/${size}${posterPath}` : null
}

export function releaseYear(releaseDate: string | null | undefined): string | null {
  const year = releaseDate?.slice(0, 4)
  return year && /^\d{4}$/.test(year) ? year : null
}

export function formatRating(voteAverage: number): string {
  return voteAverage.toFixed(1)
}
