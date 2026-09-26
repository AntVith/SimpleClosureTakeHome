import { useCallback, useState } from 'react'
import type { ViewState } from '../lib/urlState.ts'
import { parseViewState, writeViewState } from '../lib/urlState.ts'

/**
 * View state is initialized from the URL and written back through the same
 * setters, so the address bar and the UI cannot drift. replaceState rather
 * than pushState: the back button should leave the app, not undo each filter.
 */
export function useViewState() {
  const [state, setState] = useState<ViewState>(() =>
    parseViewState(window.location.search),
  )

  const update = useCallback((patch: Partial<ViewState>) => {
    setState((current) => {
      const next = { ...current, ...patch }
      writeViewState(next)
      return next
    })
  }, [])

  return { state, update }
}
