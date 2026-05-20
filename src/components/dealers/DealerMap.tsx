'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import Supercluster from 'supercluster'
import type { Dealer } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DealerMapProps {
  dealers: Dealer[]
  selectedDealer?: Dealer | null
  userLocation: [number, number] | null
  locateState: 'idle' | 'loading' | 'denied' | 'unavailable'
  onLocateMe: () => void
}

// [west, south, east, north] — supercluster format
type SCBounds = [number, number, number, number]

interface DealerPoint {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: { dealer: Dealer }
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SC_MAX_ZOOM = 16   // supercluster stops clustering above this
const SC_RADIUS   = 55   // clustering radius in pixels

// ─── Map-ref capture (gives non-hook code access to the Leaflet map) ──────────

function MapRefCapture({ mapRef }: { mapRef: React.MutableRefObject<ReturnType<typeof useMap> | null> }) {
  const map = useMap()
  useEffect(() => { mapRef.current = map }, [map])
  return null
}

// ─── Bounds + zoom watcher ────────────────────────────────────────────────────

function ViewportWatcher({
  onViewport,
}: {
  onViewport: (bounds: SCBounds, zoom: number) => void
}) {
  const map = useMapEvents({
    moveend: emit,
    zoomend: emit,
  })

  function emit() {
    const zoom = map.getZoom()
    const b    = map.getBounds()
    onViewport(
      [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
      zoom,
    )
  }

  useEffect(() => {
    emit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

// ─── Fly-to helper ──────────────────────────────────────────────────────────

function FlyTo({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 })
  }, [map, center, zoom])
  return null
}

// ─── Cluster icon factory ─────────────────────────────────────────────────────

function makeClusterIcon(count: number) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet')
  const size     = count < 10 ? 30 : count < 100 ? 38 : count < 500 ? 46 : 54
  const fontSize = count < 10 ? 12 : count < 100 ? 12 : 11

  return L.divIcon({
    className: 'dealer-cluster-icon',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:rgba(181,18,27,0.85);
      border:2px solid #C8962C;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      color:#F0E6D0;
      font-family:'JetBrains Mono',monospace;
      font-size:${fontSize}px;
      font-weight:700;
      letter-spacing:-0.02em;
      box-shadow:0 2px 8px rgba(0,0,0,0.55),0 0 0 3px rgba(200,150,44,0.15);
      cursor:pointer;
      user-select:none;
    ">${count > 999 ? `${Math.round(count / 1000)}k` : count}</div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

// ─── Source badge ─────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: Dealer['source'] }) {
  const isOsm = source === 'osm'
  return (
    <span
      style={{
        display:       'inline-block',
        fontSize:      '9px',
        fontFamily:    'var(--font-mono, monospace)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding:       '2px 5px',
        borderRadius:  '3px',
        background:    isOsm ? 'rgba(200,150,44,0.15)' : 'rgba(181,18,27,0.15)',
        color:         isOsm ? '#C8962C' : '#B5121B',
        border:        isOsm ? '1px solid rgba(200,150,44,0.35)' : '1px solid rgba(181,18,27,0.35)',
        lineHeight:    '1',
      }}
    >
      {isOsm ? 'OSM' : 'Curated'}
    </span>
  )
}

// ─── Dealer popup content ─────────────────────────────────────────────────────

function DealerPopup({ dealer }: { dealer: Dealer }) {
  return (
    <div
      style={{
        fontFamily:   'var(--font-body, system-ui, sans-serif)',
        minWidth:     '160px',
        maxWidth:     '260px',
        background:   'var(--bg-popup)',
        border:       '1px solid rgba(200,150,44,0.22)',
        borderTop:    '3px solid var(--re-red)',
        borderRadius: '4px',
        padding:      '10px 12px',
        color:        'var(--text-popup)',
        boxShadow:    '0 4px 16px rgba(0,0,0,0.35)',
      }}
    >
      <p style={{ fontSize:'13px', fontWeight:700, marginBottom:'4px', lineHeight:1.3, color:'var(--text-popup)', fontFamily:'var(--font-display,Georgia,serif)' }}>
        {dealer.name}
      </p>
      {(dealer.address ?? dealer.city) && (
        <p style={{ fontSize:'11px', color:'var(--text-popup-muted)', marginBottom:'6px', lineHeight:1.4 }}>
          {[dealer.address, dealer.city, dealer.country].filter(Boolean).join(', ')}
        </p>
      )}
      {dealer.phone && (
        <p style={{ fontSize:'11px', marginBottom:'4px' }}>
          <a href={`tel:${dealer.phone}`} style={{ color:'var(--re-gold)', textDecoration:'none', fontFamily:'var(--font-mono,monospace)', letterSpacing:'0.06em' }}>
            {dealer.phone}
          </a>
        </p>
      )}
      {dealer.website && (
        <p style={{ fontSize:'11px', marginBottom:'6px' }}>
          <a href={dealer.website} target="_blank" rel="noopener noreferrer" style={{ color:'var(--re-gold)', textDecoration:'underline', textUnderlineOffset:'2px' }}>
            Visit website
          </a>
        </p>
      )}
      {dealer.openingHours && (
        <p style={{ fontSize:'10px', color:'var(--text-muted)', marginBottom:'6px', fontFamily:'var(--font-mono,monospace)' }}>
          {dealer.openingHours}
        </p>
      )}
      <div style={{ marginTop:'4px' }}>
        <SourceBadge source={dealer.source} />
      </div>
    </div>
  )
}

// ─── DealerMap ────────────────────────────────────────────────────────────────

export default function DealerMap({ dealers, selectedDealer, userLocation, locateState, onLocateMe }: DealerMapProps) {
  // Viewport state — drives clustering
  const [viewportBounds, setViewportBounds] = useState<SCBounds | null>(null)
  const [mapZoom, setMapZoom]               = useState(3)

  const mapRef = useRef<ReturnType<typeof useMap> | null>(null)

  // ── Static icons (created once) ──────────────────────────────────────────

  const { dealerIcon, userIcon } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet')
    return {
      dealerIcon: L.divIcon({
        className: 'dealer-marker',
        html: '<div style="width:12px;height:12px;background:#B5121B;border:2px solid #C8962C;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>',
        iconSize: [16, 16], iconAnchor: [8, 8], popupAnchor: [0, -10],
      }),
      userIcon: L.divIcon({
        className: 'dealer-marker',
        html: '<div style="width:12px;height:12px;background:#4A90D9;border:3px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(74,144,217,0.6),0 2px 6px rgba(0,0,0,0.4);"></div>',
        iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -12],
      }),
    }
  }, [])

  // ── Supercluster index — rebuilt only when dealers array changes ──────────

  const scIndex = useMemo<Supercluster<{ dealer: Dealer }>>(() => {
    const sc = new Supercluster<{ dealer: Dealer }>({
      radius:   SC_RADIUS,
      maxZoom:  SC_MAX_ZOOM,
      minPoints: 2,
    })
    sc.load(
      dealers.map(d => ({
        type:     'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [d.lng, d.lat] as [number, number] },
        properties: { dealer: d },
      }))
    )
    return sc
  }, [dealers])

  // ── Clusters for current viewport ─────────────────────────────────────────

  const clusters = useMemo(() => {
    if (!viewportBounds || dealers.length === 0) return []
    return scIndex.getClusters(viewportBounds, Math.round(mapZoom))
  }, [scIndex, viewportBounds, mapZoom, dealers.length])

  // ── Viewport handler — called by ViewportWatcher ─────────────────────────

  const handleViewport = useCallback((bounds: SCBounds, zoom: number) => {
    setViewportBounds(bounds)
    setMapZoom(zoom)
  }, [])

  const locError = locateState === 'denied' || locateState === 'unavailable'

  // Derive the fly-to target for a selected dealer (changes when selectedDealer changes)
  const selectedCenter = useMemo<[number, number] | null>(
    () => (selectedDealer ? [selectedDealer.lat, selectedDealer.lng] : null),
    [selectedDealer]
  )

  // Swap CARTO basemap by theme. Read the DOM class synchronously on mount so
  // the correct tile URL is used on the very first render (the useTheme hook
  // initialises as 'dark', so relying on it causes a flash of dark tiles in
  // light mode). A MutationObserver keeps isLight in sync when the user
  // toggles the theme at runtime; the `key` on TileLayer forces a full
  // remount when the value changes so Leaflet actually fetches the new tiles.
  const [isLight, setIsLight] = useState(() =>
    typeof document !== 'undefined' && !document.documentElement.classList.contains('dark')
  )
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(!document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const tileUrl = isLight
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer center={[20, 0]} zoom={3} style={{ width: '100%', height: '100%' }} attributionControl>
        <TileLayer
          key={isLight ? 'light' : 'dark'}
          url={tileUrl}
          className="map-tiles"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OSM</a> &copy; <a href="https://carto.com/" target="_blank" rel="noopener noreferrer">CARTO</a>'
        />

        <MapRefCapture mapRef={mapRef} />
        <FlyTo center={userLocation} zoom={12} />
        <FlyTo center={selectedCenter} zoom={14} />
        <ViewportWatcher onViewport={handleViewport} />

        {/* User location pin */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup className="re-dealer-popup">
              <div style={{ fontFamily:'var(--font-mono,monospace)', fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-popup)', background:'var(--bg-popup)', border:'1px solid rgba(200,150,44,0.22)', borderRadius:'4px', padding:'8px 12px', boxShadow:'0 4px 16px rgba(0,0,0,0.35)' }}>
                Your location
              </div>
            </Popup>
          </Marker>
        )}

        {/* Cluster + individual dealer markers */}
        {clusters.map((cluster) => {
          const [lng, lat] = cluster.geometry.coordinates
          const props = cluster.properties as { cluster?: boolean; cluster_id?: number; point_count?: number; dealer?: Dealer }

          if (props.cluster) {
            const count = props.point_count ?? 0
            const icon  = makeClusterIcon(count)
            return (
              <Marker
                key={`cl-${props.cluster_id}`}
                position={[lat, lng]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    const expansionZoom = Math.min(
                      scIndex.getClusterExpansionZoom(props.cluster_id!),
                      SC_MAX_ZOOM,
                    )
                    mapRef.current?.flyTo([lat, lng], expansionZoom, { duration: 0.7 })
                  },
                }}
              />
            )
          }

          // Individual dealer
          const dealer = props.dealer!
          return (
            <Marker key={dealer.id} position={[lat, lng]} icon={dealerIcon}>
              <Popup className="re-dealer-popup">
                <DealerPopup dealer={dealer} />
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* ── Locate Me button ─────────────────────────────────────────────── */}
      <button
        onClick={onLocateMe}
        disabled={locateState === 'loading'}
        aria-label="Find dealers near my location"
        className="re-locate-btn"
        style={{
          position: 'absolute', bottom: '40px', left: '50%',
          transform: 'translateX(-50%)', zIndex: 1000,
          minHeight: '48px', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '0 20px',
          background:    locError ? 'rgba(181,18,27,0.12)' : 'var(--bg-popup)',
          border:        locError ? '1px solid rgba(181,18,27,0.45)' : '1px solid rgba(200,150,44,0.35)',
          borderRadius:  '8px',
          cursor:        locateState === 'loading' ? 'wait' : 'pointer',
          boxShadow:     locError
                           ? '0 4px 20px rgba(181,18,27,0.25),0 2px 8px rgba(0,0,0,0.3)'
                           : '0 4px 20px rgba(0,0,0,0.3),0 0 15px rgba(200,150,44,0.08)',
          backdropFilter: 'blur(6px)',
          transition:    'all 0.2s ease',
        }}
      >
        <span aria-hidden="true" style={{ display:'flex', alignItems:'center', flexShrink:0, width:'24px', height:'24px' }}>
          {locateState === 'loading' ? (
            <span style={{ display:'inline-block', width:'20px', height:'20px', border:'2px solid rgba(200,150,44,0.2)', borderTop:'2px solid #C8962C', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={locateState === 'idle' ? 'neon-logo-gold' : undefined} style={{ filter: locError ? 'drop-shadow(0 0 4px rgba(181,18,27,0.5))' : undefined }}>
              <circle cx="12" cy="12" r="10.5" stroke={locError ? '#B5121B' : '#C8962C'} strokeWidth="1.5" fill="none" />
              <text x="12" y="16" textAnchor="middle" fill={locError ? '#B5121B' : '#C8962C'} fontSize="10" fontWeight="700" fontFamily="Georgia,'Times New Roman',serif" letterSpacing="0.5">RE</text>
            </svg>
          )}
        </span>
        <span style={{ fontFamily:'var(--font-mono,monospace)', fontSize:'12px', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color: locError ? 'var(--re-red)' : 'var(--text-popup)', whiteSpace:'nowrap', lineHeight:1 }}>
          {locateState === 'loading' ? 'Locating\u2026' : locateState === 'denied' ? 'Location denied' : locateState === 'unavailable' ? 'Unavailable' : 'Locate me'}
        </span>
      </button>

      {/* ── Toasts ────────────────────────────────────────────────────────── */}
      {locateState === 'denied'      && <div className="re-map-toast">Location permission denied — pan the map manually</div>}
      {locateState === 'unavailable' && <div className="re-map-toast">Location unavailable — pan the map manually</div>}

      <style>{`
        .dealer-cluster-icon { background: transparent !important; border: none !important; }
        .dealer-marker       { background: transparent !important; border: none !important; }
        .re-dealer-popup .leaflet-popup-content-wrapper { background:transparent; border:none; box-shadow:none; padding:0; border-radius:0; }
        .re-dealer-popup .leaflet-popup-content { margin:0; }
        .re-dealer-popup .leaflet-popup-tip-container { display:none; }
        .leaflet-attribution-flag { display:none !important; }
        .leaflet-control-zoom a { background:var(--bg-popup) !important; color:var(--re-gold) !important; border-color:var(--border) !important; }
        .leaflet-control-zoom a:hover { background:var(--bg-popup-hover) !important; }
        .leaflet-control-attribution { background:var(--bg-header) !important; color:var(--text-muted) !important; font-size:9px !important; backdrop-filter:blur(4px); }
        .leaflet-control-attribution a { color:var(--text-secondary) !important; }
        @media (max-width:480px) { .leaflet-control-attribution { max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; } }
        .re-locate-btn:hover:not(:disabled) { background:var(--bg-popup-hover) !important; border-color:rgba(200,150,44,0.55) !important; box-shadow:0 4px 24px rgba(0,0,0,0.35),0 0 20px rgba(200,150,44,0.15) !important; }
        .re-locate-btn:active:not(:disabled) { transform:translateX(-50%) scale(0.97) !important; }
        .re-locate-btn:focus-visible { outline:2px solid var(--re-gold); outline-offset:3px; }
        .re-map-toast { position:absolute; top:10px; left:50%; transform:translateX(-50%); z-index:1000; background:var(--bg-popup); border:1px solid rgba(181,18,27,0.35); border-radius:6px; padding:8px 16px; box-shadow:0 4px 16px rgba(0,0,0,0.3); backdrop-filter:blur(4px); font-family:var(--font-mono,monospace); font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-secondary); pointer-events:none; animation:toastFade 4s ease-in-out forwards; }
        @keyframes toastFade { 0%,70% { opacity:1; } 100% { opacity:0; } }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  )
}
