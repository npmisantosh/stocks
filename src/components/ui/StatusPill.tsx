import { PositionState, ExitReason } from '../../types/alert'

type StatusValue = PositionState | ExitReason | 'LIVE' | 'IDLE' | 'ERR' | 'WIN' | 'LOSS'

const COLOR_MAP: Record<StatusValue, { bg: string; text: string; border: string }> = {
  LIVE:         { bg: 'bg-green/10',   text: 'text-green',   border: 'border-green/30' },
  IDLE:          { bg: 'bg-amber/10',   text: 'text-amber',   border: 'border-amber/30' },
  ERR:           { bg: 'bg-red/10',     text: 'text-red',     border: 'border-red/30' },
  WIN:           { bg: 'bg-green/10',   text: 'text-green',   border: 'border-green/30' },
  LOSS:          { bg: 'bg-red/10',      text: 'text-red',     border: 'border-red/30' },
  PENDING:       { bg: 'bg-amber/10',   text: 'text-amber',   border: 'border-amber/30' },
  OPEN:          { bg: 'bg-blue/10',    text: 'text-blue',    border: 'border-blue/30' },
  HELD_ANOTHER:  { bg: 'bg-purple/10',  text: 'text-purple',  border: 'border-purple/30' },
  TARGET_HIT:    { bg: 'bg-green/10',   text: 'text-green',   border: 'border-green/30' },
  STOPPED_OUT:   { bg: 'bg-red/10',     text: 'text-red',     border: 'border-red/30' },
  SELL_SIGNAL:   { bg: 'bg-amber/10',   text: 'text-amber',   border: 'border-amber/30' },
  TIME_EXPIRED:  { bg: 'bg-text-dim/10',text: 'text-text-dim',border: 'border-border' },
  RSI_OVERBOUGHT:    { bg: 'bg-red/10',  text: 'text-red',     border: 'border-red/30' },
  MACD_BEARISH:      { bg: 'bg-red/10',  text: 'text-red',     border: 'border-red/30' },
  STOCH_OVERBOUGHT:  { bg: 'bg-red/10',  text: 'text-red',     border: 'border-red/30' },
  WILLIAMS_OVERBOUGHT: { bg: 'bg-red/10',text: 'text-red',     border: 'border-red/30' },
  VOLUME_SPIKE_DOWN:  { bg: 'bg-red/10', text: 'text-red',     border: 'border-red/30' },
  DEATH_CROSS:        { bg: 'bg-red/10', text: 'text-red',     border: 'border-red/30' },
  BB_LOWER_BREAK:     { bg: 'bg-red/10', text: 'text-red',     border: 'border-red/30' },
  INTRADAY_STOP:      { bg: 'bg-red/10', text: 'text-red',     border: 'border-red/30' },
}

interface StatusPillProps {
  value: StatusValue
  label?: string
}

export default function StatusPill({ value, label }: StatusPillProps) {
  const colors = COLOR_MAP[value] ?? { bg: 'bg-border', text: 'text-text-dim', border: 'border-border' }
  const display = label ?? value.replace(/_/g, ' ')

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-sm text-2xs font-mono tracking-wider
        border ${colors.bg} ${colors.text} ${colors.border}
      `}
    >
      {display}
    </span>
  )
}