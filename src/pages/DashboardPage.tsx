import { useState, useEffect } from 'react'
import MetricCard from '../components/ui/MetricCard'
import Spinner from '../components/ui/Spinner'
import StatusPill from '../components/ui/StatusPill'
import { useAlertData } from '../hooks/useAlertData'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { fetchOHLCData } from '../lib/api'
import { OHLCData } from '../types/ohlc'
import TradeDetailPanel from '../components/trade/TradeDetailPanel'
import { formatPct, formatCurrency, formatDays, formatDate } from '../lib/formatters'

export default function DashboardPage() {
  const { data, loading, error, refetch } = useAlertData()
  useAutoRefresh({ onRefresh: refetch })

  const [ohlc, setOhlc] = useState<OHLCData | null>(null)
  const [openSelectedKey, setOpenSelectedKey] = useState<string | null>(null)
  const [closeSelectedKey, setCloseSelectedKey] = useState<string | null>(null)

  useEffect(() => {
    fetchOHLCData().then(setOhlc).catch(() => {})
  }, [])

  function latestPrice(ticker: string): number | null {
    const bars = ohlc?.tickers[ticker]
    if (!bars || bars.length === 0) return null
    return bars[bars.length - 1].c
  }

  function calcPnL(entryPrice: number, ticker: string): number {
    const lp = latestPrice(ticker)
    if (lp == null) return 0
    return (lp - entryPrice) / entryPrice * 100
  }

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

  const { performance_summary, open_positions, closed_trades } = data

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="bloomberg-label">OVERVIEW</div>
        </div>
        <div className="text-xs text-text-dim font-mono">
          {data.exported_at
            ? new Date(data.exported_at).toLocaleString('en-US', {
                hour12: false, hour: '2-digit', minute: '2-digit',
                month: 'short', day: 'numeric',
              }).toUpperCase()
            : '--:--'}
        </div>
      </div>

      {/* KPI tiles — 2 cols mobile, 3 tablet, 6 desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border">
        <MetricCard
          label="Total Trades"
          value={performance_summary.total_trades.toString()}
          sub="30D ROLLING"
          className="bg-bg-card"
        />
        <MetricCard
          label="Win Rate"
          value={formatPct(performance_summary.win_rate_pct, 1)}
          positive={performance_summary.win_rate_pct >= 50}
          negative={performance_summary.win_rate_pct < 50}
          className="bg-bg-card"
        />
        <MetricCard
          label="Avg Return"
          value={formatPct(performance_summary.avg_return_pct, 2)}
          positive={performance_summary.avg_return_pct >= 0}
          negative={performance_summary.avg_return_pct < 0}
          className="bg-bg-card"
        />
        <MetricCard
          label="Open Positions"
          value={open_positions.length.toString()}
          className="bg-bg-card"
        />
        <MetricCard
          label="Best Trade"
          value={formatPct(performance_summary.best_trade_pct, 2)}
          positive
          className="bg-bg-card"
        />
        <MetricCard
          label="Worst Trade"
          value={formatPct(performance_summary.worst_trade_pct, 2)}
          negative
          className="bg-bg-card"
        />
      </div>

      {/* Open positions */}
      {open_positions.length > 0 && (
        <div className="border border-border bg-bg-card overflow-x-auto">
          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="bloomberg-label">OPEN POSITIONS</span>
            <span className="text-xs text-text-dim font-mono">{open_positions.length}</span>
          </div>
          <table className="w-full text-2xs sm:text-xs font-mono">
            <thead>
              <tr className="text-text-dim text-2xs uppercase tracking-wider border-b border-border">
                <th className="text-left py-2 px-3 font-medium">TICKER</th>
                <th className="hidden sm:table-cell text-right py-2 px-3 font-medium">ENTRY</th>
                <th className="hidden sm:table-cell text-right py-2 px-3 font-medium">TARGET</th>
                <th className="hidden sm:table-cell text-right py-2 px-3 font-medium">STOP</th>
                <th className="text-right py-2 px-3 font-medium">P&L</th>
                <th className="text-right py-2 px-3 font-medium">HELD</th>
                <th className="text-left py-2 px-3 font-medium">STATE</th>
              </tr>
            </thead>
            <tbody>
              {open_positions.slice(0, 5).flatMap((p) => [
                <tr
                  key={p.ticker}
                  onClick={() => {
                    const key = p.ticker
                    setOpenSelectedKey(openSelectedKey === key ? null : key)
                  }}
                  className="border-t border-border/40 hover:bg-bg-hover trade-row cursor-pointer"
                >
                  <td className="py-2.5 px-3 font-bold text-text-bright">{p.ticker}</td>
                  <td className="hidden sm:table-cell py-2.5 px-3 text-right font-mono text-text-dim">{formatCurrency(p.entry_price)}</td>
                  <td className="hidden sm:table-cell py-2.5 px-3 text-right font-mono text-text">{formatCurrency(p.target_price)}</td>
                  <td className="hidden sm:table-cell py-2.5 px-3 text-right font-mono text-red">{formatCurrency(p.stop_price)}</td>
                  <td className={`py-2.5 px-3 text-right font-mono font-medium ${calcPnL(p.entry_price, p.ticker) > 0 ? 'text-green' : calcPnL(p.entry_price, p.ticker) < 0 ? 'text-red' : 'text-text-dim'}`}>
                    {formatPct(calcPnL(p.entry_price, p.ticker))}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-text-dim">{p.days_held}d</td>
                  <td className="py-2.5 px-3"><StatusPill value={p.state} /></td>
                </tr>,
                openSelectedKey === p.ticker && ohlc?.tickers[p.ticker] ? (
                  <tr key={`chart-${p.ticker}`}>
                    <td colSpan={7} className="p-0">
                      <TradeDetailPanel
                        ticker={p.ticker}
                        entryPrice={p.entry_price}
                        targetPrice={p.target_price}
                        stopPrice={p.stop_price}
                        entryDate={p.entry_date}
                        bars={ohlc.tickers[p.ticker]}
                      />
                    </td>
                  </tr>
                ) : [],
              ])}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent closed trades */}
      {closed_trades.length > 0 && (
        <div className="border border-border bg-bg-card overflow-x-auto">
          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="bloomberg-label">RECENT CLOSES</span>
            <span className="text-xs text-text-dim font-mono">{closed_trades.length} TOTAL</span>
          </div>
          <table className="w-full text-2xs sm:text-xs font-mono">
            <thead>
              <tr className="text-text-dim text-2xs uppercase tracking-wider border-b border-border">
                <th className="text-left py-2 px-3 font-medium">TICKER</th>
                <th className="hidden sm:table-cell text-left py-2 px-3 font-medium">ENTRY</th>
                <th className="hidden sm:table-cell text-left py-2 px-3 font-medium">CLOSE</th>
                <th className="text-right py-2 px-3 font-medium">RETURN</th>
                <th className="text-left py-2 px-3 font-medium">EXIT</th>
                <th className="text-right py-2 px-3 font-medium">HELD</th>
              </tr>
            </thead>
            <tbody>
              {closed_trades.slice(0, 5).flatMap((t) => [
                <tr
                  key={`${t.ticker}-${t.entry_date}`}
                  onClick={() => {
                    const key = `${t.ticker}-${t.entry_date}-${t.close_date}`
                    setCloseSelectedKey(closeSelectedKey === key ? null : key)
                  }}
                  className="border-t border-border/40 hover:bg-bg-hover trade-row cursor-pointer"
                >
                  <td className="py-2.5 px-3 font-bold text-text-bright">{t.ticker}</td>
                  <td className="hidden sm:table-cell py-2.5 px-3 text-text-dim">
                    <span className="font-mono">{formatCurrency(t.entry_price)}</span>
                    <span className="text-text-dim/60 ml-1 text-2xs">{formatDate(t.entry_date)}</span>
                  </td>
                  <td className="hidden sm:table-cell py-2.5 px-3 text-text-dim">
                    <span className="font-mono">{formatCurrency(t.close_price)}</span>
                    <span className="text-text-dim/60 ml-1 text-2xs">{formatDate(t.close_date)}</span>
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono font-medium ${t.actual_return_pct > 0 ? 'text-green' : t.actual_return_pct < 0 ? 'text-red' : 'text-text-dim'}`}>
                    {formatPct(t.actual_return_pct)}
                  </td>
                  <td className="py-2.5 px-3"><StatusPill value={t.exit_reason} /></td>
                  <td className="py-2.5 px-3 text-right font-mono text-text-dim">{formatDays(t.days_held)}</td>
                </tr>,
                closeSelectedKey === `${t.ticker}-${t.entry_date}-${t.close_date}` && ohlc?.tickers[t.ticker] ? (
                  <tr key={`chart-${t.ticker}-${t.entry_date}`}>
                    <td colSpan={6} className="p-0">
                      <TradeDetailPanel
                        ticker={t.ticker}
                        entryPrice={t.entry_price}
                        closePrice={t.close_price}
                        entryDate={t.entry_date}
                        exitReason={t.exit_reason}
                        bars={ohlc.tickers[t.ticker]}
                      />
                    </td>
                  </tr>
                ) : [],
              ])}
            </tbody>
          </table>
        </div>
      )}

      {/* Today's signals */}
      {data.signals && data.signals.length > 0 && (
        <div className="border border-border bg-bg-card">
          <div className="px-4 py-2 border-b border-border">
            <span className="bloomberg-label">TODAY SIGNALS</span>
          </div>
          <div className="p-3 space-y-2">
            {data.signals.map((sig) => (
              <div key={sig.ticker} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2 bg-bg-elevated border border-border sm:gap-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="text-md font-mono font-bold text-green">{sig.ticker}</span>
                  <span className="text-xs text-text-dim font-mono">@ ${sig.price.toFixed(2)}</span>
                  <span className="text-xs text-text-dim font-mono">TARGET {sig.target_pct.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-green">+{sig.expected_return_pct.toFixed(2)}%</span>
                  <span className="text-xs font-mono text-green">SCORE {sig.score.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}