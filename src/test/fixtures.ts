import type { DiscoverResponse, GenreListResponse, Movie } from '../types/tmdb.ts'

export function movie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: 1,
    title: 'Dune',
    original_title: 'Dune',
    original_language: 'en',
    overview: 'A mythic family drama on a desert planet.',
    poster_path: '/dune.jpg',
    backdrop_path: '/dune-bg.jpg',
    release_date: '2021-10-22',
    genre_ids: [878],
    popularity: 100,
    vote_average: 8,
    vote_count: 12000,
    adult: false,
    video: false,
    ...overrides,
  }
}

export const moviesFixture: Movie[] = [
  movie({
    id: 1,
    title: 'Dune',
    vote_average: 8,
    popularity: 90,
    release_date: '2021-10-22',
  }),
  movie({
    id: 2,
    title: 'Arrival',
    vote_average: 7.9,
    popularity: 70,
    release_date: '2016-11-11',
  }),
  movie({
    id: 3,
    title: 'Blade Runner 2049',
    vote_average: 7.5,
    popularity: 80,
    release_date: '2017-10-06',
  }),
]

export function discoverResponse(
  overrides: Partial<DiscoverResponse> = {},
): DiscoverResponse {
  return {
    page: 1,
    results: moviesFixture.slice(0, 2),
    total_pages: 12,
    total_results: 240,
    ...overrides,
  }
}

export const genreListFixture: GenreListResponse = {
  genres: [
    { id: 28, name: 'Action' },
    { id: 27, name: 'Horror' },
    { id: 878, name: 'Science Fiction' },
  ],
}
