import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { movie } from '../test/fixtures.ts'
import MovieCard from './MovieCard.tsx'

describe('MovieCard', () => {
  it('renders title, year, rating, genre, and poster alt text', () => {
    render(<MovieCard movie={movie({ vote_average: 8 })} genre="Science Fiction" />)

    expect(screen.getByRole('heading', { name: 'Dune' })).toBeInTheDocument()
    expect(screen.getByText('2021 · Science Fiction')).toBeInTheDocument()
    expect(screen.getByText('8.0')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Poster for Dune' })).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w342/dune.jpg',
    )
  })

  it('shows a fallback when TMDB has no poster', () => {
    render(<MovieCard movie={movie({ poster_path: null })} />)

    expect(screen.getByText('No poster available')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('hides the rating badge when there are no votes', () => {
    render(<MovieCard movie={movie({ vote_count: 0, vote_average: 0 })} />)

    expect(screen.queryByText('0.0')).not.toBeInTheDocument()
  })

  it('says the release date is unknown when TMDB sent an empty date', () => {
    render(<MovieCard movie={movie({ release_date: '' })} />)

    expect(screen.getByText('Release date unknown')).toBeInTheDocument()
  })
})
