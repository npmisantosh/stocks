import { useState, Fragment } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/',           label: 'HOME' },
  { to: '/positions',  label: 'POSITIONS' },
  { to: '/history',    label: 'HISTORY' },
  { to: '/performance',label: 'PERFORMANCE' },
]

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <Fragment>
      {/* Hamburger button — only shown on mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex flex-col gap-1.5 p-3 z-50"
        aria-label="Toggle menu"
      >
        <span className={`block w-5 h-0.5 bg-green transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-5 h-0.5 bg-green transition-all ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-5 h-0.5 bg-green transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside className={`
        md:hidden fixed inset-y-0 left-0 z-50 w-48 bg-bg-card border-r border-border flex flex-col
        transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo / Brand */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-green font-mono font-bold text-lg tracking-widest">ALERTS</div>
            <div className="text-2xs text-text-dim mt-0.5 font-mono">TRADING SYSTEM v2.1</div>
          </div>
          <button onClick={() => setOpen(false)} className="text-text-dim text-lg leading-none">&times;</button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={() =>
                `block px-4 py-2.5 text-xs font-mono tracking-wider transition-colors border-l-2 ${
                  location.pathname === to
                    ? 'bg-green/10 text-green border-green'
                    : 'text-text-dim hover:text-text hover:bg-border/50 border-transparent'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Status footer */}
        <div className="px-4 py-3 border-t border-border">
          <div className="text-2xs text-text-dim font-mono">STATUS: <span className="text-green">LIVE</span></div>
        </div>
      </aside>
    </Fragment>
  )
}