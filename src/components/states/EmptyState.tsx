function EmptyState() {
  return (
    <div className="rounded-xl border border-edge bg-card px-5 py-6">
      <h2 className="text-sm font-medium">No movies found</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Nothing matched these filters. Try another genre.
      </p>
    </div>
  )
}

export default EmptyState
