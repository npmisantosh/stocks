import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { PerformanceSummary } from '../../types/alert'

const GRID_COLOR = '#1e1e1e'
const AXIS_COLOR = '#555555'
const TOOLTIP_STYLE = {
  background: '#0a0a0a',
  border: '1px solid #2a2a2a',
  borderRadius: 2,
  fontSize: 11,
  fontFamily: 'JetBrains Mono, monospace',
  color: '#e0e0e0',
}

function WinRateChart({ summary, title }: { summary: PerformanceSummary; title: string }) {
  const data = Object.entries(title === 'COMBO'
    ? summary.by_combo
    : summary.by_ticker
  ).map(([name, stats]) => ({
    name,
    wr: parseFloat(stats.win_rate_pct.toFixed(1)),
    count: stats.count,
  }))

  if (data.length === 0) return (
    <div className="border border-border bg-bg-card p-4">
      <div className="bloomberg-label mb-3">{title}</div>
      <div className="text-xs text-text-dim font-mono py-8 text-center">NO DATA</div>
    </div>
  )

  return (
    <div className="border border-border bg-bg-card">
      <div className="px-4 py-2 border-b border-border">
        <span className="bloomberg-label">WIN RATE BY {title}</span>
      </div>
      <div className="p-3">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
            <CartesianGrid strokeDasharray="0" stroke={GRID_COLOR} horizontal={false} />
            <XAxis
              type="number" domain={[0, 100]}
              tick={{ fill: AXIS_COLOR, fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickLine={false} axisLine={false}
            />
            <YAxis
              type="category" dataKey="name"
              tick={{ fill: AXIS_COLOR, fontSize: 9, fontFamily: 'JetBrains Mono' }}
              width={70} tickLine={false} axisLine={false}
            />
            <Tooltip
              formatter={(v: number) => [`${v.toFixed(1)}%`, 'WIN RATE']}
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="wr" name="Win Rate" radius={[0, 2, 2, 0]}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={i % 2 === 0 ? '#00ff88' : '#00cc6a'}
                  fillOpacity={0.75}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ReturnDistribution({ closedTrades }: { closedTrades: { actual_return_pct: number }[] }) {
  const buckets = [
    { label: '<-5%',   min: -Infinity, max: -5 },
    { label: '-5 to -2%', min: -5, max: -2 },
    { label: '-2 to 0%',  min: -2, max: 0 },
    { label: '0 to +2%',  min: 0, max: 2 },
    { label: '+2 to +5%', min: 2, max: 5 },
    { label: '>+5%',    min: 5, max: Infinity },
  ].map((b) => ({ ...b, count: 0 }))

  closedTrades.forEach((t) => {
    const b = buckets.find((b) => t.actual_return_pct >= b.min && t.actual_return_pct < b.max)
    if (b) b.count++
  })

  const maxCount = Math.max(...buckets.map((b) => b.count), 1)

  return (
    <div className="border border-border bg-bg-card">
      <div className="px-4 py-2 border-b border-border">
        <span className="bloomberg-label">RETURN DISTRIBUTION</span>
      </div>
      <div className="p-3">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={buckets} margin={{ left: 0, right: 16 }}>
            <CartesianGrid strokeDasharray="0" stroke={GRID_COLOR} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: AXIS_COLOR, fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickLine={false} axisLine={false}
            />
            <YAxis
              tick={{ fill: AXIS_COLOR, fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickLine={false} axisLine={false}
              domain={[0, maxCount]}
            />
            <Tooltip
              formatter={(v: number) => [v, 'TRADES']}
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="count" name="Trades" radius={[2, 2, 0, 0]}>
              {buckets.map((b, i) => {
                const isLoss = b.label.startsWith('-')
                return (
                  <Cell
                    key={i}
                    fill={isLoss ? '#ff3b3b' : '#00ff88'}
                    fillOpacity={isLoss ? 0.65 : 0.75}
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function PerformanceChart({ summary }: { summary: PerformanceSummary }) {
  return (
    <>
      <WinRateChart summary={summary} title="COMBO" />
      <WinRateChart summary={summary} title="TICKER" />
    </>
  )
}