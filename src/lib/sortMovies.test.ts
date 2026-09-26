import { describe, expect, it } from 'vitest'
import { movie } from '../test/fixtures.ts'
import {
  directionLabel,
  isSortDirection,
  isSortKey,
  sortMovies,
  toTmdbSortBy,
} from './sortMovies.ts'

const dune = movie({
  id: 1,
  title: 'Dune',
  vote_average: 8,
  popularity: 90,
  release_date: '2021-10-22',
})
const arrival = movie({
  id: 2,
  title: 'Arrival',
  vote_average: 7.9,
  popularity: 70,
  release_date: '2016-11-11',
})
const blade = movie({
  id: 3,
  title: 'Blade Runner 2049',
  vote_average: 7.5,
  popularity: 80,
  release_date: '2017-10-06',
})
const unscheduled = movie({
  id: 4,
  title: 'Untitled',
  release_date: '',
})

describe('sortMovies', () => {
  it('sorts by rating without mutating the input', () => {
    const input = [arrival, dune, blade]

    expect(sortMovies(input, 'vote_average', 'desc').map((item) => item.id)).toEqual([
      1, 2, 3,
    ])
    expect(sortMovies(input, 'vote_average', 'asc').map((item) => item.id)).toEqual([
      3, 2, 1,
    ])
    expect(input.map((item) => item.id)).toEqual([2, 1, 3])
  })

  it('sorts by popularity and title', () => {
    const input = [arrival, dune, blade]

    expect(sortMovies(input, 'popularity', 'desc').map((item) => item.title)).toEqual([
      'Dune',
      'Blade Runner 2049',
      'Arrival',
    ])
    expect(sortMovies(input, 'title', 'asc').map((item) => item.title)).toEqual([
      'Arrival',
      'Blade Runner 2049',
      'Dune',
    ])
  })

  it('uses localeCompare so title order is not code-point order', () => {
    const zoo = movie({ id: 10, title: 'Zoo' })
    const apple = movie({ id: 11, title: 'apple' })

    expect(sortMovies([zoo, apple], 'title', 'asc').map((item) => item.title)).toEqual([
      'apple',
      'Zoo',
    ])
  })

  it('pins an empty release_date before real dates so newest-first puts it last', () => {
    const input = [unscheduled, dune, arrival]

    expect(sortMovies(input, 'release_date', 'desc').map((item) => item.id)).toEqual([
      1, 2, 4,
    ])
    expect(sortMovies(input, 'release_date', 'asc').map((item) => item.id)).toEqual([
      4, 2, 1,
    ])
  })
})

describe('toTmdbSortBy', () => {
  it('maps UI sort keys onto TMDB sort_by values', () => {
    expect(toTmdbSortBy('vote_average', 'desc')).toBe('vote_average.desc')
    expect(toTmdbSortBy('popularity', 'asc')).toBe('popularity.asc')
    expect(toTmdbSortBy('release_date', 'desc')).toBe('primary_release_date.desc')
    expect(toTmdbSortBy('title', 'asc')).toBe('title.asc')
  })
})

describe('directionLabel', () => {
  it('describes the current order in list terms', () => {
    expect(directionLabel('vote_average', 'desc')).toBe('High to low')
    expect(directionLabel('popularity', 'asc')).toBe('Low to high')
    expect(directionLabel('release_date', 'desc')).toBe('Newest first')
    expect(directionLabel('release_date', 'asc')).toBe('Oldest first')
    expect(directionLabel('title', 'desc')).toBe('Z to A')
    expect(directionLabel('title', 'asc')).toBe('A to Z')
  })
})

describe('type guards', () => {
  it('accepts only whitelisted sort keys and directions', () => {
    expect(isSortKey('vote_average')).toBe(true)
    expect(isSortKey('revenue')).toBe(false)
    expect(isSortDirection('asc')).toBe(true)
    expect(isSortDirection('up')).toBe(false)
  })
})
