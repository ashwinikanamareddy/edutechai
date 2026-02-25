import { useState, useEffect, useCallback, useRef } from "react"

// ============================================================
// useApiQuery – fetch data on mount (or when deps change)
// ============================================================
export function useApiQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      if (mountedRef.current) setData(result)
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err.message : "Request failed")
    } finally {
      if (mountedRef.current) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    mountedRef.current = true
    refetch()
    return () => {
      mountedRef.current = false
    }
  }, [refetch])

  return { data, loading, error, refetch }
}

// ============================================================
// useApiMutation – fire a request on demand (POST, PUT, etc.)
// ============================================================
export function useApiMutation<TPayload, TResult>(
  mutator: (payload: TPayload) => Promise<TResult>
) {
  const [data, setData] = useState<TResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(
    async (payload: TPayload) => {
      setLoading(true)
      setError(null)
      try {
        const result = await mutator(payload)
        setData(result)
        return result
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Request failed"
        setError(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [mutator]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { mutate, data, loading, error, reset }
}
