import { describe, expect, it } from 'vitest'
import { TMDB_MAX_PAGE } from '../api/tmdb.ts'
import {
  DEFAULT_VIEW,
  buildSearchString,
  parseViewState,
  writeViewState,
} from './urlState.ts'

describe('parseViewState', () => {
  it('returns defaults for an empty query string', () => {
    expect(parseViewState('')).toEqual(DEFAULT_VIEW)
    expect(parseViewState('?')).toEqual(DEFAULT_VIEW)
  })

  it('reads a valid query string', () => {
    expect(parseViewState('?genre=28&sort=title&dir=asc&page=3')).toEqual({
      genreId: 28,
      sortKey: 'title',
      direction: 'asc',
      page: 3,
    })
  })

  it('replaces anything outside the whitelist with defaults', () => {
    expect(parseViewState('?genre=Action&sort=revenue&dir=up&page=nope')).toEqual(
      DEFAULT_VIEW,
    )
    expect(parseViewState('?genre=0&page=0')).toEqual(DEFAULT_VIEW)
    expect(parseViewState('?page=-2')).toEqual(DEFAULT_VIEW)
    expect(parseViewState('?page=2.5')).toEqual(DEFAULT_VIEW)
  })

  it('caps page at TMDB_MAX_PAGE', () => {
    expect(parseViewState(`?page=${TMDB_MAX_PAGE}`).page).toBe(TMDB_MAX_PAGE)
    expect(parseViewState('?page=9999').page).toBe(TMDB_MAX_PAGE)
  })
})

describe('buildSearchString', () => {
  it('omits defaults so the first-load URL stays clean', () => {
    expect(buildSearchString(DEFAULT_VIEW)).toBe('')
  })

  it('writes only the non-default fields', () => {
    expect(
      buildSearchString({
        genreId: 28,
        sortKey: 'title',
        direction: 'asc',
        page: 2,
      }),
    ).toBe('?genre=28&sort=title&dir=asc&page=2')
  })
})

describe('round trip', () => {
  it('survives parse → build → parse', () => {
    const state = {
      genreId: 27,
      sortKey: 'popularity' as const,
      direction: 'asc' as const,
      page: 4,
    }

    expect(parseViewState(buildSearchString(state))).toEqual(state)
  })
})

describe('writeViewState', () => {
  it('replaceStates the current URL without adding history entries', () => {
    window.history.replaceState(null, '', '/browse')
    const lengthBefore = window.history.length

    writeViewState({
      genreId: 28,
      sortKey: 'title',
      direction: 'asc',
      page: 2,
    })

    expect(window.location.pathname).toBe('/browse')
    expect(window.location.search).toBe('?genre=28&sort=title&dir=asc&page=2')
    expect(window.history.length).toBe(lengthBefore)
  })
})
