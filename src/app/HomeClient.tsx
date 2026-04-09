'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlatformGrid } from '@/components/bike-selector/PlatformGrid'
import { ModelCards } from '@/components/bike-selector/ModelCards'
import { OdometerInput } from '@/components/bike-selector/OdometerInput'
import { usePersistedState } from '@/hooks/usePersistedState'
import { useOdometer } from '@/hooks/useOdometer'
import { STORAGE_KEYS } from '@/lib/constants'
import type { BikeSpec } from '@/lib/types'

type Step = 'platform' | 'model' | 'odometer'

interface HomeClientProps {
  bikes: BikeSpec[]
}

export default function HomeClient({ bikes }: HomeClientProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('platform')
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [savedBike, setSavedBike] = usePersistedState<string | null>(STORAGE_KEYS.BIKE, null)
  const { displayValue, unit, setDisplayValue, toggleUnit } = useOdometer()

  // On mount: if a bike is already saved, redirect immediately
  useEffect(() => {
    if (savedBike) {
      router.replace(`/${savedBike}`)
    }
  }, [savedBike, router])

  const availableSlugs = bikes.map(b => b.slug)

  function handlePlatformSelect(platformId: string) {
    setSelectedPlatform(platformId)
    setStep('model')
  }

  function handleModelSelect(slug: string) {
    setSelectedSlug(slug)
    setStep('odometer')
  }

  function handleOdometerSubmit() {
    if (!selectedSlug || displayValue <= 0) return
    setSavedBike(selectedSlug)
    router.push(`/${selectedSlug}`)
  }

  function handleBack() {
    if (step === 'odometer') {
      setStep('model')
      setSelectedSlug(null)
    } else if (step === 'model') {
      setStep('platform')
      setSelectedPlatform(null)
    }
  }

  // While redirecting, render nothing to avoid flicker
  if (savedBike) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 120px)', padding: '0 0 80px' }}>
      <div style={{ width: '100%', maxWidth: '480px', padding: '0 24px' }}>

        {/* ── Greeting ── */}
        {step === 'platform' && (
          <header style={{ paddingTop: '40px', paddingBottom: '32px' }}>
            <h1 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '28px', fontWeight: 700, color: '#C8962C', margin: '0 0 6px', lineHeight: 1.2 }}>
              Welcome to Redditch
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Your Royal Enfield service companion
            </p>
            <div aria-hidden="true" style={{ width: '48px', height: '2px', backgroundColor: '#C8962C', borderRadius: '1px' }} />
          </header>
        )}

        {/* ── Back button ── */}
        {step !== 'platform' && (
          <div style={{ paddingTop: '24px', paddingBottom: '8px' }}>
            <button
              onClick={handleBack}
              aria-label="Go back to previous step"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)', padding: '8px 0', fontFamily: 'var(--font-body, sans-serif)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
          </div>
        )}

        {/* ── Step: Platform ── */}
        {step === 'platform' && (
          <section aria-label="Select your platform">
            <PlatformGrid
              onSelect={handlePlatformSelect}
              selectedPlatform={selectedPlatform}
              availableSlugs={availableSlugs}
            />
          </section>
        )}

        {/* ── Step: Model ── */}
        {step === 'model' && selectedPlatform && (
          <section aria-label="Select your model">
            <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
              Select your model
            </h2>
            <ModelCards
              platformId={selectedPlatform}
              bikes={bikes}
              selectedSlug={selectedSlug}
              onSelect={handleModelSelect}
            />
          </section>
        )}

        {/* ── Step: Odometer ── */}
        {step === 'odometer' && selectedSlug && (
          <section aria-label="Enter your odometer reading">
            <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              What&apos;s your odometer reading?
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.5 }}>
              Enter your current mileage and we&apos;ll calculate exactly what&apos;s due.
            </p>
            <OdometerInput
              value={displayValue}
              unit={unit}
              onChange={setDisplayValue}
              onUnitToggle={toggleUnit}
              onSubmit={handleOdometerSubmit}
              isValid={displayValue > 0}
            />
          </section>
        )}
      </div>
    </div>
  )
}
