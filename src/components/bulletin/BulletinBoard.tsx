import type { BulletinData, BulletinEntry, BulletinType } from '@/lib/types'
import { CardArt } from '@/components/art/CardArt'

// ─── External arrow icon ─────────────────────────────────────────────────────

function ExternalArrow({ color }: { color: string }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M7 17 L17 7" />
      <polyline points="9 7 17 7 17 15" />
    </svg>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<BulletinType, string> = {
  event:        'Event',
  technical:    'Technical',
  article:      'Article',
  changelog:    'Data',
  announcement: 'Notice',
}

/** Different visual treatments for different entry types. */
function cardVariantFor(type: BulletinType): string {
  switch (type) {
    case 'technical':
    case 'announcement':
      return 'bulletin-card-enamel'
    case 'event':
      return 'bulletin-card-chalk'
    case 'article':
      return 'bulletin-card-parchment'
    case 'changelog':
      return 'bulletin-card-ledger'
    default:
      return ''
  }
}

/** Deterministic hash from entry ID — used for rotation, accent colour seed, paper tone. */
function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** Small pseudo-random rotation for a pinned-paper feel, seeded by id hash. */
function rotateFor(hash: number): string {
  const angle = ((hash % 9) - 4) * 0.22   // −0.88° to +0.88°
  return `${angle.toFixed(2)}deg`
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

// ─── Pinned notice card ──────────────────────────────────────────────────────

function NoticeCard({ entry }: { entry: BulletinEntry }) {
  const variant = cardVariantFor(entry.type)
  const hash = hashId(entry.id)
  const rotate = rotateFor(hash)
  const isEnamel = variant === 'bulletin-card-enamel'
  const isChalk = variant === 'bulletin-card-chalk'

  // Source meta colour adapts to card variant
  const metaColor = isChalk || isEnamel ? 'rgba(200,150,44,0.85)' : '#a08a60'
  const borderColor = 'rgba(200,150,44,0.18)'

  // Content — title-first hierarchy
  const content = (
    <>
      {/* Accent stripe with type icon */}
      <CardArt type={entry.type} seed={hash} />

      <div className="bulletin-card-content">
        {/* Title first — the headline earns attention */}
        <h3 className="bulletin-card-title">{entry.title}</h3>

        {/* Meta row — date + location (type is already in the badge) */}
        <div className="bulletin-card-meta">
          <time dateTime={entry.date}>{formatDate(entry.date)}</time>
          {entry.location && (
            <>
              <span className="dot" aria-hidden="true" />
              <span>{entry.location}</span>
            </>
          )}
        </div>

        <p className="bulletin-card-body">{entry.body}</p>

        {/* Source CTA — primary affordance */}
        {(entry.source || entry.author) && (
          <div
            className="bulletin-card-source"
            style={{
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: `1px solid ${borderColor}`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: metaColor,
              fontWeight: 600,
            }}
          >
            <span>
              {entry.source_url ? 'Read at' : 'Source'} · {entry.source ?? entry.author}
            </span>
            {entry.source_url && <ExternalArrow color={metaColor} />}
          </div>
        )}
      </div>
    </>
  )

  const classes = ['bulletin-card', variant].filter(Boolean).join(' ')

  // If we have a source_url, the entire card becomes a clickable link
  if (entry.source_url) {
    return (
      <a
        href={entry.source_url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${entry.title} — read at ${entry.source ?? entry.author ?? 'source'} (opens in new tab)`}
        className={`${classes} bulletin-card-link`}
        style={{
          '--paper-rotate': isEnamel ? '0deg' : rotate,
          color: 'inherit',
          textDecoration: 'none',
          display: 'block',
        } as React.CSSProperties}
      >
        {content}
      </a>
    )
  }

  return (
    <article
      className={classes}
      style={{
        '--paper-rotate': isEnamel ? '0deg' : rotate,
      } as React.CSSProperties}
    >
      {content}
    </article>
  )
}

// ─── Featured block ──────────────────────────────────────────────────────────

function FeaturedBlock({
  featured,
}: {
  featured: NonNullable<BulletinData['featured']>
}) {
  const body = (
    <>
      {/* Corner stamp */}
      <span
        className="stamp"
        style={{
          position: 'absolute',
          top: '-10px',
          left: '20px',
          background: 'var(--bg)',
        }}
      >
        {featured.tag ?? 'Featured'}
      </span>

      <h3
        style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: 'clamp(1.3rem, 2.4vw, 1.9rem)',
          fontWeight: 700,
          lineHeight: 1.2,
          margin: '6px 0 12px',
          color: 'var(--re-cream)',
          transition: 'color 150ms ease',
        }}
      >
        {featured.title}
      </h3>

      <p
        style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontStyle: 'italic',
          fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)',
          lineHeight: 1.55,
          color: 'var(--text-secondary)',
          maxWidth: '62ch',
          margin: '0 0 16px',
        }}
      >
        {featured.lede}
      </p>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '10px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {featured.author && <span>{featured.author}</span>}
        {featured.author && <span aria-hidden="true">·</span>}
        <time dateTime={featured.published}>{formatDate(featured.published)}</time>
        {featured.href && (
          <>
            <span aria-hidden="true">·</span>
            <span
              style={{
                color: 'var(--re-gold)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                borderBottom: '1px solid rgba(200,150,44,0.3)',
                paddingBottom: '1px',
              }}
            >
              Read the full piece
              <ExternalArrow color="var(--re-gold)" />
            </span>
          </>
        )}
      </div>
    </>
  )

  const sharedStyle = {
    position: 'relative' as const,
    display: 'block' as const,
    padding: 'clamp(24px, 3vw, 40px)',
    background: 'linear-gradient(180deg, rgba(196,151,90,0.06) 0%, transparent 100%)',
    border: '1px solid rgba(196,151,90,0.22)',
    borderRadius: '3px',
    marginBottom: 'clamp(20px, 2.5vw, 36px)',
    textDecoration: 'none' as const,
    color: 'inherit',
    transition: 'border-color 180ms ease, background 180ms ease',
  }

  if (featured.href) {
    return (
      <a
        href={featured.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${featured.title} — read the full piece (opens in new tab)`}
        className="featured-block-link"
        style={sharedStyle}
      >
        {body}
      </a>
    )
  }

  return <div style={sharedStyle}>{body}</div>
}

// ─── BulletinBoard ───────────────────────────────────────────────────────────

interface BulletinBoardProps {
  data: BulletinData
  /** "preview" compresses to 4 cards + skips featured; "full" renders everything */
  mode?: 'preview' | 'full'
  /** Inline heading text — used by the section-label-rule in preview mode */
  heading?: string
}

/**
 * Workshop corkboard — featured article + pinned notices grid.
 *
 * In full mode (/bulletin page): renders a full-width hero image with the
 * page heading overlaid in the bottom-left corner, then the featured block
 * and the cards grid. The section-label-rule is suppressed — the h1 in the
 * image overlay serves as the landmark heading.
 *
 * In preview mode (homepage widget): renders the section-label-rule heading
 * and the first four cards only.
 */
export function BulletinBoard({
  data,
  mode = 'full',
  heading = 'Bulletin Board',
}: BulletinBoardProps) {
  const isPreview = mode === 'preview'
  const entries = isPreview ? data.entries.slice(0, 4) : data.entries

  return (
    <section
      aria-labelledby="bulletin-heading"
      className="bulletin-board"
      data-board-mode={mode}
      style={{
        position: 'relative',
        padding: isPreview ? 'clamp(28px, 4vw, 56px) clamp(16px, 3vw, 40px)' : '0',
        borderRadius: isPreview ? '4px' : 0,
      }}
    >
      {/* ── Full mode: hero image with heading overlay ── */}
      {!isPreview && (
        <div className="bulletin-hero-wrap">
          <img
            src="/images/bulletin/hero.png"
            alt=""
            aria-hidden="true"
            className="bulletin-hero-img"
          />
          {/* Text overlay — stamp + h1 + lede pinned to the bottom-left */}
          <div className="bulletin-hero-overlay">
            <p
              className="stamp"
              style={{ display: 'inline-block', marginBottom: '12px', alignSelf: 'flex-start' }}
            >
              Community Notice Board
            </p>
            <h1
              id="bulletin-heading"
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(2rem, 5vw, 3.4rem)',
                fontWeight: 800,
                letterSpacing: '0.01em',
                lineHeight: 1.1,
                color: 'var(--re-cream)',
                margin: '0 0 14px',
                textShadow: '0 2px 12px rgba(0,0,0,0.6)',
              }}
            >
              Bulletin Board
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontStyle: 'italic',
                fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)',
                color: 'var(--re-cream)',
                opacity: 0.82,
                lineHeight: 1.55,
                maxWidth: '52ch',
                margin: 0,
                textShadow: '0 1px 8px rgba(0,0,0,0.55)',
              }}
            >
              Upcoming rides, technical service bulletins, community events, and
              updates to the dataset. Pinned by date — most recent on top. Every
              entry is sourced.
            </p>
          </div>
        </div>
      )}

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1280px',
          margin: '0 auto',
          padding: isPreview ? '0' : 'clamp(28px, 4vw, 56px) clamp(16px, 3vw, 40px)',
        }}
      >
        {/* Section-label-rule only in preview mode — full mode uses the h1 overlay */}
        {isPreview && (
          <div className="section-label-rule" style={{ marginBottom: 'clamp(20px, 2.5vw, 36px)' }}>
            <span id="bulletin-heading">{heading}</span>
          </div>
        )}

        {/* Featured — only in full mode */}
        {!isPreview && data.featured && <FeaturedBlock featured={data.featured} />}

        {/* Grid of pinned notices */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'clamp(20px, 2.5vw, 36px)',
            paddingTop: 'clamp(12px, 1.5vw, 20px)',
          }}
        >
          {entries.map((entry) => (
            <NoticeCard key={entry.id} entry={entry} />
          ))}
        </div>

        {/* Preview mode: see-all link */}
        {isPreview && (
          <div
            style={{
              marginTop: 'clamp(24px, 3vw, 40px)',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <a
              href="/bulletin"
              className="enamel-link"
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--re-gold)',
                borderBottom: '1px solid rgba(200,150,44,0.3)',
                padding: '10px 16px',
              }}
            >
              See the full bulletin board →
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
