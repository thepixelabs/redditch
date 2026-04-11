'use client'

import type { Dealer } from '@/lib/types'
import { DealerCard } from './DealerCard'

interface DealerListProps {
  dealers: Dealer[]
  onDealerClick: (dealer: Dealer) => void
  isLoading: boolean
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
// Matches DealerCard's layout so the list doesn't shift when real data arrives.

function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      style={{
        background:   'var(--bg-card)',
        border:       '1px solid var(--border-subtle)',
        borderLeft:   '3px solid rgba(181,18,27,0.3)',
        borderRadius: '6px',
        padding:      '12px 14px',
        display:      'flex',
        flexDirection:'column',
        gap:          '8px',
      }}
    >
      {/* Name line */}
      <div
        style={{
          height:       '14px',
          width:        '70%',
          borderRadius: '3px',
          background:   'linear-gradient(90deg, var(--bg-surface) 25%, rgba(200,150,44,0.06) 50%, var(--bg-surface) 75%)',
          backgroundSize: '200% 100%',
          animation:    'shimmer 1.4s ease-in-out infinite',
        }}
      />
      {/* Location line */}
      <div
        style={{
          height:       '10px',
          width:        '45%',
          borderRadius: '3px',
          background:   'linear-gradient(90deg, var(--bg-surface) 25%, rgba(200,150,44,0.06) 50%, var(--bg-surface) 75%)',
          backgroundSize: '200% 100%',
          animation:    'shimmer 1.4s ease-in-out infinite 0.15s',
        }}
      />
      {/* Phone/website row */}
      <div
        style={{
          height:       '10px',
          width:        '55%',
          borderRadius: '3px',
          background:   'linear-gradient(90deg, var(--bg-surface) 25%, rgba(200,150,44,0.06) 50%, var(--bg-surface) 75%)',
          backgroundSize: '200% 100%',
          animation:    'shimmer 1.4s ease-in-out infinite 0.3s',
        }}
      />
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '10px',
        padding:        '40px 20px',
        textAlign:      'center',
      }}
    >
      {/* Map pin icon */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ color: 'var(--text-muted)', opacity: 0.5 }}
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>

      <p
        style={{
          fontSize:      '12px',
          fontFamily:    'var(--font-mono, monospace)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color:         'var(--text-muted)',
          lineHeight:    1.5,
          maxWidth:      '220px',
        }}
      >
        No dealers found in this area. Pan or zoom the map.
      </p>
    </div>
  )
}

// ─── DealerList ───────────────────────────────────────────────────────────────

export function DealerList({ dealers, onDealerClick, isLoading }: DealerListProps) {
  const count = dealers.length

  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        height:        '100%',
        minHeight:     0,
        background:    'var(--bg-surface)',
      }}
    >
      {/* ── Header: count + section label ────────────────────────────────── */}
      <div
        style={{
          padding:       '12px 14px 10px',
          borderBottom:  '1px solid var(--border-subtle)',
          display:       'flex',
          alignItems:    'baseline',
          gap:           '8px',
          flexShrink:    0,
        }}
      >
        <span
          style={{
            fontSize:      '10px',
            fontFamily:    'var(--font-mono, monospace)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         'var(--re-gold)',
            fontWeight:    600,
          }}
        >
          Dealers
        </span>

        {/* Count chip — gold-tinted, monospace */}
        {!isLoading && (
          <span
            aria-label={`${count} dealer${count !== 1 ? 's' : ''} in view`}
            style={{
              fontSize:      '10px',
              fontFamily:    'var(--font-mono, monospace)',
              letterSpacing: '0.06em',
              color:         'var(--text-muted)',
              background:    'var(--bg-card)',
              border:        '1px solid var(--border-subtle)',
              borderRadius:  '3px',
              padding:       '1px 6px',
              lineHeight:    '1.6',
            }}
          >
            {count}
          </span>
        )}

        {/* Loading indicator next to label while fetching */}
        {isLoading && (
          <span
            aria-hidden="true"
            style={{
              display:     'inline-block',
              width:       '10px',
              height:      '10px',
              border:      '1.5px solid rgba(200,150,44,0.2)',
              borderTop:   '1.5px solid var(--re-gold)',
              borderRadius:'50%',
              animation:   'spin 0.8s linear infinite',
              marginLeft:  '2px',
            }}
          />
        )}
      </div>

      {/* ── Scrollable list body ──────────────────────────────────────────── */}
      <div
        role="list"
        aria-label="Dealer results"
        aria-live="polite"
        aria-busy={isLoading}
        style={{
          flex:       1,
          overflowY:  'auto',
          padding:    '10px 10px',
          display:    'flex',
          flexDirection:'column',
          gap:        '8px',
          // Scrollbar styling for webkit browsers — keeps it garage-dark
          scrollbarWidth:     'thin',
          scrollbarColor:     'rgba(200,150,44,0.2) transparent',
        }}
      >
        {isLoading ? (
          // Render 4 placeholder cards while data is in flight
          Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)
        ) : count === 0 ? (
          <EmptyState />
        ) : (
          dealers.map((dealer) => (
            <div key={dealer.id} role="listitem">
              <DealerCard dealer={dealer} onClick={() => onDealerClick(dealer)} />
            </div>
          ))
        )}
      </div>

      {/* Keyframe declarations shared by SkeletonCard and the header spinner */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
