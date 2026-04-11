/**
 * CardArt — type badge for bulletin card entries.
 *
 * A compact bar showing the entry type with an icon and label,
 * replacing the old full-bleed SVG illustrations. The type is
 * immediately legible — no colour-code guessing required.
 */

import type { BulletinType } from '@/lib/types'

// ─── Type config ────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<BulletinType, { icon: string; label: string }> = {
  event:        { icon: '📅', label: 'Event' },
  technical:    { icon: '🔧', label: 'Technical' },
  announcement: { icon: '📢', label: 'Notice' },
  article:      { icon: '📄', label: 'Article' },
  changelog:    { icon: '📋', label: 'Data Update' },
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

export function CardArt({ type, seed: _seed }: { type: BulletinType; seed: number }) {
  const config = TYPE_CONFIG[type]

  return (
    <div
      className="bulletin-card-type-badge"
      aria-label={config.label}
    >
      <span className="bulletin-card-type-icon" aria-hidden="true">{config.icon}</span>
      <span className="bulletin-card-type-label">{config.label}</span>
    </div>
  )
}
