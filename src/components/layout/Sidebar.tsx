import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/',           label: 'HOME' },
  { to: '/positions',  label: 'POSITIONS' },
  { to: '/history',    label: 'HISTORY' },
  { to: '/performance',label: 'PERFORMANCE' },
]

interface SidebarProps {
  exportedAt: string
}

export default function Sidebar({ exportedAt }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-48 bg-bg-card border-r border-border flex-col">
      {/* Logo / Brand */}
      <div className="px-4 py-3 border-b border-border">
        <div className="text-green font-mono font-bold text-lg tracking-widest">ALERTS</div>
        <div className="text-2xs text-text-dim mt-0.5 font-mono">TRADING SYSTEM v2.1</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block px-4 py-2.5 text-xs font-mono tracking-wider transition-colors ${
                isActive
                  ? 'bg-green/10 text-green border-l-2 border-green'
                  : 'text-text-dim hover:text-text hover:bg-border/50 border-l-2 border-transparent'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Exported timestamp */}
      <div className="px-4 py-3 border-t border-border">
        <div className="text-2xs text-text-dim font-mono">EXPORTED</div>
        <div className="text-2xs text-text font-mono mt-0.5">{exportedAt}</div>
      </div>
    </aside>
  )
}