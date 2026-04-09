'use client'

/**
 * NeonSign — Royal Enfield wordmark rendered as a neon sign.
 *
 * Uses the official RE wordmark SVG (transparent, no background) with
 * CSS drop-shadow filters that radiate directly from the letterform edges.
 * The .neon-logo class applies the breathing pulse animation from globals.css.
 */
export default function NeonSign({ className = '' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/re-logo.svg"
      alt="Royal Enfield"
      className={`neon-logo${className ? ` ${className}` : ''}`}
      style={{
        width: '300px',
        height: 'auto',
        display: 'block',
      }}
    />
  )
}
