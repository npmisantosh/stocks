import MetricCard from '../components/ui/MetricCard'
import Spinner from '../components/ui/Spinner'
import PositionsTable from '../components/dashboard/PositionsTable'
import { useAlertData } from '../hooks/useAlertData'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { formatPct } from '../lib/formatters'

export default function DashboardPage() {
  const { data, loading, error, refetch } = useAlertData()
  useAutoRefresh({ onRefresh: refetch })

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
    <div className="space-y-5">
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

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border">
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
        <div className="border border-border bg-bg-card">
          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="bloomberg-label">OPEN POSITIONS</span>
            <span className="text-xs text-text-dim font-mono">{open_positions.length}</span>
          </div>
          <div className="p-1">
            <PositionsTable openPositions={open_positions.slice(0, 5)} />
          </div>
        </div>
      )}

      {/* Recent closed trades */}
      {closed_trades.length > 0 && (
        <div className="border border-border bg-bg-card">
          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="bloomberg-label">RECENT CLOSES</span>
            <span className="text-xs text-text-dim font-mono">{closed_trades.length} TOTAL</span>
          </div>
          <div className="p-1">
            <PositionsTable closedTrades={closed_trades.slice(0, 5)} />
          </div>
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
              <div key={sig.ticker} className="flex items-center justify-between px-3 py-2 bg-bg-elevated border border-border">
                <div className="flex items-center gap-4">
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