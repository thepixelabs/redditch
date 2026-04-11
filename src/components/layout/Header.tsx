'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

/**
 * Header — the stamped fascia plate at the top of every page.
 *
 * Design covenant: this is a dashboard chrome element, not a marketing bar.
 * Red accent bar at the top, gold wordmark, vertical panel-line texture.
 *
 * Nav is contextual — buttons change per route and animate in on transition.
 * Animation: "throttle sweep" — items ride in from the right like gauge
 * needles sweeping to position on engine start.
 */

// ─── Per-route nav definitions ─────────────────────────────────────────────

interface NavButton {
  label: string
  href?: string
  action?: () => void
  /** Treat as a back / secondary action — rendered more quietly */
  secondary?: boolean
}

function getNavButtons(pathname: string): NavButton[] {
  if (pathname === '/') {
    return [
      { label: 'Dealers',  href: '/dealers'                   },
      { label: 'Bulletin', href: '/bulletin' },
      { label: 'About',    href: '/about',    secondary: true },
    ]
  }
  if (pathname === '/bulletin') {
    return [
      { label: '← Garage',  href: '/',        secondary: true },
      { label: 'Dealers',   href: '/dealers'                  },
      { label: 'About',     href: '/about',   secondary: true },
    ]
  }
  if (pathname === '/about') {
    return [
      { label: '← Garage',  href: '/',        secondary: true },
      { label: 'Dealers',   href: '/dealers'                  },
      { label: 'Bulletin',  href: '/bulletin'                  },
    ]
  }
  if (pathname === '/dealers') {
    return [
      { label: '← Garage', href: '/',         secondary: true },
      { label: 'Bulletin',  href: '/bulletin'                  },
    ]
  }
  // Parse path segments — avoids empty-slug edge cases
  const segments = pathname.split('/').filter(Boolean)
  const slug = segments[0] ?? ''

  // My Bike page — /{slug}/mybike
  if (segments.length >= 2 && segments[1] === 'mybike' && slug) {
    return [
      { label: '\u2190 Garage', href: `/${slug}`, secondary: true },
      { label: 'Dealers',  href: '/dealers'  },
      { label: 'Bulletin', href: '/bulletin' },
    ]
  }

  // Bike dashboard — /{slug}
  if (slug) {
    return [
      { label: '\u2190 Home', href: '/', secondary: true },
      { label: 'My Bike',   href: `/${slug}/mybike` },
      { label: 'Dealers',   href: '/dealers'  },
    ]
  }

  // Fallback
  return [
    { label: 'Dealers',  href: '/dealers'  },
    { label: 'Bulletin', href: '/bulletin' },
    { label: 'About',    href: '/about', secondary: true },
  ]
}

// ─── Component ─────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname()
  const navItems = getNavButtons(pathname)

  return (
    <header
      aria-label="Redditch — Royal Enfield Service Companion"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(15, 15, 15, 0.94)',
        backgroundImage:
          'repeating-linear-gradient(90deg, transparent 0, transparent 79px, rgba(255,255,255,0.015) 79px, rgba(255,255,255,0.015) 80px)',
        borderTop: '4px solid var(--re-red)',
        boxShadow:
          'inset 0 -1px 0 rgba(200,150,44,0.18), 0 1px 12px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
        className="md:!h-16"
      >
        {/* Wordmark */}
        <Link
          href="/"
          aria-label="Redditch — home"
          style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}
          className="group"
        >
          <span
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: '17px',
              fontWeight: 800,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--re-gold)',
              lineHeight: 1,
              transition: 'color 150ms ease',
            }}
            className="group-hover:text-[var(--re-gold-muted)]"
          >
            REDDITCH
          </span>

          <span
            className="hidden md:block"
            style={{
              fontSize: '9px',
              letterSpacing: '0.22em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono), monospace',
              fontWeight: 600,
            }}
          >
            Royal Enfield · Service Manual
          </span>
        </Link>

        {/* Right group: contextual nav + theme toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/*
           * key={pathname} forces React to remount the container on every
           * route change, which restarts the CSS animation cleanly.
           */}
          <nav
            key={pathname}
            aria-label="Page navigation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              animation: 'header-nav-sweep 220ms var(--ease-out-expo) both',
            }}
          >
            {navItems.map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    fontFamily: 'var(--font-mono), monospace',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: item.secondary ? 'var(--text-muted)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    padding: '6px 10px',
                    border: `1px solid ${item.secondary ? 'transparent' : 'var(--border-subtle)'}`,
                    borderRadius: '2px',
                    transition: 'color 150ms ease, border-color 150ms ease, background 150ms ease',
                    whiteSpace: 'nowrap',
                  }}
                  className={item.secondary ? 'hidden md:inline-flex header-nav-ghost' : 'hidden md:inline-flex header-nav-btn'}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    fontFamily: 'var(--font-mono), monospace',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: item.secondary ? 'var(--text-muted)' : 'var(--text-secondary)',
                    background: 'none',
                    border: `1px solid ${item.secondary ? 'transparent' : 'var(--border-subtle)'}`,
                    borderRadius: '2px',
                    cursor: 'pointer',
                    padding: '6px 10px',
                    transition: 'color 150ms ease, border-color 150ms ease, background 150ms ease',
                    whiteSpace: 'nowrap',
                  }}
                  className={item.secondary ? 'hidden md:inline-flex header-nav-ghost' : 'hidden md:inline-flex header-nav-btn'}
                >
                  {item.label}
                </button>
              )
            )}
          </nav>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
