'use client'

import { useEffect, useRef } from 'react'
import type { BucketDue } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ServiceCard } from './ServiceCard'

interface ServiceListProps {
  buckets: BucketDue[]
  /** From gauge tap — open this card and scroll to it. */
  focusedIndex?: number
  meta?: { lastVerified?: string }
  odometerKm: number
  onMarkBucketDone: (taskIds: string[], atKm: number) => void
  onMarkTaskDone: (taskId: string, atKm: number) => void
}

export function ServiceList({
  buckets,
  focusedIndex,
  meta,
  odometerKm,
  onMarkBucketDone,
  onMarkTaskDone,
}: ServiceListProps) {
  const cardRefs = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    if (focusedIndex == null) return
    const el = cardRefs.current[focusedIndex]
    if (!el) return
    const timer = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => clearTimeout(timer)
  }, [focusedIndex])

  if (buckets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
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
          Nothing due at this odometer reading.
        </p>
      </div>
    )
  }

  return (
    <section aria-labelledby="service-schedule-heading">
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

      <ul role="list" className="flex flex-col gap-2 list-none">
        {buckets.map((bucket, idx) => {
          const isOverdue = bucket.urgency === 'overdue'
          const isOpen    = focusedIndex === idx
          const key       = `${bucket.label}-${bucket.intervalKm}`

          return (
            <li
              key={key}
              ref={(el) => { cardRefs.current[idx] = el }}
              className={cn(
                isOverdue ? 'rounded-[8px] shadow-[inset_3px_0_0_var(--re-red)]' : '',
              )}
            >
              <ServiceCard
                bucket={bucket}
                defaultOpen={isOpen}
                id={`service-card-${idx}`}
                odometerKm={odometerKm}
                onMarkBucketDone={onMarkBucketDone}
                onMarkTaskDone={onMarkTaskDone}
              />
            </li>
          )
        })}
      </ul>

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
