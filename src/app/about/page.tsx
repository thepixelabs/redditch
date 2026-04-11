import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink } from '@/components/ui/ExternalLink'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Redditch is an open-source Royal Enfield maintenance reference built by riders, for riders.',
  openGraph: {
    title: 'About — Redditch',
    description:
      'Redditch is an open-source Royal Enfield maintenance reference built by riders, for riders.',
  },
}

export default function AboutPage() {
  return (
    <div className="garage-wall" style={{ minHeight: 'calc(100vh - 160px)' }}>
      <div
        style={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: 'clamp(32px, 5vw, 72px) clamp(20px, 3vw, 40px) clamp(40px, 6vw, 80px)',
        }}
      >
        <p className="stamp" style={{ display: 'inline-block', marginBottom: '16px' }}>
          About the Project
        </p>

        <h1
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            letterSpacing: '0.01em',
            lineHeight: 1.1,
            color: 'var(--re-cream)',
            margin: '0 0 24px',
          }}
        >
          Redditch
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(1rem, 1.6vw, 1.2rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            maxWidth: '60ch',
            margin: '0 0 clamp(32px, 4vw, 52px)',
          }}
        >
          The service manual your dealer wishes they had.
        </p>

        {/* Body copy */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
            fontFamily: 'var(--font-body), system-ui, sans-serif',
            fontSize: '15px',
            color: 'var(--text-secondary)',
            lineHeight: 1.75,
            maxWidth: '66ch',
          }}
        >
          <p style={{ margin: 0 }}>
            Redditch is a community-built maintenance reference for Royal Enfield
            motorcycles. Every service interval, torque value, and part number has
            been cross-referenced against official service manuals by contributors
            who ride these machines.
          </p>

          <p style={{ margin: 0 }}>
            The project is named after{' '}
            <ExternalLink href="https://en.wikipedia.org/wiki/Redditch" unstyled className="enamel-link">
              Redditch, Worcestershire
            </ExternalLink>
            {' '}— the English town where Royal Enfield motorcycles were built from
            1891 until the factory closed in 1970. The name has been part of the
            marque&apos;s identity ever since.
          </p>

          <p style={{ margin: 0 }}>
            This site is not affiliated with Royal Enfield Motors Ltd. It is an
            independent, open-source project released under the MIT licence.
            All trademarks remain the property of their respective owners.
          </p>

          {/* Stamps row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
            <span className="stamp">DATA VERIFIED</span>
            <span className="stamp stamp-muted">MIT LICENSED</span>
            <span className="stamp stamp-muted">NO COOKIES</span>
            <span className="stamp stamp-muted">STATIC EXPORT</span>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            margin: 'clamp(36px, 5vw, 56px) 0',
            borderTop: '1px solid var(--border-subtle)',
          }}
        />

        {/* Contribute section */}
        <div style={{ maxWidth: '66ch' }}>
          <h2
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--re-gold)',
              marginBottom: '16px',
            }}
          >
            Contribute
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-body), system-ui, sans-serif',
              fontSize: '15px',
              color: 'var(--text-secondary)',
              lineHeight: 1.75,
              margin: '0 0 20px',
            }}
          >
            Missing your bike? Found a spec that&apos;s wrong? Contributions are
            welcome — open an issue or pull request on GitHub.
          </p>

          <ExternalLink
            href="https://github.com/thepixelabs/redditch"
            unstyled
            className="enamel-link"
          >
            github.com/thepixelabs/redditch →
          </ExternalLink>
        </div>

        {/* Back link */}
        <div style={{ marginTop: 'clamp(40px, 6vw, 64px)' }}>
          <Link href="/" className="enamel-link">
            ← Back to the garage
          </Link>
        </div>
      </div>
    </div>
  )
}
