import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Header() {
  return (
    <header
      aria-label="Redditch — Royal Enfield Service Companion"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(26, 26, 26, 0.94)',
        borderTop: '4px solid var(--re-red)',
        borderBottom: '1px solid rgba(200, 150, 44, 0.2)',
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
              fontSize: '16px',
              fontWeight: 800,
              letterSpacing: '0.22em',
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
              fontSize: '10px',
              letterSpacing: '0.08em',
              color: 'rgba(200, 150, 44, 0.55)',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-body), system-ui, sans-serif',
              fontWeight: 600,
            }}
          >
            Royal Enfield Service
          </span>
        </Link>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  )
}
