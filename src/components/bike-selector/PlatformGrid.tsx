'use client'

import { PLATFORMS, PLATFORM_BIKE_MAP } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface PlatformGridProps {
  selectedPlatform: string | null
  onSelect: (platformId: string) => void
  availableSlugs: string[]
}

// ─── Motorcycle icons ─────────────────────────────────────────────────────────
// Two flavours: parallel-twin silhouette for the 650s, single-cylinder for all
// others. Simple, recognisable at small sizes, stroke-based so they inherit
// currentColor from the parent.

function TwinIcon({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="20"
      viewBox="0 0 56 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Rear wheel */}
      <circle cx="10" cy="26" r="8" />
      {/* Front wheel */}
      <circle cx="46" cy="26" r="8" />
      {/* Frame spine */}
      <path d="M10 18 L22 10 L38 10 L46 18" />
      {/* Seat/tank */}
      <path d="M18 10 Q28 4 38 10" />
      {/* Twin engine block — slightly wider than single */}
      <rect x="20" y="16" width="16" height="8" rx="1.5" />
      {/* Fork */}
      <path d="M40 18 L46 18" />
      {/* Handlebars */}
      <path d="M36 8 L40 5 M38 8 L42 5" />
    </svg>
  )
}

function SingleIcon({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="20"
      viewBox="0 0 56 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Rear wheel */}
      <circle cx="10" cy="26" r="8" />
      {/* Front wheel */}
      <circle cx="46" cy="26" r="8" />
      {/* Frame spine */}
      <path d="M10 18 L20 10 L38 10 L46 18" />
      {/* Seat/tank */}
      <path d="M16 10 Q28 4 38 10" />
      {/* Single engine block — narrower */}
      <rect x="22" y="16" width="12" height="8" rx="1.5" />
      {/* Fork */}
      <path d="M40 18 L46 18" />
      {/* Handlebars */}
      <path d="M36 8 L40 5" />
    </svg>
  )
}

// ─── Keyboard nav helper ──────────────────────────────────────────────────────
// Arrow keys navigate within the radiogroup. This is the standard ARIA radio
// group pattern; Space/Enter activates; Home/End jump to extremes.

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
    case 'ArrowDown':
    case 'ArrowRight':
      e.preventDefault()
      nextIndex = currentIndex < focusable.length - 1 ? currentIndex + 1 : 0
      break
    case 'ArrowUp':
    case 'ArrowLeft':
      e.preventDefault()
      nextIndex = currentIndex > 0 ? currentIndex - 1 : focusable.length - 1
      break
    case 'Home':
      e.preventDefault()
      nextIndex = 0
      break
    case 'End':
      e.preventDefault()
      nextIndex = focusable.length - 1
      break
  }

  if (nextIndex !== null) {
    const next = focusable[nextIndex]
    onSelect(next.id)
    // Move DOM focus to the newly selected card
    const el = document.getElementById(`platform-card-${next.id}`)
    el?.focus()
  }
}

// ─── PlatformGrid ─────────────────────────────────────────────────────────────

export function PlatformGrid({
  selectedPlatform,
  onSelect,
  availableSlugs,
}: PlatformGridProps) {
  // A platform is available if at least one of its bike slugs has a data file.
  const availablePlatformIds = PLATFORMS
    .filter((p) => {
      const slugs = PLATFORM_BIKE_MAP[p.id] ?? []
      return slugs.some((slug) => availableSlugs.includes(slug))
    })
    .map((p) => p.id)

  return (
    <section aria-labelledby="platform-heading">
      <h2
        id="platform-heading"
        className="mb-5 text-[22px] leading-snug text-[var(--text-primary)]"
        style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
      >
        Which Royal Enfield do you ride?
      </h2>

      <div
        role="radiogroup"
        aria-label="Select motorcycle platform"
        className="grid grid-cols-2 md:grid-cols-3 gap-3"
        onKeyDown={(e) =>
          handleRadioKeyDown(e, [...PLATFORMS], selectedPlatform, onSelect, availablePlatformIds)
        }
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
                // Only one card is in the tab order at a time (roving tabindex).
                // If nothing is selected yet, the first available card gets focus.
                isAvailable
                  ? isSelected ||
                    (selectedPlatform === null &&
                      platform.id === availablePlatformIds[0])
                    ? 0
                    : -1
                  : -1
              }
              onClick={() => isAvailable && onSelect(platform.id)}
              onKeyDown={(e) => {
                if (!isAvailable) return
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  onSelect(platform.id)
                }
              }}
              className={cn(
                // Base layout
                'relative flex flex-col justify-between gap-2',
                'min-h-[72px] p-3',
                // Surface
                'rounded-[8px]',
                'bg-[var(--bg-surface)]',
                'border border-[var(--border)]',
                // Transition
                'transition-all duration-150',
                // Selected state
                isSelected && [
                  'border-[var(--re-gold)]',
                  // Gold left-bar drawn via box-shadow so it doesn't shift layout
                  'shadow-[inset_3px_0_0_var(--re-gold)]',
                ],
                // Available + not selected — hover
                isAvailable && !isSelected && [
                  'cursor-pointer',
                  'hover:border-[var(--re-gold-muted)]',
                  'hover:shadow-[inset_3px_0_0_var(--re-gold-muted)]',
                  'active:brightness-95',
                ],
                // Unavailable — dimmed
                !isAvailable && 'opacity-40 cursor-not-allowed select-none',
                // Focus ring
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-[var(--re-gold)] focus-visible:ring-offset-2',
                'focus-visible:ring-offset-[var(--bg)]',
              )}
            >
              {/* Icon + name row */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex-shrink-0 transition-colors duration-150',
                    isSelected
                      ? 'text-[var(--re-gold)]'
                      : 'text-[var(--text-secondary)]',
                  )}
                >
                  {isTwin ? <TwinIcon /> : <SingleIcon />}
                </span>

                <span
                  className="text-[16px] font-bold leading-tight text-[var(--text-primary)]"
                  style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                >
                  {platform.label}
                </span>
              </div>

              {/* Engine descriptor or coming-soon pill */}
              {isAvailable ? (
                <span
                  className="text-[12px] text-[var(--text-secondary)] leading-none pl-[36px]"
                  style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
                >
                  {platform.engine}
                </span>
              ) : (
                <span
                  className={cn(
                    'self-start text-[10px] uppercase tracking-widest',
                    'px-2 py-0.5 rounded-full',
                    'bg-[var(--border)] text-[var(--text-muted)]',
                    'ml-[36px]',
                  )}
                  style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
                >
                  Coming soon
                </span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
