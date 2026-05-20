'use client'

import { useRef } from 'react'
import { GaugeSVG } from './GaugeSVG'
import { cn } from '@/lib/utils'
import type { BucketDue } from '@/lib/types'

/** Gauge sweep window. Recurring buckets use their intervalKm; one-shots get
 *  a short "soon" window so the gauge still looks meaningful. */
function gaugeWindowKm(bucket: BucketDue): number {
  return bucket.one_shot ? 1000 : bucket.intervalKm
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface GaugeDashboardProps {
  /** Sorted array of bucket projections — most urgent first */
  services: BucketDue[]
  /** Called when a gauge is tapped — consumer scrolls to the matching task card */
  onServiceFocus?: (index: number) => void
  /** Optional ISO date string; rendered as a "last verified" notice */
  lastVerified?: string
  className?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format an ISO date string as a readable date.
 *  Returns undefined if the string is falsy or unparseable. */
function formatVerifiedDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return undefined
  }
}

// ─── Empty / all-good state ────────────────────────────────────────────────────

function AllGoodGauge() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-[200px] md:w-[240px]">
        <GaugeSVG
          kmRemaining={1}
          intervalKm={1}
          label="All Services"
          urgency="good"
          size="primary"
        />
      </div>
      <p
        className="text-center font-mono text-xs tracking-widest uppercase"
        style={{ color: 'var(--urgency-good)' }}
      >
        No service due
      </p>
    </div>
  )
}

// ─── GaugeDashboard ───────────────────────────────────────────────────────────

export function GaugeDashboard({
  services,
  onServiceFocus,
  lastVerified,
  className,
}: GaugeDashboardProps) {
  const panelRef  = useRef<HTMLDivElement>(null)

  const primary    = services[0]
  const satellites = services.slice(1, 4)   // up to 3 supporting gauges
  const isEmpty    = services.length === 0
  const verifiedOn = formatVerifiedDate(lastVerified)

  return (
    <section
      ref={panelRef}
      aria-label="Service status instrument cluster"
      className={cn(
        'relative w-full',
        'gauge-panel',
        'border-t-[3px] border-t-[var(--re-red)]',
        'border-x border-x-[rgba(200,150,44,0.18)]',
        'border-b border-b-[rgba(200,150,44,0.28)]',
        'rounded-sm',
        'shadow-[0_6px_32px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(0,0,0,0.4)]',
        className,
      )}
    >
      {/* ── Panel header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-0 md:px-6 lg:px-8 lg:pt-6">
        <span
          className="text-[10px] md:text-[11px] lg:text-[13px] font-mono tracking-[0.28em] uppercase font-semibold"
          style={{ color: 'var(--re-gold)' }}
          aria-hidden="true"
        >
          Service Status
        </span>

        {/* Urgency legend — contextual, only when services exist */}
        {!isEmpty && (
          <div
            className="hidden sm:flex items-center gap-3"
            aria-hidden="true"
          >
            {(
              [
                { label: 'Good',    color: 'var(--urgency-good)' },
                { label: 'Soon',    color: 'var(--urgency-soon)' },
                { label: 'Overdue', color: 'var(--urgency-over)' },
              ] as const
            ).map(({ label, color }) => (
              <span
                key={label}
                className="flex items-center gap-1 text-[9px] font-mono tracking-wider uppercase"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Gauge layout ──────────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex flex-col items-center gap-4 px-4 py-4 md:py-6 md:px-6 lg:px-8 lg:py-8',
          !isEmpty && satellites.length > 0 && 'md:flex-row md:items-center md:justify-center',
        )}
      >
        {isEmpty ? (
          <AllGoodGauge />
        ) : (
          <>
            {/* Primary gauge — hero, most urgent service */}
            <div
              className={cn(
                'flex-shrink-0',
                // Mobile: full-width up to 280px, centred
                'w-full max-w-[280px]',
                // Desktop: fixed at 320px when satellites are alongside; larger at xl+
                satellites.length > 0 && 'md:w-[320px] md:max-w-none xl:w-[380px]',
              )}
              aria-label={`Primary gauge: ${primary.label}`}
            >
              <GaugeSVG
                kmRemaining={primary.kmRemaining}
                intervalKm={gaugeWindowKm(primary)}
                label={primary.label}
                urgency={primary.urgency}
                size="primary"
                onClick={onServiceFocus ? () => onServiceFocus(0) : undefined}
              />
            </div>

            {/* Satellite gauges — up to 3, in a row */}
            {satellites.length > 0 && (
              <>
                {/* Divider: vertical on desktop, horizontal on mobile */}
                <div
                  className={cn(
                    'self-stretch',
                    'hidden md:block',
                    'w-px bg-[var(--re-gunmetal)] opacity-30 mx-2',
                  )}
                  aria-hidden="true"
                />

                <div
                  className={cn(
                    'flex flex-row items-center justify-center gap-4',
                    // On desktop the satellites stack beside the primary
                    'md:flex-col md:gap-3',
                  )}
                  aria-label="Supporting service gauges"
                >
                  {satellites.map((svc, i) => {
                    const globalIndex = i + 1
                    return (
                      <div
                        key={`${svc.label}-${svc.intervalKm}`}
                        className={cn(
                          'flex flex-col items-center gap-1',
                          'transition-opacity duration-200',
                          'opacity-90 hover:opacity-100 focus-within:opacity-100',
                        )}
                      >
                        <div
                          className="w-[80px] md:w-[100px] xl:w-[130px]"
                          aria-label={`Satellite gauge: ${svc.label}`}
                        >
                          <GaugeSVG
                            kmRemaining={svc.kmRemaining}
                            intervalKm={gaugeWindowKm(svc)}
                            label={svc.label}
                            urgency={svc.urgency}
                            size="satellite"
                            onClick={
                              onServiceFocus
                                ? () => onServiceFocus(globalIndex)
                                : undefined
                            }
                          />
                        </div>

                        <span
                          className={cn(
                            'text-center leading-tight',
                            'text-[9px] md:text-[10px] xl:text-[12px]',
                            'font-display tracking-wide uppercase',
                            'max-w-[80px] md:max-w-[100px] xl:max-w-[130px]',
                            'line-clamp-2',
                          )}
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {svc.label}
                        </span>

                        {/* Urgency pip */}
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          aria-hidden="true"
                          style={{
                            backgroundColor: `var(--urgency-${svc.urgency === 'overdue' ? 'over' : svc.urgency})`,
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Footer: last verified notice — stamped ──────────────────────── */}
      {verifiedOn && (
        <div
          className="flex justify-center pb-4 px-4"
          aria-label={`Data verified ${verifiedOn}`}
        >
          <span className="stamp stamp-muted">
            DATA VERIFIED · {verifiedOn.toUpperCase()}
          </span>
        </div>
      )}

      {/* ── Decorative gold rule at the very bottom of the panel ──────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 10%, var(--re-gold) 50%, transparent 90%)', opacity: 0.6 }}
        aria-hidden="true"
      />
    </section>
  )
}
