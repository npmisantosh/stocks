import { useState, useEffect } from 'react'
import Spinner from '../components/ui/Spinner'
import PositionsTable from '../components/dashboard/PositionsTable'
import { useAlertData } from '../hooks/useAlertData'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { formatPct } from '../lib/formatters'
import MetricCard from '../components/ui/MetricCard'
import { fetchOHLCData } from '../lib/api'
import { OHLCData } from '../types/ohlc'
import TradeDetailPanel from '../components/trade/TradeDetailPanel'

type SortKey = 'ticker' | 'entry_price' | 'pnl' | 'days_held' | 'hold_days'

export default function OpenPositionsPage() {
  const { data, loading, error, refetch } = useAlertData()
  useAutoRefresh({ onRefresh: refetch })
  const [sortKey, setSortKey] = useState<SortKey>('pnl')
  const [sortAsc, setSortAsc] = useState(false)
  const [ohlc, setOhlc] = useState<OHLCData | null>(null)
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)

  useEffect(() => {
    fetchOHLCData().then(setOhlc).catch(() => {})
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )
  if (error) return (
    <div className="border border-red/30 bg-red/5 p-4">
      <span className="text-red text-sm font-mono">ERR: {error}</span>
    </div>
  )
  if (!data) return null

  const sorted = [...data.open_positions].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'ticker') cmp = a.ticker.localeCompare(b.ticker)
    else if (sortKey === 'entry_price') cmp = a.entry_price - b.entry_price
    else if (sortKey === 'pnl') cmp = (a.unrealized_pct ?? 0) - (b.unrealized_pct ?? 0)
    else if (sortKey === 'days_held') cmp = a.days_held - b.days_held
    else if (sortKey === 'hold_days') cmp = a.hold_days - b.hold_days
    return sortAsc ? cmp : -cmp
  })

  const openPnL = data.open_positions.reduce((sum, p) => sum + (p.unrealized_pct ?? 0), 0)
  const avgPnL = data.open_positions.length > 0 ? openPnL / data.open_positions.length : 0

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page header */}
      <div className="bloomberg-label">OPEN POSITIONS</div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border">
        <MetricCard
          label="Positions"
          value={data.open_positions.length.toString()}
          className="bg-bg-card"
        />
        <MetricCard
          label="Total P&L"
          value={formatPct(openPnL)}
          positive={openPnL >= 0}
          negative={openPnL < 0}
          className="bg-bg-card"
        />
        <MetricCard
          label="Avg P&L"
          value={formatPct(avgPnL)}
          positive={avgPnL >= 0}
          negative={avgPnL < 0}
          className="bg-bg-card"
        />
        <MetricCard
          label="Day Score"
          value={data.day_score.toFixed(1)}
          className="bg-bg-card"
        />
      </div>

      {/* Sort controls — wraps on mobile */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xs text-text-dim font-mono uppercase">SORT:</span>
        {([
          { key: 'pnl', label: 'P&L' },
          { key: 'ticker', label: 'TICKER' },
          { key: 'days_held', label: 'DAYS HELD' },
          { key: 'hold_days', label: 'MAX DAYS' },
        ] as { key: SortKey; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              if (sortKey === key) setSortAsc(!sortAsc)
              else { setSortKey(key); setSortAsc(false) }
            }}
            className={`
              px-3 py-1 text-2xs font-mono tracking-wider border transition-colors
              ${sortKey === key
                ? 'border-green/40 bg-green/10 text-green'
                : 'border-border bg-bg-card text-text-dim hover:text-text hover:border-border-bright'
              }`}
          >
            {label} {sortKey === key ? (sortAsc ? '↑' : '↓') : ''}
          </button>
        ))}
      </div>

      {/* Table — horizontal scroll on mobile */}
      <div className="border border-border bg-bg-card">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-2xs text-text-dim font-mono">{sorted.length} POSITIONS</span>
        </div>
        <div>
          <div className="p-1 overflow-x-auto">
            <PositionsTable openPositions={sorted} />
          </div>
          {sorted.map((pos) => (
            <div key={pos.ticker}>
              <button
                onClick={() =>
                  setSelectedTicker(selectedTicker === pos.ticker ? null : pos.ticker)
                }
                className="w-full flex items-center gap-2 px-4 py-1.5 text-2xs font-mono text-text-dim hover:bg-bg-hover border-t border-border/40 transition-colors"
              >
                <span className={`transition-transform ${selectedTicker === pos.ticker ? 'rotate-90' : ''}`}>
                  ▶
                </span>
                <span>SHOW CHART — {pos.ticker}</span>
              </button>
              {selectedTicker === pos.ticker && ohlc?.tickers[pos.ticker] && (
                <TradeDetailPanel
                  ticker={pos.ticker}
                  entryPrice={pos.entry_price}
                  targetPrice={pos.target_price}
                  stopPrice={pos.stop_price}
                  entryDate={pos.entry_date}
                  bars={ohlc.tickers[pos.ticker]}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}