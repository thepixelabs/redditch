'use client'

import type { Dealer } from '@/lib/types'
import { ExternalLink } from '@/components/ui/ExternalLink'

interface DealerCardProps {
  dealer: Dealer
  onClick?: () => void
  distanceKm?: number | null
}

// ─── Source badge ─────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: Dealer['source'] }) {
  const isOsm = source === 'osm'
  return (
    <span
      style={{
        display:       'inline-block',
        fontSize:      '9px',
        fontFamily:    'var(--font-mono, monospace)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        padding:       '2px 5px',
        borderRadius:  '3px',
        background:    isOsm ? 'rgba(200,150,44,0.10)' : 'rgba(181,18,27,0.10)',
        color:         isOsm ? 'var(--re-gold)' : 'var(--re-red)',
        border:        isOsm ? '1px solid rgba(200,150,44,0.28)' : '1px solid rgba(181,18,27,0.28)',
        lineHeight:    '1',
        flexShrink:    0,
      }}
    >
      {isOsm ? 'OSM' : 'Curated'}
    </span>
  )
}

// ─── DealerCard ───────────────────────────────────────────────────────────────

export function DealerCard({ dealer, onClick, distanceKm }: DealerCardProps) {
  const locationLine = [dealer.city, dealer.country].filter(Boolean).join(', ')

  return (
    <article
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      aria-label={`${dealer.name}${locationLine ? `, ${locationLine}` : ''}`}
      style={{
        display:      'flex',
        flexDirection:'column',
        gap:          '6px',
        background:   'var(--bg-card)',
        border:       '1px solid var(--border-subtle)',
        borderLeft:   '3px solid var(--re-red)',
        borderRadius: '6px',
        padding:      'clamp(10px, 1.2vw, 14px) clamp(12px, 1.4vw, 16px)',
        cursor:       onClick ? 'pointer' : 'default',
        transition:   'border-color 150ms ease, box-shadow 150ms ease',
        boxShadow:    '0 1px 3px rgba(0,0,0,0.3)',
        // a11y: show focus ring when navigated via keyboard
        outline:      'none',
      }}
      // Hover border upgrade — achieved via inline event handlers since we
      // can't target :hover in inline styles. Small cost, keeps component self-contained.
      onMouseEnter={(e) => {
        if (!onClick) return
        const el = e.currentTarget
        el.style.borderColor   = 'var(--re-gold)'
        el.style.borderLeftColor = 'var(--re-red)'
        el.style.boxShadow     = '0 2px 8px rgba(0,0,0,0.45)'
      }}
      onMouseLeave={(e) => {
        if (!onClick) return
        const el = e.currentTarget
        el.style.borderColor   = 'var(--border-subtle)'
        el.style.borderLeftColor = 'var(--re-red)'
        el.style.boxShadow     = '0 1px 3px rgba(0,0,0,0.3)'
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = '0 0 0 2px var(--re-gold)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)'
      }}
    >
      {/* ── Header row: name + source badge ──────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <p
          style={{
            flex:       1,
            fontSize:   '14px',
            fontWeight: 700,
            lineHeight: 1.3,
            color:      'var(--text-primary)',
            fontFamily: 'var(--font-display, Georgia, serif)',
          }}
        >
          {dealer.name}
        </p>
        <SourceBadge source={dealer.source} />
      </div>

      {/* ── Location ─────────────────────────────────────────────────────── */}
      {locationLine && (
        <p
          style={{
            fontSize:      '11px',
            color:         'var(--text-muted)',
            fontFamily:    'var(--font-mono, monospace)',
            letterSpacing: '0.06em',
          }}
        >
          {locationLine}
        </p>
      )}

      {/* ── Distance chip ────────────────────────────────────────────────── */}
      {distanceKm != null && (
        <span
          style={{
            display:       'inline-block',
            fontSize:      '10px',
            fontFamily:    'var(--font-mono, monospace)',
            letterSpacing: '0.08em',
            padding:       '1px 6px',
            borderRadius:  '3px',
            background:    'rgba(200,150,44,0.10)',
            color:         'var(--re-gold)',
            border:        '1px solid rgba(200,150,44,0.25)',
            alignSelf:     'flex-start',
          }}
        >
          {distanceKm < 1
            ? `${Math.round(distanceKm * 1000)} m`
            : distanceKm < 10
              ? `${distanceKm.toFixed(1)} km`
              : `${Math.round(distanceKm)} km`}
        </span>
      )}

      {/* ── Address ──────────────────────────────────────────────────────── */}
      {dealer.address && (
        <p
          style={{
            fontSize:   '12px',
            color:      'var(--text-secondary)',
            lineHeight: 1.4,
          }}
        >
          {dealer.address}
        </p>
      )}

      {/* ── Contact row: phone + website ──────────────────────────────────── */}
      {(dealer.phone ?? dealer.website) && (
        <div
          style={{
            display:    'flex',
            flexWrap:   'wrap',
            alignItems: 'center',
            gap:        '8px',
            marginTop:  '2px',
            paddingTop: '6px',
            borderTop:  '1px solid var(--border-subtle)',
          }}
        >
          {dealer.phone && (
            <a
              href={`tel:${dealer.phone}`}
              // Stop click from bubbling to the card's onClick (map pan)
              onClick={(e) => e.stopPropagation()}
              aria-label={`Call ${dealer.name}: ${dealer.phone}`}
              style={{
                fontSize:      '12px',
                fontFamily:    'var(--font-mono, monospace)',
                letterSpacing: '0.06em',
                color:         'var(--re-gold)',
                textDecoration:'none',
                display:       'inline-flex',
                alignItems:    'center',
                gap:           '4px',
              }}
            >
              {/* Phone icon */}
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {dealer.phone}
            </a>
          )}

          {dealer.website && (
            <ExternalLink
              href={dealer.website}
              // Prevent card onClick when the link is tapped
              style={{ fontSize: '12px' }}
            >
              Website
            </ExternalLink>
          )}
        </div>
      )}

      {/* ── Opening hours ─────────────────────────────────────────────────── */}
      {dealer.openingHours && (
        <p
          style={{
            fontSize:      '10px',
            color:         'var(--text-muted)',
            fontFamily:    'var(--font-mono, monospace)',
            letterSpacing: '0.05em',
          }}
        >
          {dealer.openingHours}
        </p>
      )}
    </article>
  )
}
