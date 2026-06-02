import Spinner from '../components/ui/Spinner'
import MetricCard from '../components/ui/MetricCard'
import PerformanceChart, { ReturnDistribution } from '../components/dashboard/PerformanceChart'
import { useAlertData } from '../hooks/useAlertData'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { formatPct } from '../lib/formatters'

export default function PerformancePage() {
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

  const { performance_summary, closed_trades } = data

  // Best/worst trade
  const sortedTrades = [...closed_trades].sort((a, b) => b.actual_return_pct - a.actual_return_pct)
  const bestTrade = sortedTrades[0]
  const worstTrade = sortedTrades[sortedTrades.length - 1]

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="bloomberg-label">PERFORMANCE METRICS</div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
        <MetricCard
          label="Largest Winner"
          value={bestTrade?.ticker ?? '—'}
          sub={bestTrade ? formatPct(bestTrade.actual_return_pct, 2) : ''}
          positive
          className="bg-bg-card"
        />
        <MetricCard
          label="Largest Loser"
          value={worstTrade?.ticker ?? '—'}
          sub={worstTrade ? formatPct(worstTrade.actual_return_pct, 2) : ''}
          negative
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
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PerformanceChart summary={performance_summary} />
        {closed_trades.length > 0 && <ReturnDistribution closedTrades={closed_trades} />}
      </div>

      {/* Monthly summary table */}
      <div className="border border-border bg-bg-card">
        <div className="px-4 py-2 border-b border-border">
          <span className="bloomberg-label">MONTHLY SUMMARY</span>
        </div>
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-border text-text-dim text-2xs uppercase tracking-wider">
              <th className="text-left py-2 px-4 font-medium">MONTH</th>
              <th className="text-right py-2 px-4 font-medium">TRADES</th>
              <th className="text-right py-2 px-4 font-medium">WIN RATE</th>
              <th className="text-right py-2 px-4 font-medium">AVG RETURN</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const byMonth: Record<string, { count: number; wins: number; returns: number[] }> = {}
              closed_trades.forEach((t) => {
                const month = t.close_date.substring(0, 7)
                if (!byMonth[month]) byMonth[month] = { count: 0, wins: 0, returns: [] }
                byMonth[month].count++
                if (t.actual_return_pct > 0) byMonth[month].wins++
                byMonth[month].returns.push(t.actual_return_pct)
              })
              return Object.entries(byMonth)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([month, stats]) => {
                  const avgRet = stats.returns.reduce((s, v) => s + v, 0) / stats.returns.length
                  const winRate = (stats.wins / stats.count) * 100
                  return (
                    <tr key={month} className="border-t border-border/50 hover:bg-bg-hover trade-row">
                      <td className="py-2.5 px-4 text-text-bright">{month}</td>
                      <td className="py-2.5 px-4 text-right text-text-dim">{stats.count}</td>
                      <td className={`py-2.5 px-4 text-right font-medium ${winRate >= 50 ? 'text-green' : 'text-red'}`}>
                        {formatPct(winRate, 1)}
                      </td>
                      <td className={`py-2.5 px-4 text-right font-medium ${avgRet >= 0 ? 'text-green' : 'text-red'}`}>
                        {formatPct(avgRet, 2)}
                      </td>
                    </tr>
                  )
                })
            })()}
          </tbody>
        </table>
      </div>
    </div>
  )
}