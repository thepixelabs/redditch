'use client'

import { ExternalLink } from '@/components/ui/ExternalLink'

interface FindRidersLinkProps {
  bikeName: string
}

const TOP_COMMUNITIES = [
  { name: 'r/RoyalEnfield', url: 'https://www.reddit.com/r/RoyalEnfield/', platform: 'Reddit' },
  { name: 'RE Riders (100K+)', url: 'https://www.facebook.com/groups/royalenfieldriders', platform: 'Facebook' },
]

/**
 * FindRidersLink — helps users find fellow RE riders.
 *
 * Two parts:
 * 1. A Facebook group search link pre-filled with the bike model name
 * 2. Links to the top known RE communities
 *
 * Workshop panel aesthetic — dark surface, gold label, subtle border.
 */
export function FindRidersLink({ bikeName }: FindRidersLinkProps) {
  const query = encodeURIComponent(`Royal Enfield ${bikeName}`)
  const fbSearchUrl = `https://www.facebook.com/search/groups/?q=${query}`

  return (
    <section
      aria-label="Rider community"
      style={{
        marginTop: '24px',
        border: '1px solid var(--border-subtle)',
        borderRadius: '4px',
        background: 'var(--bg-surface)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 16px 0',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--re-gold)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Find riders
      </div>

      <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Connect with fellow {bikeName} owners and local riding groups.
        </p>

        {/* Facebook search — model-specific */}
        <a
          href={fbSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            minHeight: '44px',
            padding: '10px 14px',
            background: 'rgba(200, 150, 44, 0.06)',
            border: '1px solid var(--re-gold-muted)',
            borderRadius: '4px',
            color: 'var(--re-gold)',
            fontFamily: 'var(--font-body, sans-serif)',
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'all 150ms ease',
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search Facebook groups for {bikeName}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginLeft: 'auto', opacity: 0.6 }}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>

        {/* Top communities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Top communities
          </span>
          {TOP_COMMUNITIES.map(c => (
            <div key={c.url} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)', minWidth: '60px' }}>
                {c.platform}
              </span>
              <ExternalLink href={c.url}>
                {c.name}
              </ExternalLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
