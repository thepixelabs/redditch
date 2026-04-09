import { cn } from '@/lib/utils'
import type { UrgencyLevel } from '@/lib/types'

interface BadgeProps {
  urgency: UrgencyLevel
  kmRemaining: number
  className?: string
}

// Icon: check mark for good
function CheckIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// Icon: triangle warning for soon
function WarnIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

// Icon: X for overdue
function OverdueIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

/**
 * Badge — urgency indicator for a service item.
 *
 * Color alone never conveys status — every state also has a distinct icon
 * and label text. This satisfies WCAG 1.4.1 (Use of Color).
 *
 * CSS custom properties are used for color so both light and dark mode
 * tokens from globals.css apply automatically.
 */
export function Badge({ urgency, kmRemaining, className }: BadgeProps) {
  if (urgency === 'good') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-[10px] py-[2px] rounded-full',
          'text-[12px] font-semibold uppercase tracking-wide',
          // Background: urgency-good at 12% opacity using currentColor trick
          'bg-[color-mix(in_srgb,var(--urgency-good)_12%,transparent)]',
          'text-[var(--urgency-good)]',
          className
        )}
      >
        <CheckIcon />
        Good
      </span>
    )
  }

  if (urgency === 'soon') {
    const km = Math.abs(Math.round(kmRemaining)).toLocaleString()
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-[10px] py-[2px] rounded-full',
          'text-[12px] font-semibold uppercase tracking-wide',
          'bg-[color-mix(in_srgb,var(--urgency-soon)_12%,transparent)]',
          'text-[var(--urgency-soon)]',
          className
        )}
      >
        <WarnIcon />
        {km}&nbsp;{/* non-breaking space before unit */}km
      </span>
    )
  }

  // urgency === 'overdue'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-[10px] py-[2px] rounded-full',
        'text-[12px] font-semibold uppercase tracking-wide',
        'bg-[color-mix(in_srgb,var(--urgency-over)_12%,transparent)]',
        'text-[var(--urgency-over)]',
        className
      )}
    >
      <OverdueIcon />
      Overdue
    </span>
  )
}
