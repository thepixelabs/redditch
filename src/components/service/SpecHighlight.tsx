interface SpecHighlightProps {
  label: string   // e.g. "DRAIN PLUG TORQUE"
  value: string   // e.g. "25 Nm"
  notes?: string
}

/**
 * SpecHighlight — the unmissable spec box.
 *
 * This is the number the rider reads when the wrench is in their hand.
 * Gold border, large monospaced value. Nothing else competes visually.
 * Server component — no interactivity, no client boundary needed.
 */
export function SpecHighlight({ label, value, notes }: SpecHighlightProps) {
  return (
    <div
      className="inline-flex flex-col gap-1"
      style={{
        border:       '2px solid var(--re-gold)',
        borderRadius: '6px',
        padding:      '12px 16px',
        background:   'var(--bg)',
      }}
    >
      {/* Label: small-caps treatment, gold, letter-spaced */}
      <span
        style={{
          fontFamily:    'var(--font-body), system-ui, sans-serif',
          fontSize:      '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color:         'var(--re-gold)',
          lineHeight:    1,
          userSelect:    'none',
        }}
      >
        {label}
      </span>

      {/* Value: the number that matters */}
      <span
        className="spec-value"
        style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize:   '28px',
          fontWeight: 700,
          color:      'var(--text-primary)',
          lineHeight: 1.1,
          // Prevent ligatures from distorting numeric strings like "25 Nm"
          fontVariantNumeric: 'tabular-nums',
          letterSpacing:      '-0.01em',
        }}
      >
        {value}
      </span>

      {/* Optional clarifying note */}
      {notes && (
        <span
          style={{
            fontFamily:  'var(--font-body), system-ui, sans-serif',
            fontSize:    '12px',
            fontStyle:   'italic',
            color:       'var(--text-muted)',
            lineHeight:  1.4,
            marginTop:   '2px',
          }}
        >
          {notes}
        </span>
      )}
    </div>
  )
}
