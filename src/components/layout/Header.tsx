'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { STORAGE_KEYS } from '@/lib/constants'
import type { GarageEntry } from '@/lib/types'

/**
 * Header — the stamped fascia plate at the top of every page.
 *
 * Design covenant: this is a dashboard chrome element, not a marketing bar.
 * Red accent bar at the top, gold wordmark, vertical panel-line texture.
 *
 * Nav is contextual — buttons change per route and animate in on transition.
 */

// ─── Nav icons (inline SVG, 16×16) ─────────────────────────────────────────

function IconHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 6.5L8 2l6 4.5V14H10v-3.5H6V14H2V6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

function IconGarage() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 6.5L8 2l6 4.5V14H2V6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <rect x="5.5" y="9" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3" fill="none"/>
    </svg>
  )
}

function IconDealers() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M8 10c-3.5 0-6 1.5-6 3h12c0-1.5-2.5-3-6-3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

function IconBulletin() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M5 6h6M5 8.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

function IconAbout() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IconMyBike() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="4.5" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <circle cx="11.5" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M4.5 11L7 6h2l2.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M7 6l1-3h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function NavIcon({ label }: { label: string }) {
  const l = label.toLowerCase()
  if (l.startsWith('←')) return <IconBack />
  if (l.includes('my bike')) return <IconMyBike />
  if (l.includes('garage')) return <IconGarage />
  if (l.includes('home')) return <IconHome />
  if (l.includes('dealer')) return <IconDealers />
  if (l.includes('bulletin')) return <IconBulletin />
  if (l.includes('about')) return <IconAbout />
  return null
}

// ─── Per-route nav definitions ─────────────────────────────────────────────

interface NavButton {
  label: string
  href?: string
  action?: () => void
  /** Treat as a back / secondary action — rendered more quietly */
  secondary?: boolean
}

function getNavButtons(pathname: string, savedBike: string | null): NavButton[] {
  // "My Bike" from any non-garage page goes to the garage (service dashboard).
  // The BikeBook reference is one more click from there via the garage's "My Bike" button.
  const garageHref = savedBike ? `/${savedBike}` : '/'

  if (pathname === '/') {
    return [
      ...(savedBike ? [{ label: 'My Bike', href: `/${savedBike}` }] : []),
      { label: 'Dealers',  href: '/dealers' },
      { label: 'Bulletin', href: '/bulletin' },
      { label: 'About',    href: '/about', secondary: true },
    ]
  }
  if (pathname === '/bulletin') {
    return [
      { label: '← Garage', href: garageHref, secondary: true },
      { label: 'Dealers', href: '/dealers' },
      { label: 'About',   href: '/about', secondary: true },
    ]
  }
  if (pathname === '/about') {
    return [
      { label: '← Garage', href: garageHref, secondary: true },
      { label: 'Dealers',  href: '/dealers' },
      { label: 'Bulletin', href: '/bulletin' },
    ]
  }
  if (pathname === '/dealers') {
    return [
      { label: '← Garage', href: garageHref, secondary: true },
      { label: 'Bulletin', href: '/bulletin' },
    ]
  }

  const staticRoutes = new Set(['', 'about', 'bulletin', 'dealers'])
  const segments = pathname.split('/').filter(Boolean)
  const slug = segments[0] ?? ''

  if (staticRoutes.has(slug)) {
    return [
      { label: 'Dealers',  href: '/dealers' },
      { label: 'Bulletin', href: '/bulletin' },
      { label: 'About',    href: '/about', secondary: true },
    ]
  }

  // My Bike page — /{slug}/mybike
  if (segments.length >= 2 && segments[1] === 'mybike') {
    return [
      { label: '← Garage', href: `/${slug}`, secondary: true },
      { label: 'Dealers',  href: '/dealers' },
      { label: 'Bulletin', href: '/bulletin' },
    ]
  }

  // Bike dashboard — /{slug}
  return [
    { label: '← Home', href: '/', secondary: true },
    { label: 'My Bike', href: `/${slug}/mybike` },
    { label: 'Dealers', href: '/dealers' },
  ]
}

// ─── Component ─────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname()
  const [savedBike, setSavedBike] = useState<string | null>(null)

  useEffect(() => {
    try {
      // v2: read active garage entry
      const activeIdRaw = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID)
      const garageRaw = localStorage.getItem(STORAGE_KEYS.GARAGE)
      if (activeIdRaw && garageRaw) {
        const activeId = JSON.parse(activeIdRaw) as string
        const entries = JSON.parse(garageRaw) as GarageEntry[]
        const active = entries.find(e => e.id === activeId) ?? entries[0]
        if (active) { setSavedBike(active.slug); return }
      }
      // v1 legacy fallback
      const raw = localStorage.getItem(STORAGE_KEYS.BIKE)
      if (raw) setSavedBike(JSON.parse(raw) as string)
    } catch {
      /* localStorage unavailable */
    }
  }, [pathname])

  const navItems = getNavButtons(pathname, savedBike)

  return (
    <header
      aria-label="Redditch — Royal Enfield Service Companion"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-header)',
        backgroundImage:
          'repeating-linear-gradient(90deg, transparent 0, transparent 79px, var(--bg-header-stripe) 79px, var(--bg-header-stripe) 80px)',
        borderTop: '4px solid var(--re-red)',
        boxShadow:
          'inset 0 -1px 0 var(--border-header), 0 1px 12px rgba(0,0,0,0.25)',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            {navItems.map((item) => {
              const sharedStyle: React.CSSProperties = {
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: item.secondary ? 'var(--text-muted)' : 'var(--text-secondary)',
                textDecoration: 'none',
                border: `1px solid ${item.secondary ? 'transparent' : 'var(--border-subtle)'}`,
                borderRadius: '2px',
                transition: 'color 150ms ease, border-color 150ms ease, background 150ms ease',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }
              const mobileStyle: React.CSSProperties = { padding: '6px 8px' }
              const cls = item.secondary ? 'header-nav-ghost' : 'header-nav-btn'

              const content = (
                <>
                  <span className="flex md:hidden" aria-hidden="true">
                    <NavIcon label={item.label} />
                  </span>
                  <span className="hidden md:inline">{item.label}</span>
                </>
              )

              return item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  style={{ ...sharedStyle, ...mobileStyle }}
                  className={`${cls} md:![padding:6px_10px]`}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={item.action}
                  aria-label={item.label}
                  style={{ ...sharedStyle, ...mobileStyle, background: 'none', cursor: 'pointer' }}
                  className={`${cls} md:![padding:6px_10px]`}
                >
                  {content}
                </button>
              )
            })}
          </nav>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
