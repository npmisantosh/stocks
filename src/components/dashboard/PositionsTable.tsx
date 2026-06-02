import { ClosedTrade, OpenPosition } from '../../types/alert'
import { formatCurrency, formatPct, formatDate, formatDays } from '../../lib/formatters'
import StatusPill from '../ui/StatusPill'

interface Column<T> {
  key: string
  label: string
  align?: 'left' | 'right'
  render: (row: T) => React.ReactNode
}

function OpenPositionsTable({ positions }: { positions: OpenPosition[] }) {
  if (positions.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-text-dim font-mono">NO OPEN POSITIONS</div>
    )
  }

  const cols: Column<OpenPosition>[] = [
    {
      key: 'ticker', label: 'TICKER', align: 'left',
      render: (p) => <span className="font-bold text-text-bright font-mono">{p.ticker}</span>,
    },
    {
      key: 'entry', label: 'ENTRY', align: 'right',
      render: (p) => <span className="font-mono text-text-dim">{formatCurrency(p.entry_price)}</span>,
    },
    {
      key: 'target', label: 'TARGET', align: 'right',
      render: (p) => <span className="font-mono text-text">{formatCurrency(p.target_price)}</span>,
    },
    {
      key: 'stop', label: 'STOP', align: 'right',
      render: (p) => <span className="font-mono text-red text-sm">{formatCurrency(p.stop_price)}</span>,
    },
    {
      key: 'pnl', label: 'P&L', align: 'right',
      render: (p) => {
        const pnl = p.unrealized_pct ?? 0
        const color = pnl > 0 ? 'text-green' : pnl < 0 ? 'text-red' : 'text-text-dim'
        return <span className={`font-mono font-medium ${color}`}>{formatPct(pnl)}</span>
      },
    },
    {
      key: 'days', label: 'HELD / MAX', align: 'right',
      render: (p) => {
        const remaining = p.hold_days - p.days_held
        const urgent = remaining <= 1
        return (
          <span className={`font-mono text-xs ${urgent ? 'text-amber' : 'text-text-dim'}`}>
            {p.days_held}d / {p.hold_days}d
          </span>
        )
      },
    },
    {
      key: 'state', label: 'STATE', align: 'left',
      render: (p) => <StatusPill value={p.state} />,
    },
    {
      key: 'signal', label: 'SIGNAL', align: 'left',
      render: (p) => <span className="font-mono text-text-dim text-2xs">{p.signal_reason}</span>,
    },
  ]

  return (
    <table className="w-full text-xs font-mono">
      <thead>
        <tr className="text-text-dim text-2xs uppercase tracking-wider border-b border-border">
          {cols.map((c) => (
            <th
              key={c.key}
              className={`pb-2 px-3 font-medium ${c.align === 'right' ? 'text-right' : 'text-left'}`}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {positions.map((p) => (
          <tr
            key={p.ticker}
            className="border-t border-border/40 hover:bg-bg-hover trade-row"
          >
            {cols.map((c) => (
              <td
                key={c.key}
                className={`py-2.5 px-3 ${c.align === 'right' ? 'text-right' : ''}`}
              >
                {c.render(p)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ClosedTradesTable({ trades }: { trades: ClosedTrade[] }) {
  if (trades.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-text-dim font-mono">NO CLOSED TRADES</div>
    )
  }

  const cols: Column<ClosedTrade>[] = [
    {
      key: 'ticker', label: 'TICKER', align: 'left',
      render: (t) => <span className="font-bold text-text-bright font-mono">{t.ticker}</span>,
    },
    {
      key: 'entry', label: 'ENTRY', align: 'left',
      render: (t) => (
        <div className="font-mono text-text-dim">
          <span>{formatCurrency(t.entry_price)}</span>
          <span className="text-text-dim/60 ml-1 text-2xs">{formatDate(t.entry_date)}</span>
        </div>
      ),
    },
    {
      key: 'close', label: 'CLOSE', align: 'left',
      render: (t) => (
        <div className="font-mono text-text-dim">
          <span>{formatCurrency(t.close_price)}</span>
          <span className="text-text-dim/60 ml-1 text-2xs">{formatDate(t.close_date)}</span>
        </div>
      ),
    },
    {
      key: 'return', label: 'RETURN', align: 'right',
      render: (t) => {
        const color = t.actual_return_pct > 0 ? 'text-green' : t.actual_return_pct < 0 ? 'text-red' : 'text-text-dim'
        return <span className={`font-mono font-medium ${color}`}>{formatPct(t.actual_return_pct)}</span>
      },
    },
    {
      key: 'exit', label: 'EXIT', align: 'left',
      render: (t) => <StatusPill value={t.exit_reason} />,
    },
    {
      key: 'signal', label: 'SIGNAL', align: 'left',
      render: (t) => <span className="font-mono text-text-dim text-2xs">{t.signal_reason}</span>,
    },
    {
      key: 'held', label: 'HELD', align: 'right',
      render: (t) => <span className="font-mono text-text-dim text-2xs">{formatDays(t.days_held)}</span>,
    },
  ]

  return (
    <table className="w-full text-xs font-mono">
      <thead>
        <tr className="text-text-dim text-2xs uppercase tracking-wider border-b border-border">
          {cols.map((c) => (
            <th
              key={c.key}
              className={`pb-2 px-3 font-medium ${c.align === 'right' ? 'text-right' : 'text-left'}`}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {trades.map((t) => (
          <tr
            key={`${t.ticker}-${t.entry_date}-${t.close_date}`}
            className="border-t border-border/40 hover:bg-bg-hover trade-row"
          >
            {cols.map((c) => (
              <td
                key={c.key}
                className={`py-2.5 px-3 ${c.align === 'right' ? 'text-right' : ''}`}
              >
                {c.render(t)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function PositionsTable({
  openPositions,
  closedTrades,
}: {
  openPositions?: OpenPosition[]
  closedTrades?: ClosedTrade[]
}) {
  return (
    <div className="space-y-0">
      {openPositions && openPositions.length > 0 && (
        <OpenPositionsTable positions={openPositions} />
      )}
      {closedTrades && closedTrades.length > 0 && (
        <ClosedTradesTable trades={closedTrades} />
      )}
    </div>
  )
}