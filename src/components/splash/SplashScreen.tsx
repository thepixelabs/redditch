'use client'

import { useEffect, useState } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'

export function SplashScreen() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // If already seen this session, bail immediately — no flicker, no delay.
    if (sessionStorage.getItem(STORAGE_KEYS.SPLASH)) {
      return
    }

    // Mark seen before rendering — prevents double-show on StrictMode double-mount.
    sessionStorage.setItem(STORAGE_KEYS.SPLASH, '1')
    setVisible(true)

    // Let the CSS animation (2.2s) run its course, then remove from DOM.
    const timer = setTimeout(() => setVisible(false), 2400)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      className="splash-container"
      aria-hidden="true"
      // Prevent the splash from being in the tab order
      tabIndex={-1}
    >
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        {/* Outer gold ring — draws itself via CSS stroke-dashoffset animation */}
        <circle
          cx="60"
          cy="60"
          r="55"
          fill="none"
          stroke="#C8962C"
          strokeWidth="3"
          strokeLinecap="round"
          className="splash-ring"
          transform="rotate(-90 60 60)"
        />

        {/* Dark inner field */}
        <circle cx="60" cy="60" r="50" fill="#242424" />

        {/* RE monogram */}
        <text
          x="60"
          y="68"
          textAnchor="middle"
          fill="#C8962C"
          fontSize="36"
          fontWeight="700"
          fontFamily="Georgia, serif"
          letterSpacing="-2"
        >
          RE
        </text>

        {/* Thin rule beneath the monogram — feels engraved */}
        <line
          x1="35"
          y1="78"
          x2="85"
          y2="78"
          stroke="#9E7F3C"
          strokeWidth="0.5"
        />
      </svg>

      <p
        style={{
          fontFamily: 'Georgia, serif',
          color: '#C8962C',
          letterSpacing: '0.25em',
          fontSize: '13px',
          fontWeight: 400,
          textTransform: 'uppercase',
          marginTop: '20px',
        }}
      >
        REDDITCH
      </p>

      <p
        style={{
          color: '#4A4A4A',
          fontSize: '11px',
          marginTop: '6px',
          letterSpacing: '0.1em',
        }}
      >
        Royal Enfield Service Companion
      </p>
    </div>
  )
}
