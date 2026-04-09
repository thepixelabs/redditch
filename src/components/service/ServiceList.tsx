'use client'

import { useEffect, useRef } from 'react'
import type { ServiceDue } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ServiceCard } from './ServiceCard'

interface ServiceListProps {
  services: ServiceDue[]
  focusedIndex?: number    // from gauge tap — open this card and scroll to it
  meta?: { lastVerified?: string }
}

// ─── ServiceList ──────────────────────────────────────────────────────────────

export function ServiceList({ services, focusedIndex, meta }: ServiceListProps) {
  const cardRefs = useRef<(HTMLLIElement | null)[]>([])

  // When the gauge fires a tap, scroll the target card into view.
  useEffect(() => {
    if (focusedIndex == null) return
    const el = cardRefs.current[focusedIndex]
    if (!el) return

    // Small delay so the card has time to open before we scroll
    const timer = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)

    return () => clearTimeout(timer)
  }, [focusedIndex])

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        {/* Checkmark circle */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="24" cy="24" r="23" stroke="var(--urgency-good)" strokeWidth="2" />
          <polyline
            points="14 24 21 31 34 17"
            stroke="var(--urgency-good)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <p
          className="text-[16px] font-bold text-[var(--text-primary)]"
          style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
        >
          All services up to date.
        </p>
        <p
          className="text-[14px] text-[var(--text-secondary)]"
          style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
        >
          No services due at this odometer reading.
        </p>
      </div>
    )
  }

  return (
    <section aria-labelledby="service-schedule-heading">
      {/* Section label */}
      <p
        id="service-schedule-heading"
        className={cn(
          'mb-4 text-[11px] md:text-[13px] uppercase tracking-[0.18em]',
          'text-[var(--text-muted)]',
          'font-semibold',
        )}
        style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
        aria-label="Service schedule"
      >
        Service Schedule
      </p>

      {/* Card list */}
      <ul role="list" className="flex flex-col gap-2 list-none">
        {services.map((service, idx) => {
          const isOverdue = service.urgency === 'overdue'
          const isOpen    = focusedIndex === idx

          return (
            <li
              key={`${service.label}-${service.intervalKm}`}
              ref={(el) => { cardRefs.current[idx] = el }}
              className={cn(
                // Overdue items get a subtle red left-bar accent on the li wrapper
                isOverdue
                  ? 'rounded-[8px] shadow-[inset_3px_0_0_var(--re-red)]'
                  : '',
              )}
            >
              <ServiceCard
                service={service}
                defaultOpen={isOpen}
                id={`service-card-${idx}`}
              />
            </li>
          )
        })}
      </ul>

      {/* Data provenance footer */}
      {meta?.lastVerified && (
        <p
          className="mt-6 text-[11px] text-[var(--text-muted)] text-right"
          style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
        >
          Data last verified: {meta.lastVerified}
        </p>
      )}
    </section>
  )
}
