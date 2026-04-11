'use client'

import { useState } from 'react'
import type { BikePersonalization } from '@/lib/types'

interface PersonalizationPanelProps {
  bikeName: string
  availableColors: string[]
  availableAccessories: string[]
  personalization: BikePersonalization
  onSetNickname: (name: string | undefined) => void
  onSetColor: (color: string | undefined) => void
  onToggleAccessory: (accessory: string) => void
}

/**
 * PersonalizationPanel — collapsible panel for bike personalization.
 *
 * Lets users set a nickname, pick their color variant, and toggle
 * which official accessories they have installed. All state is
 * managed by the parent via props (persisted in localStorage).
 */
export function PersonalizationPanel({
  bikeName,
  availableColors,
  availableAccessories,
  personalization,
  onSetNickname,
  onSetColor,
  onToggleAccessory,
}: PersonalizationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section
      aria-label="Bike personalization"
      style={{
        marginTop: '24px',
        border: '1px solid var(--border-subtle)',
        borderRadius: '4px',
        background: 'var(--bg-surface)',
        overflow: 'hidden',
      }}
    >
      {/* Header / Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--re-gold)',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          {personalization.nickname || 'My Bike'}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}
        >
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

          {/* Nickname */}
          <div>
            <label
              htmlFor="bike-nickname"
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '8px',
              }}
            >
              Nickname
            </label>
            <input
              id="bike-nickname"
              type="text"
              maxLength={30}
              placeholder={bikeName}
              value={personalization.nickname ?? ''}
              onChange={e => onSetNickname(e.target.value || undefined)}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '10px 12px',
                background: 'var(--bg-primary, #111)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body, sans-serif)',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 150ms ease',
              }}
            />
          </div>

          {/* Color variant */}
          {availableColors.length > 0 && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: '8px',
                }}
              >
                Color variant
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {availableColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onSetColor(personalization.color === color ? undefined : color)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      minHeight: '44px',
                      padding: '10px 12px',
                      background: personalization.color === color ? 'rgba(200, 150, 44, 0.08)' : 'transparent',
                      border: `1px solid ${personalization.color === color ? 'var(--re-gold)' : 'var(--border-subtle)'}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: personalization.color === color ? 'var(--re-gold)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-body, sans-serif)',
                      fontSize: '14px',
                      textAlign: 'left',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: `2px solid ${personalization.color === color ? 'var(--re-gold)' : 'var(--border-subtle)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'border-color 150ms ease',
                      }}
                    >
                      {personalization.color === color && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--re-gold)' }} />
                      )}
                    </span>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Installed accessories */}
          {availableAccessories.length > 0 && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: '8px',
                }}
              >
                Installed accessories
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {availableAccessories.map(accessory => {
                  const isActive = personalization.accessories.includes(accessory)
                  return (
                    <button
                      key={accessory}
                      type="button"
                      onClick={() => onToggleAccessory(accessory)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        minHeight: '44px',
                        padding: '10px 12px',
                        background: isActive ? 'rgba(200, 150, 44, 0.08)' : 'transparent',
                        border: `1px solid ${isActive ? 'var(--re-gold-muted)' : 'var(--border-subtle)'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-body, sans-serif)',
                        fontSize: '14px',
                        textAlign: 'left',
                        transition: 'all 150ms ease',
                      }}
                    >
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '2px',
                          border: `2px solid ${isActive ? 'var(--re-gold)' : 'var(--border-subtle)'}`,
                          background: isActive ? 'var(--re-gold)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 150ms ease',
                        }}
                      >
                        {isActive && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                            <path d="M2 5L4 7L8 3" stroke="var(--re-black)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      {accessory}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
