'use client'

import { useEffect, useState } from 'react'
import type { BikeSpec } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ModelCardsProps {
  platformId: string
  bikes: BikeSpec[]
  selectedSlug: string | null
  onSelect: (slug: string) => void
}

// ─── Keyboard nav (roving tabindex within the model radiogroup) ───────────────

function handleRadioKeyDown(
  e: React.KeyboardEvent<HTMLUListElement>,
  bikes: BikeSpec[],
  selectedSlug: string | null,
  onSelect: (slug: string) => void,
) {
  const currentIndex = bikes.findIndex((b) => b.slug === selectedSlug)
  let nextIndex: number | null = null

  switch (e.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      e.preventDefault()
      nextIndex = currentIndex < bikes.length - 1 ? currentIndex + 1 : 0
      break
    case 'ArrowUp':
    case 'ArrowLeft':
      e.preventDefault()
      nextIndex = currentIndex > 0 ? currentIndex - 1 : bikes.length - 1
      break
    case 'Home':
      e.preventDefault()
      nextIndex = 0
      break
    case 'End':
      e.preventDefault()
      nextIndex = bikes.length - 1
      break
  }

  if (nextIndex !== null) {
    const next = bikes[nextIndex]
    onSelect(next.slug)
    document.getElementById(`model-card-${next.slug}`)?.focus()
  }
}

// ─── ModelCards ───────────────────────────────────────────────────────────────

export function ModelCards({
  platformId,
  bikes,
  selectedSlug,
  onSelect,
}: ModelCardsProps) {
  // Animate in from below whenever the platform changes
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Reset to invisible on platform change, then animate in on next frame
    setVisible(false)
    const raf = requestAnimationFrame(() => {
      // One extra frame so the browser has committed the reset
      requestAnimationFrame(() => setVisible(true))
    })
    return () => cancelAnimationFrame(raf)
  }, [platformId])

  if (bikes.length === 0) {
    return (
      <p
        className="text-[14px] text-[var(--text-secondary)] py-4"
        style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
      >
        No models available for this platform.
      </p>
    )
  }

  const countLabel =
    bikes.length === 1 ? '1 model available' : `${bikes.length} models available`

  return (
    <div
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 300ms ease, transform 300ms ease',
      }}
    >
      {/* Count label */}
      <p
        className="mb-3 text-[12px] uppercase tracking-widest text-[var(--text-secondary)]"
        style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
        aria-live="polite"
      >
        {countLabel}
      </p>

      <ul
        role="radiogroup"
        aria-label="Select motorcycle model"
        className="flex flex-col gap-2 list-none"
        onKeyDown={(e) => handleRadioKeyDown(e, bikes, selectedSlug, onSelect)}
      >
        {bikes.map((bike) => {
          const isSelected = selectedSlug === bike.slug
          const yearsLabel  = bike.year_range ?? null
          const displacement = bike.engine?.displacement_cc
            ? `${bike.engine.displacement_cc}cc`
            : null

          return (
            <li key={bike.slug} role="presentation">
              <div
                id={`model-card-${bike.slug}`}
                role="radio"
                aria-checked={isSelected}
                tabIndex={
                  isSelected ||
                  (selectedSlug === null && bike === bikes[0])
                    ? 0
                    : -1
                }
                onClick={() => onSelect(bike.slug)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    onSelect(bike.slug)
                  }
                }}
                className={cn(
                  // Layout
                  'flex items-center justify-between gap-4',
                  'min-h-[80px] px-4 py-3',
                  // Surface
                  'rounded-[8px]',
                  'bg-[var(--bg-surface)]',
                  'border border-[var(--border)]',
                  // Interaction
                  'cursor-pointer select-none',
                  'transition-all duration-150',
                  'active:brightness-95',
                  // Selected
                  isSelected && [
                    'border-[var(--re-gold)]',
                    'shadow-[inset_3px_0_0_var(--re-gold)]',
                  ],
                  // Unselected hover
                  !isSelected && [
                    'hover:border-[var(--re-gold-muted)]',
                    'hover:shadow-[inset_3px_0_0_var(--re-gold-muted)]',
                  ],
                  // Focus ring
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-[var(--re-gold)] focus-visible:ring-offset-2',
                  'focus-visible:ring-offset-[var(--bg)]',
                )}
              >
                {/* Left: name + displacement */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span
                    className="text-[18px] font-bold leading-tight text-[var(--text-primary)] truncate"
                    style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                  >
                    {bike.name}
                  </span>

                  {displacement && (
                    <span
                      className="text-[13px] text-[var(--text-secondary)] leading-none"
                      style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
                    >
                      {displacement}
                    </span>
                  )}
                </div>

                {/* Right: year range chip */}
                {yearsLabel && (
                  <span
                    className={cn(
                      'flex-shrink-0 text-[12px] px-2.5 py-1 rounded-full',
                      'border border-[var(--border)]',
                      'text-[var(--text-secondary)]',
                      isSelected
                        ? 'border-[var(--re-gold-muted)] text-[var(--re-gold)]'
                        : '',
                    )}
                    style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
                  >
                    {yearsLabel}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
