import Link from 'next/link'
import { ExternalLink } from '@/components/ui/ExternalLink'

/**
 * Footer — the quiet bottom of the page.
 *
 * Three columns on desktop, stacked vertically on mobile.
 * No marketing language. No social icons. No newsletter prompt.
 * Just attribution, navigation, and an honest disclaimer.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        {/* Three-column grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
        >
          {/* ── Left: identity ─────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--re-gold)',
              }}
            >
              REDDITCH
            </span>

            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Built by riders, for riders.
            </p>

            <p
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Not affiliated with Royal Enfield.
            </p>
          </div>

          {/* ── Center: links ──────────────────────────────────────── */}
          <nav aria-label="Footer navigation">
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <li>
                <Link
                  href="/about"
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'color 150ms ease',
                  }}
                  className="hover:text-[var(--re-gold)]"
                >
                  About
                </Link>
              </li>

              <li>
                <ExternalLink
                  href="https://github.com/thepixelabs/redditch"
                  className="text-[12px]"
                >
                  Contribute on GitHub
                </ExternalLink>
              </li>

              <li>
                <ExternalLink
                  href="https://www.royalenfield.com"
                  className="text-[12px]"
                >
                  Royal Enfield
                </ExternalLink>
              </li>
            </ul>
          </nav>

          {/* ── Right: disclaimer ──────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Data verified by community contributors. Always cross-reference
              your owner&apos;s manual before performing maintenance.
            </p>
          </div>
        </div>

        {/* ── Bottom rule: copyright + license ───────────────────── */}
        <div
          style={{
            marginTop: '32px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            &copy; {year} Redditch Contributors
          </p>

          <p
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            Released under the{' '}
            <ExternalLink
              href="https://opensource.org/licenses/MIT"
              className="text-[11px]"
            >
              MIT License
            </ExternalLink>
          </p>
        </div>
      </div>
    </footer>
  )
}
