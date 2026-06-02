interface MetricCardProps {
  label: string
  value: string
  sub?: string
  positive?: boolean
  negative?: boolean
  className?: string
}

export default function MetricCard({ label, value, sub, positive, negative, className = '' }: MetricCardProps) {
  const valueColor = positive ? 'text-green' : negative ? 'text-red' : 'text-text-bright'

  return (
    <div className={`bg-bg-card border border-border px-4 py-3 ${className}`}>
      {/* Label row */}
      <div className="bloomberg-label mb-1">{label}</div>

      {/* Value row */}
      <div className={`text-xl font-mono font-bold ${valueColor}`}>
        {value}
        {positive && <span className="text-green text-sm ml-1">▲</span>}
        {negative && <span className="text-red text-sm ml-1">▼</span>}
      </div>

      {/* Sub value */}
      {sub && <div className="text-2xs text-text-dim mt-1 font-mono">{sub}</div>}
    </div>
  )
}