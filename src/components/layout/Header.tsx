import { AlertLog } from '../../types/alert'
import StatusPill from '../ui/StatusPill'

interface HeaderProps {
  data?: AlertLog | null
}

export default function Header({ data }: HeaderProps) {
  const status = data?.system_status ?? 'unknown'
  const pillValue = status === 'active' ? 'LIVE' : status === 'no_signals' ? 'IDLE' : 'ERR'

  const exportedAt = data?.exported_at
    ? new Date(data.exported_at).toLocaleString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
      })
    : '--:--'

  return (
    <header className="h-10 bg-bg-card border-b border-border flex items-center px-3 sm:px-4 gap-4 overflow-hidden">
      {/* Page title area */}
      <div className="hidden sm:flex items-center gap-3">
        <span className="text-xs text-text-dim font-mono tracking-wider">STOCK ALERTS</span>
        <span className="text-border-bright">|</span>
        <span className="text-xs text-text-dim font-mono">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
        </span>
      </div>

      {/* Separator */}
      <div className="flex-1" />

      {/* Timestamp — shrink on small screens */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="hidden sm:block text-2xs text-text-dim font-mono">LAST UPDATE</span>
        <span className="text-2xs sm:text-xs font-mono text-green">{exportedAt}</span>
      </div>

      {/* Market status */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green shadow-glow-green animate-pulse-slow" />
        <StatusPill value={pillValue} />
      </div>
    </header>
  )
}