import alertLogData from '../data/alert_log.json'
import { AlertLog } from '../types/alert'

// Data is bundled at build time via Vercel — no runtime fetch needed
export async function fetchAlertLog(): Promise<AlertLog> {
  return alertLogData as AlertLog
}