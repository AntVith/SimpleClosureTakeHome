import { describe, expect, it } from 'vitest'
import { formatRating, posterUrl, releaseYear } from './format.ts'

describe('releaseYear', () => {
  it('returns the four-digit year from an ISO date', () => {
    expect(releaseYear('2021-10-22')).toBe('2021')
  })

  it('returns null when the date is missing or not a year', () => {
    expect(releaseYear('')).toBeNull()
    expect(releaseYear(null)).toBeNull()
    expect(releaseYear(undefined)).toBeNull()
    expect(releaseYear('TBA')).toBeNull()
  })
})

describe('formatRating', () => {
  it('always shows one decimal place', () => {
    expect(formatRating(8)).toBe('8.0')
    expect(formatRating(7.54)).toBe('7.5')
    expect(formatRating(0)).toBe('0.0')
  })
})

describe('posterUrl', () => {
  it('builds a sized image URL', () => {
    expect(posterUrl('/dune.jpg', 'w342')).toBe(
      'https://image.tmdb.org/t/p/w342/dune.jpg',
    )
  })

  it('returns null when TMDB has no artwork', () => {
    expect(posterUrl(null)).toBeNull()
  })
})
