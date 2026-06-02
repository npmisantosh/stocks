import { useEffect } from 'react'

interface UseAutoRefreshOptions {
  onRefresh: () => void
  intervalMs?: number
  enabled?: boolean
}

export function useAutoRefresh({
  onRefresh,
  intervalMs = 5 * 60 * 1000, // 5 minutes default
  enabled = true,
}: UseAutoRefreshOptions): void {
  useEffect(() => {
    if (!enabled) return
    const id = setInterval(onRefresh, intervalMs)
    return () => clearInterval(id)
  }, [onRefresh, intervalMs, enabled])
}