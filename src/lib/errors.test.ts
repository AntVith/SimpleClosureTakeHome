import { describe, expect, it } from 'vitest'
import { TmdbError } from '../api/tmdb.ts'
import { errorMessage } from './errors.ts'

describe('errorMessage', () => {
  it('uses the TMDB status message when the API rejected the request', () => {
    expect(errorMessage(new TmdbError('Invalid API key', 401))).toBe('Invalid API key')
  })

  it('explains a network failure', () => {
    expect(errorMessage(new TypeError('Failed to fetch'))).toBe(
      'Could not reach TMDB. Check your connection and try again.',
    )
  })

  it('falls back for unknown values', () => {
    expect(errorMessage('nope')).toBe('Something went wrong while loading movies.')
    expect(errorMessage(new Error('boom'))).toBe('boom')
  })
})
