'use client'

import { useEffect, useState } from 'react'
import type { Dealer } from '@/lib/types'

interface Props {
  dealers: Dealer[]
  selectedDealer?: Dealer | null
  userLocation: [number, number] | null
  locateState: 'idle' | 'loading' | 'denied' | 'unavailable'
  onLocateMe: () => void
}

/**
 * Wrapper that lazy-loads DealerMap only after mount.
 * This avoids all SSR/dynamic-import issues with Leaflet — the actual
 * map component is loaded via a plain dynamic import() inside useEffect,
 * which guarantees it only runs in the browser.
 */
export default function DealerMapWrapper(props: Props) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<Props> | null>(null)

  useEffect(() => {
    import('./DealerMap').then((mod) => {
      setMapComponent(() => mod.default)
    })
  }, [])

  if (!MapComponent) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '2px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        Loading map...
      </div>
    )
  }

  return <MapComponent {...props} />
}
