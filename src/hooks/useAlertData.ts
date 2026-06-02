import { useState, useEffect, useCallback } from 'react'
import { fetchAlertLog } from '../lib/api'
import { AlertLog } from '../types/alert'

interface UseAlertDataResult {
  data: AlertLog | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAlertData(url?: string): UseAlertDataResult {
  const [data, setData] = useState<AlertLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAlertLog(url)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}