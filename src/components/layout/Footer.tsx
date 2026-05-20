import Link from 'next/link'
import { ExternalLink } from '@/components/ui/ExternalLink'

/**
 * Footer — the workshop floor.
 *
 * Design covenant (2026-04-10): the footer is the *lowest* plane in the
 * visual hierarchy. Darker than the page body, carrying a physical texture,
 * anchored by a riveted gold top rule. No marketing polish, no social icons,
 * no newsletter prompt. Every line is either attribution, navigation, or
 * an honest disclaimer.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      aria-labelledby="footer-identity"
      className="workshop-floor"
      style={{
        marginTop: '48px',
        paddingTop: '52px',
        paddingBottom: '40px',
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 clamp(20px, 3vw, 40px)',
        }}
      >
        {/* ── Three-column grid ───────────────────────────────────────── */}
        <div
          className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1.4fr] gap-10 md:gap-14"
        >
          {/* ── Left: identity ─────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span
                id="footer-identity"
                style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: '22px',
                  fontWeight: 800,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--re-gold)',
                  lineHeight: 1,
                }}
              >
                REDDITCH
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                EST. 2026 · OPEN SOURCE
              </span>
            </div>

            <p
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontStyle: 'italic',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
                margin: 0,
                maxWidth: '28ch',
              }}
            >
              Built by riders, for riders. The service manual your dealer
              wishes they had.
            </p>

            {/* Riveted disclaimer plaque */}
            <div
              style={{
                marginTop: '6px',
                padding: '10px 12px',
                border: '1px solid var(--border-subtle)',
                borderRadius: '3px',
                background: 'var(--bg-card)',
                maxWidth: '32ch',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Not affiliated with Royal Enfield Motors Ltd. All trademarks
                remain the property of their respective owners.
              </p>
            </div>
          </div>

          {/* ── Center: navigation ─────────────────────────────────── */}
          <nav aria-label="Footer navigation">
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'var(--re-gold)',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              Navigate
            </span>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <li>
                <Link href="/" className="enamel-link">
                  Garage
                </Link>
              </li>
              <li>
                <Link href="/dealers" className="enamel-link">
                  Dealers
                </Link>
              </li>
              <li>
                <Link href="/bulletin" className="enamel-link">
                  Bulletin Board
                </Link>
              </li>
              <li>
                <Link href="/about" className="enamel-link">
                  About
                </Link>
              </li>
              <li>
                <ExternalLink
                  href="https://github.com/thepixelabs/redditch"
                  className="enamel-link"
                  unstyled
                >
                  Contribute on GitHub
                </ExternalLink>
              </li>
              <li>
                <ExternalLink
                  href="https://www.royalenfield.com"
                  className="enamel-link"
                  unstyled
                >
                  Royal Enfield Motors
                </ExternalLink>
              </li>
            </ul>
          </nav>

          {/* ── Right: provenance + disclaimer ─────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'var(--re-gold)',
                marginBottom: '0',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              Notice
            </span>

            <p
              style={{
                fontFamily: 'var(--font-body), system-ui, sans-serif',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Data is verified by community contributors against official
              Royal Enfield service manuals. Always cross-reference your
              owner&apos;s manual before performing maintenance — and torque
              every bolt to spec.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
              <span className="stamp">DATA VERIFIED</span>
              <span className="stamp stamp-muted">MIT LICENSED</span>
              <span className="stamp stamp-muted">NO COOKIES</span>
            </div>
          </div>
        </div>

        {/* ── Bottom rule: copyright + license ───────────────────── */}
        <div
          style={{
            marginTop: '44px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            &copy; {year} Redditch Contributors
          </p>

          <p
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            Pure Motorcycling.
          </p>
        </div>
      </div>
    </footer>
  )
}
