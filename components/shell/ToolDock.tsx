// Built by vsrupeshkumar
// Horizontal "tool dock" that links across the RWAkins AI × RWA credit suite so a
// judge can move between Portfolio → Risk → Credit → Borrow → Compliance → Audit in
// one click. Rendered at the top of every suite page (the left rail / bottom bar in
// AgentNav stays the 3 core screens). Active route is highlighted in teal.
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PieChart, Gauge, Sparkles, Coins, ShieldCheck, ScrollText, Activity } from 'lucide-react'

const TEAL = '#2f6b54'

const TOOLS = [
  { href: '/portfolio', label: 'Portfolio', Icon: PieChart },
  { href: '/insurance-risk-system', label: 'Risk', Icon: Gauge },
  { href: '/credit', label: 'Credit', Icon: Sparkles },
  { href: '/lend', label: 'Borrow', Icon: Coins },
  { href: '/compliance', label: 'Compliance', Icon: ShieldCheck },
  { href: '/compliance/audit-trail', label: 'Audit', Icon: ScrollText },
  { href: '/activity', label: 'Activity', Icon: Activity },
] as const

function active(pathname: string | null, href: string) {
  if (href === '/compliance') return pathname === '/compliance'
  return pathname === href || (pathname?.startsWith(href + '/') ?? false)
}

export function ToolDock() {
  const pathname = usePathname()
  return (
    <div
      style={{
        display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 2px 14px',
        margin: '0 0 8px', WebkitOverflowScrolling: 'touch',
      }}
    >
      {TOOLS.map(({ href, label, Icon }) => {
        const on = active(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0,
              padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              textDecoration: 'none', transition: 'all 0.15s',
              color: on ? '#080808' : 'var(--rwa-text-muted)',
              background: on ? TEAL : 'var(--rwa-surface)',
              border: `1px solid ${on ? TEAL : 'var(--rwa-border)'}`,
            }}
          >
            <Icon size={15} />
            {label}
          </Link>
        )
      })}
    </div>
  )
}

export default ToolDock
