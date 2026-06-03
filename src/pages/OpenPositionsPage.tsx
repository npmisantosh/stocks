import { useState, useEffect } from 'react'
import Spinner from '../components/ui/Spinner'
import { useAlertData } from '../hooks/useAlertData'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { formatPct, formatCurrency } from '../lib/formatters'
import MetricCard from '../components/ui/MetricCard'
import StatusPill from '../components/ui/StatusPill'
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
      <div className="border border-border bg-bg-card overflow-x-auto">
        <table className="w-full text-2xs sm:text-xs font-mono">
          <thead>
            <tr className="border-b border-border text-text-dim text-2xs uppercase tracking-wider">
              <th className="text-left py-2 px-3 sm:px-4 font-medium">TICKER</th>
              <th className="hidden sm:table-cell text-right py-2 px-3 sm:px-4 font-medium">ENTRY</th>
              <th className="hidden sm:table-cell text-right py-2 px-3 sm:px-4 font-medium">TARGET</th>
              <th className="hidden sm:table-cell text-right py-2 px-3 sm:px-4 font-medium">STOP</th>
              <th className="text-right py-2 px-3 sm:px-4 font-medium">P&L</th>
              <th className="text-right py-2 px-3 sm:px-4 font-medium">HELD / MAX</th>
              <th className="text-left py-2 px-3 sm:px-4 font-medium">STATE</th>
            </tr>
          </thead>
          <tbody>
            {sorted.flatMap((p) => [
              <tr
                key={p.ticker}
                onClick={() =>
                  setSelectedTicker(selectedTicker === p.ticker ? null : p.ticker)
                }
                className="border-t border-border/40 hover:bg-bg-hover trade-row cursor-pointer"
              >
                <td className="py-2.5 px-3 sm:px-4 font-bold text-text-bright">{p.ticker}</td>
                <td className="hidden sm:table-cell py-2.5 px-3 sm:px-4 text-right font-mono text-text-dim">{formatCurrency(p.entry_price)}</td>
                <td className="hidden sm:table-cell py-2.5 px-3 sm:px-4 text-right font-mono text-text">{formatCurrency(p.target_price)}</td>
                <td className="hidden sm:table-cell py-2.5 px-3 sm:px-4 text-right font-mono text-red">{formatCurrency(p.stop_price)}</td>
                <td className={`py-2.5 px-3 sm:px-4 text-right font-mono font-medium ${(p.unrealized_pct ?? 0) > 0 ? 'text-green' : (p.unrealized_pct ?? 0) < 0 ? 'text-red' : 'text-text-dim'}`}>
                  {formatPct(p.unrealized_pct ?? 0)}
                </td>
                <td className={`py-2.5 px-3 sm:px-4 text-right font-mono ${p.hold_days - p.days_held <= 1 ? 'text-amber' : 'text-text-dim'}`}>
                  {p.days_held}d / {p.hold_days}d
                </td>
                <td className="py-2.5 px-3 sm:px-4"><StatusPill value={p.state} /></td>
              </tr>,
              <tr key={`chart-${p.ticker}`}>
                <td colSpan={7} className="p-0">
                  {selectedTicker === p.ticker && ohlc?.tickers[p.ticker] && (
                    <TradeDetailPanel
                      ticker={p.ticker}
                      entryPrice={p.entry_price}
                      targetPrice={p.target_price}
                      stopPrice={p.stop_price}
                      entryDate={p.entry_date}
                      bars={ohlc.tickers[p.ticker]}
                    />
                  )}
                </td>
              </tr>,
            ])}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-xs text-text-dim font-mono">NO OPEN POSITIONS</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}