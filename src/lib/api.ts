import { AlertLog } from '../types/alert'

// GitHub raw URL — replace with actual repo URL when deployed
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/<owner>/<repo>/main'
const ALERT_LOG_URL = `${GITHUB_RAW_BASE}/data/alert_log.json`

// In development / static hosting, use local file
const LOCAL_DATA_URL = '/data/alert_log.json'

export async function fetchAlertLog(url?: string): Promise<AlertLog> {
  // Try local first, fall back to remote
  const targets = url
    ? [url]
    : [LOCAL_DATA_URL, ALERT_LOG_URL]

  let lastError: Error | null = null
  for (const target of targets) {
    try {
      const resp = await fetch(target)
      if (resp.ok) {
        return resp.json() as Promise<AlertLog>
      }
      // If local 404, try next
      if (target === LOCAL_DATA_URL) continue
      lastError = new Error(`HTTP ${resp.status} for ${target}`)
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw lastError ?? new Error('Could not load alert log from any source')
}

export { ALERT_LOG_URL }