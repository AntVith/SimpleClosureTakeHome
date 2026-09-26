interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  /** Scroll to the top after a change — used on the bottom control only. */
  scrollOnChange?: boolean
  className?: string
}

const buttonClasses =
  'inline-flex size-9 items-center justify-center rounded-md border-2 border-edge bg-card text-ink transition-colors hover:border-ink-muted focus-visible:border-ink focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-40'

function Pagination({
  page,
  totalPages,
  onPageChange,
  scrollOnChange = false,
  className = '',
}: PaginationProps) {
  const atStart = page <= 1
  const atEnd = page >= totalPages

  function goTo(next: number) {
    onPageChange(next)
    if (scrollOnChange) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <nav
      aria-label={scrollOnChange ? 'Pagination' : 'Results page'}
      className={`flex items-center gap-2 ${className}`}
    >
      <button
        type="button"
        disabled={atStart}
        aria-label="Previous page"
        onClick={(event) => {
          goTo(page - 1)
          if (event.detail !== 0) event.currentTarget.blur()
        }}
        className={buttonClasses}
      >
        <Chevron direction="left" />
      </button>
      <p className="min-w-14 text-center text-sm tabular-nums text-ink-muted">
        {page} of {totalPages}
      </p>
      <button
        type="button"
        disabled={atEnd}
        aria-label="Next page"
        onClick={(event) => {
          goTo(page + 1)
          if (event.detail !== 0) event.currentTarget.blur()
        }}
        className={buttonClasses}
      >
        <Chevron direction="right" />
      </button>
    </nav>
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
      className={direction === 'left' ? 'rotate-180' : undefined}
    >
      <path
        d="M6 3.5 11 8 6 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Pagination
