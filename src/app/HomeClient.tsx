'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NeonSign from '@/components/ui/NeonSign'
import { PlatformGrid } from '@/components/bike-selector/PlatformGrid'
import { ModelCards } from '@/components/bike-selector/ModelCards'
import { OdometerInput } from '@/components/bike-selector/OdometerInput'
import { BikeNamer } from '@/components/bike-selector/BikeNamer'
import { BulletinBoard } from '@/components/bulletin/BulletinBoard'
import { useGarage } from '@/hooks/useGarage'
import { miToKm, kmToMi } from '@/lib/utils'
import type { BikeSpec, BulletinData, OdometerUnit } from '@/lib/types'

type Step = 'platform' | 'model' | 'name' | 'odometer'

interface HomeClientProps {
  bikes: BikeSpec[]
  bulletin: BulletinData
}

const FACTS = [
  { value: '100 Nm',         label: 'Tightest bolt in the fleet',       source: '650 rear axle' },
  { value: '888464',         label: 'One filter fits three',            source: 'All 650 twins' },
  { value: '0.15 mm',        label: 'Same intake clearance on every RE', source: 'Hunter → Super Meteor' },
  { value: '66',             label: 'Torque specs in the dataset',       source: 'Verified 2026-04' },
] as const

export default function HomeClient({ bikes, bulletin }: HomeClientProps) {
  const router = useRouter()
  const garage = useGarage()

  const [step, setStep] = useState<Step>('platform')
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [bikeName, setBikeName] = useState('')

  // Odometer form state (local — saved to garage on submit)
  const [odometerKm, setOdometerKm] = useState(0)
  const [unit, setUnit] = useState<OdometerUnit>('km')
  const displayValue = unit === 'km' ? odometerKm : Math.round(kmToMi(odometerKm))
  const setDisplayValue = (v: number) => setOdometerKm(unit === 'km' ? v : miToKm(v))
  const toggleUnit = () => setUnit(u => u === 'km' ? 'mi' : 'km')

  const [redirecting, setRedirecting] = useState(false)

  // On first session visit, redirect to active garage
  useEffect(() => {
    if (garage.activeEntry) {
      try {
        const sessionActive = sessionStorage.getItem('redditch:session-active')
        if (!sessionActive) {
          sessionStorage.setItem('redditch:session-active', '1')
          setRedirecting(true)
          router.replace(`/${garage.activeEntry.slug}`)
          return
        }
      } catch { /* sessionStorage unavailable */ }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const availableSlugs = bikes.map(b => b.slug)

  function handlePlatformSelect(platformId: string) {
    setSelectedPlatform(platformId)
    setStep('model')
  }

  function handleModelSelect(slug: string) {
    setSelectedSlug(slug)
    setBikeName('')
    setStep('name')
  }

  function handleNameSubmit() {
    setStep('odometer')
  }

  function handleNameSkip() {
    setBikeName('')
    setStep('odometer')
  }

  function handleOdometerSubmit() {
    if (!selectedSlug || odometerKm <= 0) return
    garage.addEntry(selectedSlug, bikeName, odometerKm, unit)
    router.push(`/${selectedSlug}`)
  }

  function handleBack() {
    if (step === 'odometer') { setStep('name') }
    else if (step === 'name') { setStep('model'); setSelectedSlug(null) }
    else if (step === 'model') { setStep('platform'); setSelectedPlatform(null) }
  }

  if (redirecting) return null

  const showFactStrip = step === 'platform'
  const showBulletinPreview = step === 'platform'

  return (
    <>
      <div
        className="garage-wall"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: showFactStrip ? 'auto' : 'calc(100vh - 120px)',
          padding: showFactStrip ? '0 0 24px' : '0 0 80px',
        }}
      >
        {/* Hero background */}
        <div
          aria-hidden="true"
          className="hero-bg-overlay"
          style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}
        >
          <div
            className="hero-bg-img"
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: "url('/images/home-hero.jpg')",
              backgroundSize: 'cover', backgroundPosition: 'center bottom', backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="hero-gradient-dark" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,15,15,0.92) 0%, rgba(15,15,15,0.55) 40%, rgba(15,15,15,0.85) 100%)' }} />
          <div className="hero-gradient-light" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(232,220,196,0.82) 0%, rgba(232,220,196,0.45) 40%, rgba(232,220,196,0.78) 100%)' }} />
        </div>

        <div
          style={{
            position: 'relative', zIndex: 1, width: '100%',
            maxWidth: 'min(720px, calc(100vw - 32px))',
            padding: '0 clamp(16px, 3vw, 40px)',
          }}
        >
          {/* Hero (platform step only) */}
          {step === 'platform' && (
            <header style={{ paddingTop: '48px', paddingBottom: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
              <NeonSign />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <h1 className="wordmark-hero">REDDITCH</h1>
                <p className="tagline">Your Royal Enfield service companion</p>
              </div>
              <div aria-hidden="true" style={{ width: '64px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--re-gold), transparent)', borderRadius: '1px' }} />
            </header>
          )}

          {/* Back button */}
          {step !== 'platform' && (
            <div style={{ paddingTop: '28px', paddingBottom: '8px' }}>
              <button
                onClick={handleBack}
                aria-label="Go back"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)', padding: '8px 0', fontFamily: 'var(--font-body, sans-serif)' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>
            </div>
          )}

          {/* Step: Platform */}
          {step === 'platform' && (
            <>
              {/* Existing garage switcher — shown when bikes are saved */}
              {garage.entries.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono), monospace', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--re-gold)', marginBottom: '12px' }}>
                    My Garage
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {garage.entries.map(entry => {
                      const bike = bikes.find(b => b.slug === entry.slug)
                      const displayOdo = entry.unit === 'mi'
                        ? `${Math.round(entry.odometerKm / 1.60934).toLocaleString()} mi`
                        : `${Math.round(entry.odometerKm).toLocaleString()} km`
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => {
                            garage.setActive(entry.id)
                            router.push(`/${entry.slug}`)
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 16px', borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-surface)',
                            cursor: 'pointer', textAlign: 'left',
                            transition: 'border-color 150ms, background 150ms',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--re-gold)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)' }}
                        >
                          <div>
                            <div style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '2px' }}>
                              {entry.nickname || bike?.name || entry.slug}
                            </div>
                            {entry.nickname && bike && (
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono), monospace' }}>
                                {bike.name}
                              </div>
                            )}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {displayOdo}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0 8px', color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.1em' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                    <span>or add another bike</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                  </div>
                </div>
              )}

              <section aria-label="Select your platform">
                <PlatformGrid
                  onSelect={handlePlatformSelect}
                  selectedPlatform={selectedPlatform}
                  availableSlugs={availableSlugs}
                />
              </section>
            </>
          )}

          {/* Step: Model */}
          {step === 'model' && selectedPlatform && (
            <section aria-label="Select your model" style={{ paddingTop: '8px' }}>
              <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--re-gold)', margin: '0 0 16px' }}>
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

          {/* Step: Name */}
          {step === 'name' && selectedSlug && (
            <section aria-label="Name your bike" style={{ paddingTop: '8px' }}>
              <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--re-gold)', margin: '0 0 16px' }}>
                {bikes.find(b => b.slug === selectedSlug)?.name ?? selectedSlug}
              </h2>
              <BikeNamer
                value={bikeName}
                onChange={setBikeName}
                onSubmit={handleNameSubmit}
                onSkip={handleNameSkip}
                submitLabel="Next — set odometer"
              />
            </section>
          )}

          {/* Step: Odometer */}
          {step === 'odometer' && selectedSlug && (
            <section aria-label="Enter your odometer reading" style={{ paddingTop: '8px' }}>
              {bikeName && (
                <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--re-gold)', margin: '0 0 16px' }}>
                  {bikeName}
                </h2>
              )}
              <OdometerInput
                value={displayValue}
                unit={unit}
                onChange={setDisplayValue}
                onUnitToggle={toggleUnit}
                onSubmit={handleOdometerSubmit}
                isValid={odometerKm > 0}
              />
            </section>
          )}
        </div>

        {/* Fact strip */}
        {showFactStrip && (
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1280px', margin: '48px auto 0', padding: '0 clamp(20px, 3vw, 40px)' }}>
            <div className="section-label-rule"><span>From the dataset</span></div>
            <div className="fact-strip" style={{ border: 'none', paddingTop: 0 }}>
              {FACTS.map((fact) => (
                <div key={fact.label} className="fact">
                  <span className="fact-value">{fact.value}</span>
                  <span className="fact-label">{fact.label}</span>
                  <span className="fact-source">{fact.source}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bulletin preview */}
      {showBulletinPreview && (
        <BulletinBoard data={bulletin} mode="preview" heading="From the Bulletin Board" />
      )}
    </>
  )
}
