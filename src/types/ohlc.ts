export interface OHLCBar {
  d: string
  o: number
  h: number
  l: number
  c: number
  v: number
}

export interface OHLCData {
  version: string
  exported_at: string
  bars_per_ticker: number
  total_tickers: number
  tickers: Record<string, OHLCBar[]>
}
