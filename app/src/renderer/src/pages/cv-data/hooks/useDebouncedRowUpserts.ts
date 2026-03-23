import { useCallback, useEffect, type MutableRefObject, useRef } from 'react'

export function useDebouncedRowUpserts({
  debounceMs,
  loadAppliedRef,
  flushAll
}: {
  debounceMs: number
  loadAppliedRef: MutableRefObject<boolean>
  flushAll: () => void
}): {
  clearRowTimer: (key: string) => void
  scheduleRowUpsert: (key: string, run: () => void) => void
} {
  const rowTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const clearRowTimer = useCallback((key: string) => {
    const t = rowTimersRef.current[key]
    if (t) clearTimeout(t)
    delete rowTimersRef.current[key]
  }, [])

  const scheduleRowUpsert = useCallback(
    (key: string, run: () => void) => {
      clearRowTimer(key)
      rowTimersRef.current[key] = setTimeout(() => {
        run()
        delete rowTimersRef.current[key]
      }, debounceMs)
    },
    [clearRowTimer, debounceMs]
  )

  useEffect(() => {
    return () => {
      // Intentionally read latest ref values at teardown time.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const loadApplied = loadAppliedRef.current
      if (!loadApplied) return

      // Intentionally snapshot timers at teardown time.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const timersSnapshot = rowTimersRef.current
      Object.keys(timersSnapshot).forEach((k) => clearRowTimer(k))

      flushAll()
    }
  }, [clearRowTimer, flushAll, loadAppliedRef])

  return { clearRowTimer, scheduleRowUpsert }
}
