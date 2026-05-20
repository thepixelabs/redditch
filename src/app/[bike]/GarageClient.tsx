'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { BikeSpec } from '@/lib/types'
import { miToKm, kmToMi } from '@/lib/utils'
import { useGarage } from '@/hooks/useGarage'
import { useServiceIntervals } from '@/hooks/useServiceIntervals'
import { useServiceLog } from '@/hooks/useServiceLog'
import { GaugeDashboard } from '@/components/gauge/GaugeDashboard'
import { ServiceList } from '@/components/service/ServiceList'
import { StatBar } from '@/components/ui/StatBar'
import { OdometerInput } from '@/components/bike-selector/OdometerInput'
import { BikeNamer } from '@/components/bike-selector/BikeNamer'
import { BikeReferencePanel } from '@/components/garage/BikeReferencePanel'
import { FindRidersLink } from '@/components/garage/FindRidersLink'

interface GarageClientProps {
  bike: BikeSpec
}

export function GarageClient({ bike }: GarageClientProps) {
  const router = useRouter()
  const garage = useGarage()
  const { forBike, logService } = useServiceLog()

  // The active entry for THIS bike page. Fallback: find any entry with this slug.
  const activeEntry =
    garage.activeEntry?.slug === bike.slug
      ? garage.activeEntry
      : garage.entries.find(e => e.slug === bike.slug) ?? null

  // Odometer values from the active entry
  const odometerKm = activeEntry?.odometerKm ?? 0
  const unit = activeEntry?.unit ?? 'km'
  const displayValue = unit === 'km' ? odometerKm : Math.round(kmToMi(odometerKm))

  // Service log keyed by entry.id (falls back to slug for migrated data)
  const logKey = activeEntry?.id ?? bike.slug
  const bikeLog = forBike(logKey)
  const serviceIntervals = useServiceIntervals(bike.tasks, odometerKm, bikeLog)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  // Edit panel state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editOdo, setEditOdo] = useState(0)
  const [editUnit, setEditUnit] = useState(unit)

  const openEdit = useCallback(() => {
    setEditName(activeEntry?.nickname ?? '')
    setEditOdo(activeEntry?.odometerKm ?? 0)
    setEditUnit(activeEntry?.unit ?? 'km')
    setIsEditing(true)
  }, [activeEntry])

  const closeEdit = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!activeEntry) return
    garage.updateEntry(activeEntry.id, {
      nickname: editName.trim(),
      odometerKm: editOdo,
      unit: editUnit,
    })
    setIsEditing(false)
  }, [activeEntry, editName, editOdo, editUnit, garage])

  const editDisplayValue = editUnit === 'km' ? editOdo : Math.round(kmToMi(editOdo))
  const setEditDisplayValue = useCallback((v: number) => {
    setEditOdo(editUnit === 'km' ? v : miToKm(v))
  }, [editUnit])
  const toggleEditUnit = useCallback(() => {
    setEditUnit(u => u === 'km' ? 'mi' : 'km')
  }, [])

  const handleRemoveBike = useCallback(() => {
    if (!activeEntry || garage.entries.length <= 1) return
    const remaining = garage.entries.filter(e => e.id !== activeEntry.id)
    garage.removeEntry(activeEntry.id)
    router.push(`/${remaining[0].slug}`)
  }, [activeEntry, garage, router])

  const handleGaugeFocus = useCallback((index: number) => {
    setFocusedIndex(index)
  }, [])

  const handleMarkTaskDone = useCallback(
    (taskId: string, atKm: number) => {
      logService(logKey, taskId, atKm)
    },
    [logService, logKey],
  )

  const handleMarkBucketDone = useCallback(
    (taskIds: string[], atKm: number) => {
      for (const id of taskIds) logService(logKey, id, atKm)
    },
    [logService, logKey],
  )

  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `Royal Enfield ${bike.name} Service Schedule`,
    description: `Complete maintenance schedule for the ${bike.name}`,
    step: bike.tasks.map((task) => {
      const cadence = task.every_km
        ? `every ${task.every_km.toLocaleString()} km`
        : task.one_shot_at_km != null
        ? `at ${task.one_shot_at_km.toLocaleString()} km`
        : ''
      return {
        '@type': 'HowToStep',
        name: cadence ? `${task.name} — ${cadence}` : task.name,
        text: task.notes ?? `${task.action ?? 'Service'}: ${task.name}`,
      }
    }),
  }), [bike.name, bike.tasks])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Stat bar — always visible */}
      <StatBar
        bikeName={bike.name}
        nickname={activeEntry?.nickname || undefined}
        odometerKm={odometerKm}
        unit={unit}
        onChangeBike={openEdit}
      />

      {/* ── Edit panel ────────────────────────────────────────────────────── */}
      {isEditing && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px 80px' }}>
          <div style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Rename section */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                Bike name
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5, fontFamily: 'var(--font-body, sans-serif)' }}>
                {bike.name}
              </p>
              <BikeNamer
                value={editName}
                onChange={setEditName}
                compact
              />
            </div>

            {/* Odometer section */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
                Odometer
              </h2>
              <OdometerInput
                value={editDisplayValue}
                unit={editUnit}
                onChange={setEditDisplayValue}
                onUnitToggle={toggleEditUnit}
                onSubmit={handleSaveEdit}
                isValid={editOdo > 0}
              />
            </div>

            {/* My Bikes — fleet switcher */}
            {garage.entries.length > 1 && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>
                  My Bikes
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {garage.entries.map(entry => {
                    const isActive = entry.id === activeEntry?.id
                    const displayOdo = entry.unit === 'mi'
                      ? `${Math.round(entry.odometerKm / 1.60934).toLocaleString()} mi`
                      : `${Math.round(entry.odometerKm).toLocaleString()} km`
                    return (
                      <div
                        key={entry.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: `1px solid ${isActive ? 'var(--re-gold)' : 'var(--border)'}`,
                          background: isActive ? 'rgba(200,150,44,0.06)' : 'var(--bg-surface)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (!isActive) {
                              garage.setActive(entry.id)
                              router.push(`/${entry.slug}`)
                            }
                          }}
                          style={{
                            flex: 1, background: 'none', border: 'none', cursor: isActive ? 'default' : 'pointer',
                            textAlign: 'left', padding: 0,
                          }}
                        >
                          <div style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: '15px', color: 'var(--text-primary)' }}>
                            {entry.nickname || entry.slug}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono), monospace', marginTop: '2px' }}>
                            {displayOdo}
                          </div>
                        </button>
                        {isActive && (
                          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--re-gold)' }}>
                            Active
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={editOdo <= 0}
                style={{
                  width: '100%', minHeight: '56px', padding: '0 24px',
                  borderRadius: '8px', border: 'none', cursor: editOdo > 0 ? 'pointer' : 'not-allowed',
                  background: editOdo > 0 ? 'var(--re-red)' : 'var(--text-muted)',
                  opacity: editOdo > 0 ? 1 : 0.5,
                  color: 'white', fontSize: '18px', fontWeight: 700,
                  fontFamily: 'var(--font-display), Georgia, serif',
                  transition: 'background 150ms',
                }}
              >
                Save
              </button>

              <button
                type="button"
                onClick={closeEdit}
                style={{
                  width: '100%', minHeight: '44px', background: 'none',
                  border: '1px solid var(--border)', borderRadius: '8px',
                  cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body, sans-serif)',
                }}
              >
                Cancel
              </button>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  style={{
                    flex: 1, minHeight: '40px', background: 'none',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-body, sans-serif)',
                  }}
                >
                  + Add another bike
                </button>

                {garage.entries.length > 1 && (
                  <button
                    type="button"
                    onClick={handleRemoveBike}
                    style={{
                      flex: 1, minHeight: '40px', background: 'none',
                      border: '1px solid rgba(200,60,40,0.4)', borderRadius: '8px',
                      cursor: 'pointer', fontSize: '13px', color: 'var(--re-red)',
                      fontFamily: 'var(--font-body, sans-serif)',
                    }}
                  >
                    Remove this bike
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Garage view ───────────────────────────────────────────────────── */}
      {!isEditing && (odometerKm === 0 ? (
        <div className="garage-wall" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px 80px', position: 'relative', minHeight: 'calc(100vh - 120px)' }}>
          <div className="spotlight" aria-hidden="true" />
          <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Enter your odometer
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.5 }}>
              Tell us your current mileage and we&apos;ll show exactly what&apos;s due.
            </p>
            <OdometerInput
              value={displayValue}
              unit={unit}
              onChange={(v) => {
                if (activeEntry) {
                  const km = unit === 'km' ? v : miToKm(v)
                  garage.updateEntry(activeEntry.id, { odometerKm: km })
                }
              }}
              onUnitToggle={() => {
                if (activeEntry) garage.updateEntry(activeEntry.id, { unit: unit === 'km' ? 'mi' : 'km' })
              }}
              onSubmit={() => {}}
              isValid={odometerKm > 0}
            />
          </div>
        </div>
      ) : (
        <div className="garage-wall" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <div className="garage-content">
            <div className="garage-grid">
              <div className="garage-gauge-col">
                <section aria-label="Service status overview">
                  <GaugeDashboard
                    services={serviceIntervals}
                    onServiceFocus={handleGaugeFocus}
                    lastVerified={bike.meta?.last_verified}
                  />
                </section>
              </div>
              <section aria-label="Service schedule details">
                <ServiceList
                  buckets={serviceIntervals}
                  focusedIndex={focusedIndex ?? undefined}
                  meta={{ lastVerified: bike.meta?.last_verified }}
                  odometerKm={odometerKm}
                  onMarkBucketDone={handleMarkBucketDone}
                  onMarkTaskDone={handleMarkTaskDone}
                />
              </section>
            </div>
            <FindRidersLink bikeName={bike.name} />
            <BikeReferencePanel bike={bike} />
          </div>
        </div>
      ))}
    </>
  )
}
