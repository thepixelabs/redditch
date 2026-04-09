'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { BikeSpec } from '@/lib/types'
import { useOdometer } from '@/hooks/useOdometer'
import { useServiceIntervals } from '@/hooks/useServiceIntervals'
import { GaugeDashboard } from '@/components/gauge/GaugeDashboard'
import { ServiceList } from '@/components/service/ServiceList'
import { StatBar } from '@/components/ui/StatBar'
import { OdometerInput } from '@/components/bike-selector/OdometerInput'

interface GarageClientProps {
  bike: BikeSpec
}

export function GarageClient({ bike }: GarageClientProps) {
  const router = useRouter()
  const { odometerKm, displayValue, unit, setDisplayValue, toggleUnit } = useOdometer()
  const serviceIntervals = useServiceIntervals(bike.service_schedule, odometerKm)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const handleGaugeFocus = useCallback((index: number) => {
    setFocusedIndex(index)
  }, [])

  const handleChangeBike = useCallback(() => {
    router.push('/')
  }, [router])

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `Royal Enfield ${bike.name} Service Schedule`,
    description: `Complete maintenance schedule for the ${bike.name}`,
    step: bike.service_schedule.flatMap(interval =>
      interval.tasks.map(task => ({
        '@type': 'HowToStep',
        name: `${task.name} — every ${interval.interval_km.toLocaleString()} km`,
        text: task.notes ?? `${task.action ?? 'Service'}: ${task.name}`,
      }))
    ),
  }

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Persistent stat bar */}
      <StatBar
        bikeName={bike.name}
        odometerKm={odometerKm}
        unit={unit}
        onChangeBike={handleChangeBike}
      />

      {odometerKm === 0 ? (
        /* ── No odometer yet: prompt entry ── */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px 80px' }}>
          <div style={{ width: '100%', maxWidth: '480px' }}>
            <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Enter your odometer
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.5 }}>
              Tell us your current mileage and we&apos;ll show exactly what&apos;s due.
            </p>
            <OdometerInput
              value={displayValue}
              unit={unit}
              onChange={setDisplayValue}
              onUnitToggle={toggleUnit}
              onSubmit={() => {}}
              isValid={displayValue > 0}
            />
          </div>
        </div>
      ) : (
        /* ── Garage view ── */
        <div>
          <section aria-label="Service status overview">
            <GaugeDashboard
              services={serviceIntervals}
              onServiceFocus={handleGaugeFocus}
              lastVerified={bike.meta?.last_verified}
            />
          </section>

          <section aria-label="Service schedule details" style={{ paddingBottom: '80px' }}>
            <ServiceList
              services={serviceIntervals}
              focusedIndex={focusedIndex ?? undefined}
              meta={{ lastVerified: bike.meta?.last_verified }}
            />
          </section>
        </div>
      )}
    </>
  )
}
