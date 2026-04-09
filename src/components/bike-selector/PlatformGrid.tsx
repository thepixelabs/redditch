'use client'

import { PLATFORMS, PLATFORM_BIKE_MAP } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface PlatformGridProps {
  selectedPlatform: string | null
  onSelect: (platformId: string) => void
  availableSlugs: string[]
}

function TwinIcon({ className }: { className?: string }) {
  return (
    <svg width="28" height="20" viewBox="0 0 56 36" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle cx="10" cy="26" r="8" />
      <circle cx="46" cy="26" r="8" />
      <path d="M10 18 L22 10 L38 10 L46 18" />
      <path d="M18 10 Q28 4 38 10" />
      <rect x="20" y="16" width="16" height="8" rx="1.5" />
      <path d="M40 18 L46 18" />
      <path d="M36 8 L40 5 M38 8 L42 5" />
    </svg>
  )
}

function SingleIcon({ className }: { className?: string }) {
  return (
    <svg width="28" height="20" viewBox="0 0 56 36" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle cx="10" cy="26" r="8" />
      <circle cx="46" cy="26" r="8" />
      <path d="M10 18 L20 10 L38 10 L46 18" />
      <path d="M16 10 Q28 4 38 10" />
      <rect x="22" y="16" width="12" height="8" rx="1.5" />
      <path d="M40 18 L46 18" />
      <path d="M36 8 L40 5" />
    </svg>
  )
}

function handleRadioKeyDown(
  e: React.KeyboardEvent<HTMLDivElement>,
  items: typeof PLATFORMS,
  selectedPlatform: string | null,
  onSelect: (id: string) => void,
  availableIds: string[],
) {
  const focusable = items.filter((p) => availableIds.includes(p.id))
  const currentIndex = focusable.findIndex((p) => p.id === selectedPlatform)
  let nextIndex: number | null = null

  switch (e.key) {
    case 'ArrowDown': case 'ArrowRight':
      e.preventDefault(); nextIndex = currentIndex < focusable.length - 1 ? currentIndex + 1 : 0; break
    case 'ArrowUp': case 'ArrowLeft':
      e.preventDefault(); nextIndex = currentIndex > 0 ? currentIndex - 1 : focusable.length - 1; break
    case 'Home': e.preventDefault(); nextIndex = 0; break
    case 'End':  e.preventDefault(); nextIndex = focusable.length - 1; break
  }

  if (nextIndex !== null) {
    const next = focusable[nextIndex]
    onSelect(next.id)
    document.getElementById(`platform-card-${next.id}`)?.focus()
  }
}

export function PlatformGrid({ selectedPlatform, onSelect, availableSlugs }: PlatformGridProps) {
  const availablePlatformIds = PLATFORMS
    .filter((p) => (PLATFORM_BIKE_MAP[p.id] ?? []).some((slug) => availableSlugs.includes(slug)))
    .map((p) => p.id)

  return (
    <section aria-labelledby="platform-heading">
      <h2
        id="platform-heading"
        style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--re-gold)',
          marginBottom: '16px',
        }}
      >
        Select your machine
      </h2>

      <div
        role="radiogroup"
        aria-label="Select motorcycle platform"
        className="grid grid-cols-2 md:grid-cols-3 gap-3"
        onKeyDown={(e) => handleRadioKeyDown(e, [...PLATFORMS], selectedPlatform, onSelect, availablePlatformIds)}
      >
        {PLATFORMS.map((platform) => {
          const isAvailable = availablePlatformIds.includes(platform.id)
          const isSelected  = selectedPlatform === platform.id
          const isTwin      = platform.id === '650-twins'

          return (
            <div
              key={platform.id}
              id={`platform-card-${platform.id}`}
              role="radio"
              aria-checked={isSelected}
              aria-disabled={!isAvailable}
              tabIndex={
                isAvailable
                  ? (isSelected || (selectedPlatform === null && platform.id === availablePlatformIds[0])) ? 0 : -1
                  : -1
              }
              onClick={() => isAvailable && onSelect(platform.id)}
              onKeyDown={(e) => {
                if (!isAvailable) return
                if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onSelect(platform.id) }
              }}
              className={cn(
                'relative flex flex-col justify-between gap-2 min-h-[80px] p-3 rounded-[6px]',
                'garage-card-metal transition-all duration-150',
                isSelected && 'border border-[var(--re-red)] bg-[rgba(181,18,27,0.06)]',
                !isSelected && isAvailable && [
                  'border border-[rgba(74,74,74,0.5)] bg-[#2A2A2A]',
                  'cursor-pointer garage-card',
                  'hover:border-[rgba(200,150,44,0.4)]',
                  'active:brightness-90',
                ],
                !isAvailable && 'border border-[rgba(74,74,74,0.3)] bg-[rgba(42,42,42,0.5)] opacity-40 cursor-not-allowed select-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--re-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]',
              )}
              style={isSelected ? { borderLeftWidth: '5px', borderLeftColor: 'var(--re-red)' } : undefined}
            >
              <div className="flex items-center gap-2">
                <span className={cn('flex-shrink-0 transition-colors duration-150', isSelected ? 'text-[var(--re-red)]' : 'text-[var(--re-gold)]')}>
                  {isTwin ? <TwinIcon /> : <SingleIcon />}
                </span>
                <span className="text-[15px] font-bold leading-tight text-[var(--text-primary)]"
                  style={{ fontFamily: 'var(--font-display), Georgia, serif', letterSpacing: '0.01em' }}>
                  {platform.label}
                </span>
              </div>

              {isAvailable ? (
                <span className="text-[11px] uppercase leading-none pl-[36px]"
                  style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
                  {platform.engine}
                </span>
              ) : (
                <span className="stencil-badge ml-[36px]">Coming soon</span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
