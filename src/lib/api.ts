import { AlertLog } from '../types/alert'

// Data JSON lives in the /data/ directory on the main branch
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/npmisantosh/stocks/main'
const ALERT_LOG_URL = `${GITHUB_RAW_BASE}/data/alert_log.json`

export async function fetchAlertLog(url?: string): Promise<AlertLog> {
  const target = url ?? ALERT_LOG_URL

  const resp = await fetch(target)
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} loading ${target}`)
  }
  return resp.json() as Promise<AlertLog>
}

export { ALERT_LOG_URL }