'use client'

import { cn } from '@/lib/utils'

interface StatBarProps {
  bikeName: string
  odometerKm: number
  unit: 'km' | 'mi'
  onChangeBike: () => void
  className?: string
}

// Inline wrench icon — no external dependency required
function WrenchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

// Inline pencil / edit icon
function EditIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

/**
 * StatBar — the persistent identity strip at the top of Garage View.
 *
 * A single <button> so the entire 44px strip is one keyboard/pointer target.
 * Screen readers hear "Change bike or odometer: currently [bike], [odo] [unit]".
 * The "Not your bike?" tooltip emerges on hover only, via CSS — it does not
 * clutter the visual chrome at rest.
 */
export function StatBar({
  bikeName,
  odometerKm,
  unit,
  onChangeBike,
  className,
}: StatBarProps) {
  const displayOdo =
    unit === 'mi'
      ? Math.round(odometerKm / 1.60934).toLocaleString()
      : Math.round(odometerKm).toLocaleString()

  return (
    <button
      type="button"
      onClick={onChangeBike}
      aria-label={`Change bike or odometer: currently ${bikeName}, ${displayOdo} ${unit}`}
      className={cn(
        // Layout
        'group w-full flex items-center justify-between gap-3 px-4',
        // Height — 44px is the minimum WCAG 2.5.5 touch target
        'min-h-[44px]',
        // Surface
        'bg-[var(--bg-surface)] border-b border-[var(--border)]',
        // Reset button defaults
        'text-left cursor-pointer',
        // Subtle press feedback
        'active:brightness-95 transition-[filter] duration-75',
        // Focus ring
        'focus-visible:outline-2 focus-visible:outline-[var(--re-gold)] focus-visible:outline-offset-[-2px]',
        className
      )}
    >
      {/* Left — wrench mark */}
      <span
        className="flex-shrink-0 text-[var(--re-gold-muted)] group-hover:text-[var(--re-gold)] transition-colors duration-200"
        aria-hidden="true"
      >
        <WrenchIcon />
      </span>

      {/* Center — identity */}
      <span className="flex-1 flex items-center justify-center gap-2 min-w-0">
        {/* Bike name */}
        <span
          className="font-display text-[13px] text-[var(--text-primary)] truncate"
          style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
        >
          {bikeName}
        </span>

        {/* Vertical rule separator */}
        <span className="stat-divider flex-shrink-0" aria-hidden="true" />

        {/* Odometer — monospaced so digits don't jitter */}
        <span
          className="font-mono text-[14px] font-semibold text-[var(--text-secondary)] tabular-nums flex-shrink-0"
          style={{ fontFamily: 'var(--font-mono), monospace' }}
        >
          {displayOdo}&nbsp;{unit}
        </span>

        {/* "Not your bike?" — appears on hover only, never reads to screen readers */}
        <span
          className={cn(
            'hidden md:inline-block',
            'text-[11px] text-[var(--text-muted)]',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            'pointer-events-none select-none',
          )}
          aria-hidden="true"
        >
          Not your bike?
        </span>
      </span>

      {/* Right — edit affordance */}
      <span
        className="flex-shrink-0 text-[var(--text-muted)] group-hover:text-[var(--re-gold)] transition-colors duration-200"
        aria-hidden="true"
      >
        <EditIcon />
      </span>
    </button>
  )
}
