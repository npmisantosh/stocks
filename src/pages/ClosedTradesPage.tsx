import { useState, useEffect, useMemo } from 'react'
import Spinner from '../components/ui/Spinner'
import { useAlertData } from '../hooks/useAlertData'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { formatPct, formatDate, formatDays } from '../lib/formatters'
import StatusPill from '../components/ui/StatusPill'
import { ExitReason } from '../types/alert'
import { fetchOHLCData } from '../lib/api'
import { OHLCData } from '../types/ohlc'
import TradeDetailPanel from '../components/trade/TradeDetailPanel'

const PAGE_SIZE = 20

const EXIT_REASONS: ExitReason[] = [
  'TARGET_HIT', 'STOPPED_OUT', 'SELL_SIGNAL', 'TIME_EXPIRED',
  'RSI_OVERBOUGHT', 'MACD_BEARISH', 'STOCH_OVERBOUGHT',
  'WILLIAMS_OVERBOUGHT', 'VOLUME_SPIKE_DOWN', 'DEATH_CROSS',
  'BB_LOWER_BREAK', 'INTRADAY_STOP',
]

type SortKey = 'ticker' | 'entry_date' | 'close_date' | 'return' | 'days_held'

export default function ClosedTradesPage() {
  const { data, loading, error, refetch } = useAlertData()
  useAutoRefresh({ onRefresh: refetch })

  const [page, setPage] = useState(0)
  const [exitFilter, setExitFilter] = useState<string>('')
  const [tickerFilter, setTickerFilter] = useState<string>('')
  const [sortKey, setSortKey] = useState<SortKey>('close_date')
  const [sortAsc, setSortAsc] = useState(false)

  const [ohlc, setOhlc] = useState<OHLCData | null>(null)
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)

  useEffect(() => {
    fetchOHLCData().then(setOhlc).catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    if (!data) return []
    let list = [...data.closed_trades]
    if (exitFilter) list = list.filter((t) => t.exit_reason === exitFilter)
    if (tickerFilter) list = list.filter((t) => t.ticker.toLowerCase().includes(tickerFilter.toLowerCase()))
    return list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'ticker') cmp = a.ticker.localeCompare(b.ticker)
      else if (sortKey === 'entry_date') cmp = a.entry_date.localeCompare(b.entry_date)
      else if (sortKey === 'close_date') cmp = a.close_date.localeCompare(b.close_date)
      else if (sortKey === 'return') cmp = a.actual_return_pct - b.actual_return_pct
      else if (sortKey === 'days_held') cmp = a.days_held - b.days_held
      return sortAsc ? cmp : -cmp
    })
  }, [data, exitFilter, tickerFilter, sortKey, sortAsc])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

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

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page header */}
      <div className="bloomberg-label">CLOSED TRADES / HISTORY</div>

      {/* Filters — stack on mobile */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <select
          value={exitFilter}
          onChange={(e) => { setExitFilter(e.target.value); setPage(0) }}
          className="bg-bg-card border border-border text-text font-mono text-2xs sm:text-xs px-3 py-1.5 focus:border-green/40 focus:outline-none"
        >
          <option value="">ALL EXITS</option>
          {EXIT_REASONS.map((r) => (
            <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="TICKER FILTER..."
          value={tickerFilter}
          onChange={(e) => { setTickerFilter(e.target.value); setPage(0) }}
          className="bg-bg-card border border-border text-text font-mono text-2xs sm:text-xs px-3 py-1.5 placeholder-text-dim focus:border-green/40 focus:outline-none w-full sm:w-40"
        />
        <span className="text-2xs sm:text-xs text-text-dim font-mono sm:ml-auto">{filtered.length} TRADES</span>
      </div>

      {/* Sort controls */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xs text-text-dim font-mono uppercase">SORT:</span>
        {([
          { key: 'close_date' as SortKey, label: 'CLOSE DATE' },
          { key: 'return' as SortKey, label: 'RETURN' },
          { key: 'ticker' as SortKey, label: 'TICKER' },
          { key: 'days_held' as SortKey, label: 'HOLD DAYS' },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              if (sortKey === key) setSortAsc(!sortAsc)
              else { setSortKey(key); setSortAsc(false) }
              setPage(0)
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
        <table className="w-full text-2xs sm:text-xs font-mono min-w-[600px]">
          <thead>
            <tr className="border-b border-border text-text-dim text-2xs uppercase tracking-wider">
              <th className="text-left py-2 px-3 sm:px-4 font-medium">TICKER</th>
              <th className="text-left py-2 px-3 sm:px-4 font-medium">ENTRY</th>
              <th className="text-left py-2 px-3 sm:px-4 font-medium">CLOSE</th>
              <th className="text-right py-2 px-3 sm:px-4 font-medium">RETURN</th>
              <th className="text-left py-2 px-3 sm:px-4 font-medium">EXIT REASON</th>
              <th className="text-right py-2 px-3 sm:px-4 font-medium">HELD</th>
            </tr>
          </thead>
          <tbody>
            {pageData.flatMap((t) => [
              <tr
                key={`${t.ticker}-${t.entry_date}-${t.close_date}`}
                className="border-t border-border/50 hover:bg-bg-hover trade-row"
              >
                <td className="py-2.5 px-3 sm:px-4 font-bold text-text-bright">{t.ticker}</td>
                <td className="py-2.5 px-3 sm:px-4 text-text-dim">{formatDate(t.entry_date)}</td>
                <td className="py-2.5 px-3 sm:px-4 text-text-dim">{formatDate(t.close_date)}</td>
                <td className={`py-2.5 px-3 sm:px-4 text-right font-medium ${t.actual_return_pct >= 0 ? 'text-green' : 'text-red'}`}>
                  {formatPct(t.actual_return_pct)}
                </td>
                <td className="py-2.5 px-3 sm:px-4"><StatusPill value={t.exit_reason} /></td>
                <td className="py-2.5 px-3 sm:px-4 text-right text-text-dim">{formatDays(t.days_held)}</td>
              </tr>,
              <tr key={`chart-${t.ticker}-${t.entry_date}-${t.close_date}`}>
                <td colSpan={6} className="p-0">
                  <div className="border-t border-border/30">
                    <button
                      onClick={() =>
                        setSelectedTicker(selectedTicker === t.ticker ? null : t.ticker)
                      }
                      className="w-full flex items-center gap-2 px-4 py-1.5 text-2xs font-mono text-text-dim hover:bg-bg-hover transition-colors"
                    >
                      <span className={`transition-transform ${selectedTicker === t.ticker ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                      <span>SHOW CHART — {t.ticker}</span>
                    </button>
                    {selectedTicker === t.ticker && ohlc?.tickers[t.ticker] && (
                      <TradeDetailPanel
                        ticker={t.ticker}
                        entryPrice={t.entry_price}
                        closePrice={t.close_price}
                        entryDate={t.entry_date}
                        exitReason={t.exit_reason}
                        bars={ohlc.tickers[t.ticker]}
                      />
                    )}
                  </div>
                </td>
              </tr>,
            ])}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-4 py-1.5 border border-border bg-bg-card text-xs font-mono text-text-dim hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← PREV
          </button>
          <span className="text-xs font-mono text-text-dim">
            PAGE {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="px-4 py-1.5 border border-border bg-bg-card text-xs font-mono text-text-dim hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            NEXT →
          </button>
        </div>
      )}
    </div>
  )
}