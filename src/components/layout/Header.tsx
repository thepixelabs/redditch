import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

/**
 * Header — sticky site chrome.
 *
 * Deliberately minimal: wordmark on the left, theme toggle on the right.
 * No hamburger. No nav links. The product is one focused flow — navigation
 * lives inside that flow, not in the chrome.
 *
 * backdrop-filter blur gives the header presence without an opaque wall.
 * On browsers that don't support backdrop-filter, the solid --bg fallback
 * ensures legibility.
 */
export function Header() {
  return (
    <header
      aria-label="Redditch — Royal Enfield Service Companion"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        // The blur needs a slightly transparent bg to be effective;
        // globals.css sets --bg per mode. We layer the blur on top.
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
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
        // 64px on md+ via className — inline style is the mobile default
        className="md:!h-16"
      >
        {/* Wordmark */}
        <Link
          href="/"
          aria-label="Redditch — home"
          style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '1px' }}
          className="group"
        >
          <span
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--re-gold)',
              lineHeight: 1.1,
              transition: 'color 150ms ease',
            }}
            className="group-hover:text-[var(--re-gold-muted)]"
          >
            REDDITCH
          </span>

          {/* Tagline — desktop only. At 10px this reads as a label, not body copy. */}
          <span
            className="hidden md:block"
            style={{
              fontSize: '10px',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              textTransform: 'none',
              fontFamily: 'var(--font-body), system-ui, sans-serif',
              fontWeight: 400,
            }}
          >
            Royal Enfield Service Companion
          </span>
        </Link>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  )
}
