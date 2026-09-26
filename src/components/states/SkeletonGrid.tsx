import { MOVIE_GRID_CLASS } from '../MovieGrid.tsx'

const PLACEHOLDER_COUNT = 20

function SkeletonGrid() {
  return (
    <ul
      className={MOVIE_GRID_CLASS}
      aria-busy="true"
      aria-label="Loading movies"
    >
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
        <li key={index} aria-hidden="true">
          <div className="overflow-hidden rounded-xl border border-edge bg-card">
            <div className="aspect-2/3 animate-pulse bg-edge motion-reduce:animate-none" />
            <div className="space-y-2 p-3">
              <div className="h-3.5 w-4/5 animate-pulse rounded bg-edge motion-reduce:animate-none" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-edge motion-reduce:animate-none" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default SkeletonGrid
