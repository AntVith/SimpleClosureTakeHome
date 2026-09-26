import type { SortDirection, SortKey } from '../lib/sortMovies.ts'
import { SORT_KEYS, SORT_LABELS, directionLabel } from '../lib/sortMovies.ts'
import type { Genre } from '../types/tmdb.ts'

interface ControlsProps {
  genres: Genre[]
  /** True when the genre list failed to load, so the filter degrades. */
  genresUnavailable: boolean
  genreId: number | null
  sortKey: SortKey
  direction: SortDirection
  onGenreChange: (genreId: number | null) => void
  onSortKeyChange: (sortKey: SortKey) => void
  onDirectionToggle: () => void
}

// Gold is reserved for the movie cards. These controls use a brightened border
// on keyboard focus, then blur after a completed pick so a leftover highlight
// does not sit on the page until the next click.
//
// The border is 2px at rest and only changes colour: growing its width on focus
// would shift the layout by a pixel. outline-hidden suppresses the native ring
// while keeping one in forced-colors mode.
const fieldClasses =
  'rounded-md border-2 border-edge bg-card px-3 py-2 text-sm text-ink transition-colors hover:border-ink-muted focus-visible:border-ink focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50'

function Controls({
  genres,
  genresUnavailable,
  genreId,
  sortKey,
  direction,
  onGenreChange,
  onSortKeyChange,
  onDirectionToggle,
}: ControlsProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Wrapping the control in its label associates the two without an id. */}
      <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-muted">
        Genre
        <select
          className={fieldClasses}
          value={genreId ?? ''}
          disabled={genresUnavailable}
          onChange={(event) => {
            onGenreChange(event.target.value ? Number(event.target.value) : null)
            // The pick is the whole interaction. Leaving focus here keeps a
            // highlight on screen until the user clicks elsewhere.
            event.currentTarget.blur()
          }}
        >
          <option value="">All genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-muted">
        Sort by
        <select
          className={fieldClasses}
          value={sortKey}
          onChange={(event) => {
            onSortKeyChange(event.target.value as SortKey)
            event.currentTarget.blur()
          }}
        >
          {SORT_KEYS.map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-muted">
        Order
        <button
          type="button"
          onClick={(event) => {
            onDirectionToggle()
            // detail is 0 for keyboard activation; only release after a pointer click.
            if (event.detail !== 0) event.currentTarget.blur()
          }}
          aria-pressed={direction === 'desc'}
          aria-label={`Current order: ${directionLabel(sortKey, direction)}. Reverse order.`}
          className={`${fieldClasses} inline-flex items-center gap-2 font-medium`}
        >
          <OrderIcon descending={direction === 'desc'} />
          {directionLabel(sortKey, direction)}
        </button>
      </label>

      {genresUnavailable && (
        <p className="text-xs text-ink-muted">
          Genre list unavailable, so filtering is disabled.
        </p>
      )}
    </div>
  )
}

function OrderIcon({ descending }: { descending: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M3 3.5h6M3 8h4M3 12.5h2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {descending ? (
        <path
          d="M13 3.5v9M10.5 10.25 13 12.75 15.5 10.25"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M13 12.5v-9M10.5 5.75 13 3.25 15.5 5.75"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

export default Controls
