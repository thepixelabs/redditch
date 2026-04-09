'use client'

import { useRef } from 'react'
import { GaugeSVG } from './GaugeSVG'
import { cn } from '@/lib/utils'
import type { ServiceDue } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GaugeDashboardProps {
  /** Sorted array from calculateServiceDue() — most urgent first */
  services: ServiceDue[]
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
        'bg-[var(--bg-surface)]',
        'border-b border-[var(--re-gold-muted)]',
        // Subtle inner shadow to give the panel a recessed, machined feel
        'shadow-[inset_0_-1px_0_rgba(200,150,44,0.12)]',
        className,
      )}
    >
      {/* ── Panel header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-0 md:px-6">
        <span
          className="text-[10px] font-mono tracking-[0.2em] uppercase font-medium"
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
                  style={{ backgroundColor: color }}
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
          'flex flex-col items-center gap-4 px-4 py-4 md:py-6 md:px-6',
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
                // Desktop: fixed at 320px when satellites are alongside
                satellites.length > 0 && 'md:w-[320px] md:max-w-none',
              )}
              aria-label={`Primary gauge: ${primary.label}`}
            >
              <GaugeSVG
                kmRemaining={primary.kmRemaining}
                intervalKm={primary.intervalKm}
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
                    const globalIndex = i + 1  // offset into the services array
                    return (
                      <div
                        key={`${svc.label}-${svc.intervalKm}`}
                        className={cn(
                          'flex flex-col items-center gap-1',
                          'transition-opacity duration-200',
                          // Slightly fade secondary gauges to reinforce hierarchy
                          'opacity-90 hover:opacity-100 focus-within:opacity-100',
                        )}
                      >
                        {/* Satellite gauge itself */}
                        <div
                          className="w-[80px] md:w-[100px]"
                          aria-label={`Satellite gauge: ${svc.label}`}
                        >
                          <GaugeSVG
                            kmRemaining={svc.kmRemaining}
                            intervalKm={svc.intervalKm}
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

                        {/* Label below satellite */}
                        <span
                          className={cn(
                            'text-center leading-tight',
                            'text-[9px] md:text-[10px]',
                            'font-display tracking-wide uppercase',
                            'max-w-[80px] md:max-w-[100px]',
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

      {/* ── Footer: last verified notice ──────────────────────────────────── */}
      {verifiedOn && (
        <p
          className={cn(
            'text-center pb-3 px-4',
            'text-[9px] font-mono tracking-wider',
            'opacity-60',
          )}
          style={{ color: 'var(--text-secondary)' }}
        >
          Data verified {verifiedOn}
        </p>
      )}

      {/* ── Decorative gold rule at the very bottom of the panel ──────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, var(--re-gold), transparent)' }}
        aria-hidden="true"
      />
    </section>
  )
}
