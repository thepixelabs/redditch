'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

// ─── Name banks ───────────────────────────────────────────────────────────────

const VIBES = [
  {
    id: 'british',
    label: 'Classic British',
    emoji: '🎩',
    names: ['Byron', 'Churchill', 'Clyde', 'Old Faithful', 'Iron Duke', 'Edmund', 'Hartley', 'Pemberton', 'Winston', 'Stanley', 'Chester', 'The Colonel'],
  },
  {
    id: 'breezy',
    label: 'Cool & Easy',
    emoji: '🌬️',
    names: ['Cool Breeze', 'Easy Rider', 'Night Cruiser', 'Open Road', 'Twilight Run', 'Dusk Rider', 'Lazy Sunday', 'Warm Drift', 'Silver Lining', 'Sunday Solo', 'Gentle Giant', 'Free Roll'],
  },
  {
    id: 'explorer',
    label: 'Explorer',
    emoji: '🏔️',
    names: ['Nomad', 'Ranger', 'Ridgeback', 'Summit', 'Mesa', 'Outpost', 'Boulder', 'Trailhead', 'Pathfinder', 'Far Reach', 'Wanderer', 'Highpass'],
  },
  {
    id: 'poetic',
    label: 'Poetic',
    emoji: '🌙',
    names: ['Solstice', 'Meridian', 'Reverie', 'Equinox', 'Vesper', 'Solace', 'Elegy', 'Aether', 'Penumbra', 'Dusk Light', 'Stillwater', 'Nightfall'],
  },
  {
    id: 'bold',
    label: 'Bold',
    emoji: '⚡',
    names: ['Thunder', 'Blaze', 'Surge', 'Cyclone', 'Tempest', 'Volt', 'Iron Storm', 'War Horse', 'Torque', 'Flash Point', 'Inferno', 'Broadside'],
  },
] as const

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BikeNamerProps {
  value: string
  onChange: (name: string) => void
  /** If provided, shows a primary action button */
  onSubmit?: () => void
  /** If provided, shows a secondary skip button */
  onSkip?: () => void
  submitLabel?: string
  /** Compact mode for the garage edit panel */
  compact?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BikeNamer({
  value,
  onChange,
  onSubmit,
  onSkip,
  submitLabel = 'Continue',
  compact = false,
}: BikeNamerProps) {
  const [showGen, setShowGen] = useState(false)
  const [activeVibe, setActiveVibe] = useState<string | null>(null)
  const [visibleNames, setVisibleNames] = useState<string[]>([])

  const handleVibeSelect = useCallback((vibeId: string) => {
    const vibe = VIBES.find(v => v.id === vibeId)!
    setActiveVibe(vibeId)
    setVisibleNames(shuffle(vibe.names).slice(0, 6))
  }, [])

  const handleShuffle = useCallback(() => {
    if (!activeVibe) return
    const vibe = VIBES.find(v => v.id === activeVibe)!
    setVisibleNames(shuffle(vibe.names).slice(0, 6))
  }, [activeVibe])

  const handlePickName = useCallback((name: string) => {
    onChange(name)
    setShowGen(false)
    setActiveVibe(null)
  }, [onChange])

  const fontSize = compact ? '16px' : '20px'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
      {/* Label */}
      {!compact && (
        <label
          htmlFor="bike-name-input"
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
          }}
        >
          What&apos;s her name?
        </label>
      )}

      {/* Name input row */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'stretch',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            transition: 'border-color 150ms',
          }}
          onFocus={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = 'var(--re-gold)'
          }}
          onBlur={(e) => {
            const el = e.currentTarget as HTMLDivElement
            if (!el.contains(e.relatedTarget as Node)) {
              el.style.borderColor = 'var(--border)'
            }
          }}
        >
          <input
            id="bike-name-input"
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="e.g. Cool Breeze"
            maxLength={40}
            autoComplete="off"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: compact ? '10px 14px' : '14px 16px',
              fontFamily: 'var(--font-display), Georgia, serif',
              fontSize: compact ? '16px' : '22px',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Generator toggle */}
        <button
          type="button"
          onClick={() => {
            setShowGen(s => !s)
            setActiveVibe(null)
          }}
          title="Help me name it"
          style={{
            flexShrink: 0,
            padding: compact ? '8px 12px' : '12px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: showGen ? 'var(--re-gold)' : 'var(--bg-surface)',
            color: showGen ? '#000' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1,
            transition: 'background 150ms, color 150ms',
          }}
          aria-label="Open name generator"
          aria-expanded={showGen}
        >
          ✦
        </button>
      </div>

      {/* Hint */}
      {!compact && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, fontFamily: 'var(--font-body, sans-serif)' }}>
          One or two words. Tap ✦ for inspiration.
        </p>
      )}

      {/* Generator panel */}
      {showGen && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: compact ? '12px' : '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Vibe picker label */}
          <p style={{
            margin: 0,
            fontSize: '10px',
            fontFamily: 'var(--font-mono), monospace',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}>
            Pick a vibe
          </p>

          {/* Vibe pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {VIBES.map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleVibeSelect(v.id)}
                className={cn('transition-all duration-150')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: activeVibe === v.id ? 'var(--re-gold)' : 'var(--border)',
                  background: activeVibe === v.id ? 'rgba(200,150,44,0.12)' : 'transparent',
                  color: activeVibe === v.id ? 'var(--re-gold)' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-body, sans-serif)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {v.emoji} {v.label}
              </button>
            ))}
          </div>

          {/* Name chips */}
          {activeVibe && visibleNames.length > 0 && (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {visibleNames.map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handlePickName(name)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: value === name ? 'var(--re-gold)' : 'var(--bg)',
                      color: value === name ? '#000' : 'var(--text-primary)',
                      fontSize: '14px',
                      fontFamily: 'var(--font-display), Georgia, serif',
                      fontStyle: 'italic',
                      cursor: 'pointer',
                      transition: 'background 120ms, color 120ms, border-color 120ms',
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>

              {/* Shuffle */}
              <button
                type="button"
                onClick={handleShuffle}
                style={{
                  alignSelf: 'flex-start',
                  background: 'none',
                  border: 'none',
                  padding: '4px 0',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono), monospace',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                ↻ More names
              </button>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      {(onSubmit || onSkip) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              className={cn(
                'w-full min-h-[56px] px-6 rounded-[8px]',
                'text-[18px] font-bold text-white transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--re-gold)] focus-visible:ring-offset-2',
                value.trim()
                  ? 'bg-[var(--re-red)] hover:bg-[var(--re-red-deep)] cursor-pointer active:brightness-90'
                  : 'bg-[var(--text-muted)] opacity-50 cursor-not-allowed',
              )}
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              {submitLabel}
            </button>
          )}
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              style={{
                width: '100%',
                minHeight: '44px',
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body, sans-serif)',
              }}
            >
              Skip — no name
            </button>
          )}
        </div>
      )}
    </div>
  )
}
