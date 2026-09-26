interface ErrorStateProps {
  message: string
  onRetry: () => void
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 rounded-xl border border-edge bg-card px-5 py-6"
    >
      <div>
        <h2 className="text-sm font-medium">Could not load movies</h2>
        <p className="mt-1 text-sm text-ink-muted">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border-2 border-edge bg-canvas px-3 py-2 text-sm font-medium transition-colors hover:border-ink-muted focus-visible:border-ink focus-visible:outline-hidden"
      >
        Try again
      </button>
    </div>
  )
}

export default ErrorState
