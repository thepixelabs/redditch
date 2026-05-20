/**
 * ReferencePanelDivider — wide cinematic strip above the BikeReferencePanel.
 *
 * Photographic overhead engine-bay plate (parallel-twin valve cover with a
 * torque wrench) with a right-side fade so the gold "Quick Reference" stamp
 * sits cleanly over the dark area.
 */

import Image from 'next/image'

export function ReferencePanelDivider() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '21 / 9',
        maxHeight: '320px',
        marginBottom: 'clamp(16px, 2vw, 28px)',
        overflow: 'hidden',
        borderRadius: '3px',
        border: '1px solid rgba(200, 150, 44, 0.18)',
        boxShadow:
          '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(200, 150, 44, 0.05)',
      }}
    >
      <Image
        src="/images/quick-reference-engine.jpg"
        alt=""
        fill
        priority={false}
        sizes="(max-width: 1280px) 100vw, 1280px"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />

      {/* Right-side fade so the gold stamp reads clearly over a dark field */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, transparent 0%, transparent 55%, rgba(0,0,0,0.85) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top + bottom edge vignettes for depth */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '14px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.45), transparent)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '14px',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.55), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* "Quick Reference" stamp overlay */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: 'clamp(20px, 3vw, 48px)',
          transform: 'translateY(-50%) rotate(-2deg)',
          padding: '6px 14px',
          border: '1.5px solid rgba(200, 150, 44, 0.55)',
          borderRadius: '2px',
          background: 'var(--bg-section-label)',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--re-gold)',
          pointerEvents: 'none',
        }}
      >
        Quick Reference
      </div>
    </div>
  )
}
