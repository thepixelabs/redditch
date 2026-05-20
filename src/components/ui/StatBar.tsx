'use client'

import { cn } from '@/lib/utils'

interface StatBarProps {
  bikeName: string     // model name (e.g. "Interceptor 650")
  nickname?: string    // user's custom name (e.g. "Cool Breeze")
  odometerKm: number
  unit: 'km' | 'mi'
  onChangeBike: () => void
  className?: string
}

// Inline wrench icon — no external dependency required
function WrenchIcon() {
  return (
    <svg
      className="w-[14px] h-[14px] md:w-[18px] md:h-[18px] lg:w-[20px] lg:h-[20px]"
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
      className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] lg:w-[22px] lg:h-[22px]"
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
  nickname,
  odometerKm,
  unit,
  onChangeBike,
  className,
}: StatBarProps) {
  const displayOdo =
    unit === 'mi'
      ? Math.round(odometerKm / 1.60934).toLocaleString()
      : Math.round(odometerKm).toLocaleString()

  const primaryLabel = nickname || bikeName
  const subtitleLabel = nickname ? bikeName : null

  return (
    <button
      type="button"
      onClick={onChangeBike}
      aria-label={`Edit bike or odometer: ${primaryLabel}, ${displayOdo} ${unit}`}
      className={cn(
        // Layout
        'group w-full flex items-center justify-between gap-3 px-4 md:px-6 lg:px-8',
        // Height scales with screen size
        'min-h-[44px] md:min-h-[56px] lg:min-h-[64px]',
        // Surface — instrument panel fascia
        'bg-[var(--bg-surface)]',
        'border-b border-[var(--border)]',
        'shadow-[inset_2px_0_0_rgba(200,150,44,0.35),inset_0_1px_0_rgba(200,150,44,0.1)]',
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
      <span className="flex-1 flex items-center justify-center gap-2 md:gap-3 min-w-0">
        {/* Primary label (nickname if set, else model name) */}
        <span className="flex flex-col items-center min-w-0">
          <span
            className="font-display text-[13px] md:text-[16px] lg:text-[18px] font-semibold text-[var(--text-primary)] truncate"
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            {primaryLabel}
          </span>
          {subtitleLabel && (
            <span
              className="hidden md:block text-[10px] text-[var(--text-muted)] tracking-wide truncate"
              style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.1em' }}
            >
              {subtitleLabel}
            </span>
          )}
        </span>

        {/* Vertical rule separator */}
        <span className="stat-divider flex-shrink-0" aria-hidden="true" />

        {/* Odometer — monospaced so digits don't jitter */}
        <span
          className="font-mono text-[14px] md:text-[16px] lg:text-[18px] font-semibold text-[var(--text-secondary)] tabular-nums flex-shrink-0"
          style={{ fontFamily: 'var(--font-mono), monospace' }}
        >
          {displayOdo}&nbsp;{unit}
        </span>

        {/* Hover hint */}
        <span
          className={cn(
            'hidden md:inline-block',
            'text-[11px] md:text-[13px] text-[var(--text-muted)]',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            'pointer-events-none select-none',
          )}
          aria-hidden="true"
        >
          Edit
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
