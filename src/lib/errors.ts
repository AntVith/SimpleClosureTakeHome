import { TmdbError } from '../api/tmdb.ts'

/** Turns any thrown value into something worth showing a user. */
export function errorMessage(error: unknown): string {
  if (error instanceof TmdbError) {
    return error.message
  }

  // fetch rejects with a TypeError when the request never reached the server.
  if (error instanceof TypeError) {
    return 'Could not reach TMDB. Check your connection and try again.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong while loading movies.'
}
