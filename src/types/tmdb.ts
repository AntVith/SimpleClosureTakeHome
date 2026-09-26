/**
 * Shapes returned by the TMDB v3 REST API, named to match the wire format
 * (snake_case) so the boundary between their payload and our code stays obvious.
 */

export interface Movie {
  id: number
  title: string
  original_title: string
  original_language: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  /** ISO date, but TMDB returns an empty string for unscheduled releases. */
  release_date: string
  genre_ids: number[]
  popularity: number
  vote_average: number
  vote_count: number
  adult: boolean
  video: boolean
}

export interface DiscoverResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export interface Genre {
  id: number
  name: string
}

export interface GenreListResponse {
  genres: Genre[]
}

/** TMDB sends this instead of the expected payload on a 4xx or 5xx. */
export interface TmdbErrorResponse {
  success: boolean
  status_code: number
  status_message: string
}
