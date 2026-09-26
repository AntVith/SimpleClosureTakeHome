/**
 * Discriminated union so consumers cannot read `data` before it exists.
 * "Empty" is deliberately not a status: it is derived from a successful
 * response with no results, which keeps it distinct from a failure.
 */
export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
