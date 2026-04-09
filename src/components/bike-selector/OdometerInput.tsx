'use client'

import { useState, useId } from 'react'
import type { OdometerUnit } from '@/lib/types'
import { cn } from '@/lib/utils'

interface OdometerInputProps {
  value: number
  unit: OdometerUnit
  onChange: (value: number) => void
  onUnitToggle: () => void
  onSubmit: () => void
  isValid: boolean
}

// ─── Formatting helpers ────────────────────────────────────────────────────────

/** Strip all non-digit characters before storing the raw number. */
function stripFormatting(str: string): string {
  return str.replace(/[^\d]/g, '')
}

/** Format a numeric string with comma separators: "9800" → "9,800". */
function formatWithCommas(str: string): string {
  if (!str) return ''
  return Number(str).toLocaleString('en-US')
}

// ─── OdometerInput ────────────────────────────────────────────────────────────

export function OdometerInput({
  value,
  unit,
  onChange,
  onUnitToggle,
  onSubmit,
  isValid,
}: OdometerInputProps) {
  // Internal display state — formatted string with commas.
  // Initialised from the numeric prop when it's non-zero.
  const [displayValue, setDisplayValue] = useState<string>(
    value > 0 ? formatWithCommas(String(value)) : '',
  )
  const [touched, setTouched]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // Stable IDs for accessibility wiring
  const inputId   = useId()
  const labelId   = useId()
  const errorId   = useId()
  const hintId    = useId()

  const labelText =
    unit === 'km'
      ? 'How many km on the clock?'
      : 'How many miles on the clock?'

  const placeholderText = unit === 'km' ? 'e.g. 9,800' : 'e.g. 6,000'

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw    = stripFormatting(e.target.value)
    const num    = raw === '' ? 0 : Number(raw)

    // Keep display value formatted, but only if the raw string is valid digits
    if (raw === '' || /^\d+$/.test(raw)) {
      setDisplayValue(raw === '' ? '' : formatWithCommas(raw))
      onChange(num)
      // Clear error on change so it only re-appears on blur
      setError(null)
    }
  }

  function handleBlur() {
    setTouched(true)
    const raw = stripFormatting(displayValue)
    const num = Number(raw)

    if (displayValue !== '' && (isNaN(num) || num <= 0)) {
      setError('Enter a valid odometer reading greater than zero.')
    } else {
      setError(null)
    }
  }

  function handleSubmit() {
    if (!isValid || value <= 0) {
      setTouched(true)
      setError('Enter a valid odometer reading greater than zero.')
      return
    }
    onSubmit()
  }

  // Also handle Enter key in the input field
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const showError   = touched && !!error
  const hasValue    = displayValue.trim().length > 0 && value > 0

  return (
    <div className="flex flex-col gap-4">
      {/* Label */}
      <label
        id={labelId}
        htmlFor={inputId}
        className="text-[var(--text-primary)] leading-tight"
        style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: '20px',
        }}
      >
        {labelText}
      </label>

      {/* Input row — text field + unit toggle */}
      <div
        className={cn(
          'flex items-stretch gap-2',
          'rounded-[8px] border transition-colors duration-150',
          showError
            ? 'border-[var(--re-red)]'
            : 'border-[var(--border)] focus-within:border-[var(--re-gold)]',
        )}
        // Surface mirrors card background so focus glow reads clearly
        style={{ background: 'var(--bg-surface)' }}
      >
        {/* Odometer text input */}
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={displayValue}
          placeholder={placeholderText}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-labelledby={labelId}
          aria-describedby={
            [showError ? errorId : null, hintId]
              .filter(Boolean)
              .join(' ') || undefined
          }
          aria-invalid={showError ? 'true' : 'false'}
          className={cn(
            'flex-1 bg-transparent outline-none',
            'px-4 py-3 min-h-[56px]',
            'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            // Tabular nums so digits don't jitter as commas appear
            'tabular-nums',
          )}
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '28px',
          }}
        />

        {/* Unit toggle pills */}
        <div
          className="flex items-center gap-1 px-3 flex-shrink-0"
          role="group"
          aria-label="Odometer unit"
        >
          {(['km', 'mi'] as OdometerUnit[]).map((u) => {
            const isActive = unit === u
            return (
              <button
                key={u}
                type="button"
                onClick={onUnitToggle}
                aria-pressed={isActive}
                aria-label={`Switch to ${u === 'km' ? 'kilometres' : 'miles'}`}
                className={cn(
                  // Touch target: 44px min height, ensured by py-2 + min-h
                  'min-h-[44px] min-w-[44px]',
                  'px-3 py-2 rounded-[6px]',
                  'text-[14px] font-bold uppercase tracking-wider',
                  'transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-[var(--re-gold)] focus-visible:ring-offset-2',
                  'focus-visible:ring-offset-[var(--bg-surface)]',
                  isActive
                    ? [
                        'bg-[var(--re-red)] text-white',
                        'shadow-sm',
                      ]
                    : [
                        'bg-[var(--bg)] text-[var(--text-secondary)]',
                        'hover:text-[var(--text-primary)]',
                      ],
                )}
                style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
              >
                {u}
              </button>
            )
          })}
        </div>
      </div>

      {/* Error message — appears on blur, removed on change */}
      <div
        id={errorId}
        role="alert"
        aria-live="polite"
        className={cn(
          'text-[13px] text-[var(--re-red)] leading-snug',
          'transition-all duration-150',
          showError ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
      >
        {error ?? '\u00A0' /* non-breaking space preserves layout height */}
      </div>

      {/* Hint text */}
      <p
        id={hintId}
        className="text-[13px] text-[var(--text-muted)] leading-snug -mt-2"
        style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}
      >
        Check your trip meter or last service record.
      </p>

      {/* CTA button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!hasValue || !isValid}
        aria-disabled={!hasValue || !isValid}
        className={cn(
          // Size — 56px height, full width
          'w-full min-h-[56px] px-6',
          'rounded-[8px]',
          // Typography
          'text-[18px] font-bold text-white',
          // Transition
          'transition-all duration-150',
          // Enabled state
          hasValue && isValid
            ? [
                'bg-[var(--re-red)]',
                'hover:bg-[var(--re-red-deep)]',
                'active:brightness-90 cursor-pointer',
              ]
            : [
                'bg-[var(--text-muted)] opacity-50',
                'cursor-not-allowed',
              ],
          // Focus ring
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--re-gold)] focus-visible:ring-offset-2',
          'focus-visible:ring-offset-[var(--bg)]',
        )}
        style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
      >
        Open Garage
      </button>
    </div>
  )
}
