// AlertSignal: BUY alert fired today
export interface AlertSignal {
  ticker: string
  price: number
  target_price: number
  stop_price: number
  expected_return_pct: number
  target_pct: number
  stop_loss_pct: number
  score: number
  signal_count: number
  top_combo: string
  expected_hold_days: number
  weekly_confirmed: boolean
  weekly_rsi: number | null
  weekly_trend: 'bullish' | 'bearish' | 'neutral'
  timestamp: string
}

// ClosedTrade: a trade that was closed
export type ExitReason =
  | 'TARGET_HIT'
  | 'STOPPED_OUT'
  | 'SELL_SIGNAL'
  | 'TIME_EXPIRED'
  | 'RSI_OVERBOUGHT'
  | 'MACD_BEARISH'
  | 'STOCH_OVERBOUGHT'
  | 'WILLIAMS_OVERBOUGHT'
  | 'VOLUME_SPIKE_DOWN'
  | 'DEATH_CROSS'
  | 'BB_LOWER_BREAK'
  | 'INTRADAY_STOP'

export interface ClosedTrade {
  ticker: string
  entry_price: number
  close_price: number
  entry_date: string
  close_date: string
  expected_return_pct: number
  actual_return_pct: number
  hold_days: number
  exit_reason: ExitReason
  signal_reason: string
  days_held: number
}

// OpenPosition: currently active position
export type PositionState = 'PENDING' | 'OPEN' | 'HELD_ANOTHER'

export interface OpenPosition {
  ticker: string
  entry_price: number
  target_price: number
  stop_price: number
  expected_return_pct: number
  hold_days: number
  days_held: number
  entry_date: string
  state: PositionState
  signal_reason: string
  current_price?: number
  unrealized_pct?: number
}

export interface TickerStats {
  count: number
  win_rate_pct: number
  avg_return_pct: number
}

export interface PerformanceSummary {
  total_trades: number
  win_count: number
  loss_count: number
  win_rate_pct: number
  avg_return_pct: number
  avg_hold_days: number
  best_trade_pct: number
  worst_trade_pct: number
  by_ticker: Record<string, TickerStats>
}

// AlertLog: the top-level data structure
export type SystemStatus = 'active' | 'no_signals' | 'error'

export interface AlertLog {
  version: string
  exported_at: string
  system_status: SystemStatus
  day_score: number
  signals: AlertSignal[]
  open_positions: OpenPosition[]
  closed_trades: ClosedTrade[]
  performance_summary: PerformanceSummary
}