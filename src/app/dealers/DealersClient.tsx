'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { DealerList } from '@/components/dealers/DealerList'
import DealerMapWrapper from '@/components/dealers/DealerMapWrapper'
import type { Dealer } from '@/lib/types'

// ─── Data loaders ─────────────────────────────────────────────────────────────

async function fetchGlobalDealers(): Promise<Dealer[]> {
  try {
    const res = await fetch('/dealers/global.json', { cache: 'force-cache' })
    if (!res.ok) return []
    const data: unknown = await res.json()
    return Array.isArray(data) ? (data as Dealer[]) : []
  } catch {
    return []
  }
}

async function fetchCountryStats(): Promise<Record<string, number>> {
  try {
    const res = await fetch('/dealers/countries.json', { cache: 'force-cache' })
    if (!res.ok) return {}
    return (await res.json()) as Record<string, number>
  } catch {
    return {}
  }
}

interface DealerMeta {
  scraped_at: string | null
  built_at: string | null
  total: number
}

async function fetchDealerMeta(): Promise<DealerMeta | null> {
  try {
    const res = await fetch('/dealers/meta.json', { cache: 'force-cache' })
    if (!res.ok) return null
    return (await res.json()) as DealerMeta
  } catch {
    return null
  }
}

function ageInDays(iso: string | null | undefined): number | null {
  if (!iso) return null
  const ms = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(ms)) return null
  return Math.floor(ms / 86_400_000)
}

// ─── Haversine distance ────────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DealersClient() {
  // Global dealer index (static JSON, loaded once)
  const [globalDealers, setGlobalDealers] = useState<Dealer[]>([])
  const [countryStats, setCountryStats] = useState<Record<string, number>>({})
  const [globalLoaded, setGlobalLoaded] = useState(false)
  const [dealerMeta, setDealerMeta] = useState<DealerMeta | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [countryFilter, setCountryFilter] = useState('')

  // Location + proximity
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locateState, setLocateState] = useState<'idle' | 'loading' | 'denied' | 'unavailable'>('idle')
  const [proximityKm, setProximityKm] = useState<number | null>(null)

  // Map selection — clicking a list item flies the map to that dealer
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null)

  // Mobile view toggle
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map')

  // Load global index on mount
  useEffect(() => {
    Promise.all([fetchGlobalDealers(), fetchCountryStats(), fetchDealerMeta()]).then(
      ([dealers, stats, meta]) => {
        setGlobalDealers(dealers)
        setCountryStats(stats)
        setDealerMeta(meta)
        setGlobalLoaded(true)
      }
    )
  }, [])

  const scrapedAgeDays = ageInDays(dealerMeta?.scraped_at)
  const isStale = scrapedAgeDays != null && scrapedAgeDays > 180

  // ── Geolocation ────────────────────────────────────────────────────────

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) { setLocateState('unavailable'); return }
    setLocateState('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
        setLocateState('idle')
      },
      (err) => {
        setLocateState(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable')
        setTimeout(() => setLocateState('idle'), 4000)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  // ── Filtered global dealers for the list view ──────────────────────────

  const { filteredDealers, distanceMap } = useMemo(() => {
    let result = globalDealers

    if (countryFilter) {
      result = result.filter((d) => d.country === countryFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.city?.toLowerCase().includes(q) ||
          d.address?.toLowerCase().includes(q)
      )
    }

    const dMap = new Map<string, number>()
    if (userLocation) {
      for (const d of result) {
        dMap.set(d.id, haversineKm(userLocation[0], userLocation[1], d.lat, d.lng))
      }
      if (proximityKm !== null) {
        result = result.filter((d) => (dMap.get(d.id) ?? Infinity) <= proximityKm)
      }
      result = [...result].sort((a, b) => (dMap.get(a.id) ?? Infinity) - (dMap.get(b.id) ?? Infinity))
    }

    return { filteredDealers: result, distanceMap: dMap }
  }, [globalDealers, countryFilter, searchQuery, userLocation, proximityKm])

  // Countries that have dealers (for the dropdown)
  const countries = useMemo(() => {
    return Object.entries(countryStats)
      .filter(([code]) => code !== 'Unknown')
      .sort((a, b) => b[1] - a[1])
  }, [countryStats])

  // Full country name resolver via Intl
  const countryDisplayName = useMemo(() => {
    try {
      const dn = new Intl.DisplayNames(['en'], { type: 'region' })
      return (code: string): string => dn.of(code) ?? code
    } catch {
      return (code: string) => code
    }
  }, [])

  // Clicking a list card selects the dealer and switches mobile view to the map
  const handleDealerClick = useCallback((dealer: Dealer) => {
    setSelectedDealer(dealer)
    setMobileView('map')
  }, [])

  return (
    <div className="garage-wall" style={{ minHeight: 'calc(100vh - 160px)' }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="dealers-header">
        <p className="stamp" style={{ display: 'inline-block', marginBottom: '14px' }}>
          Dealer Finder
        </p>

        <h1
          style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(1.5rem, 3.5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '0.01em',
            lineHeight: 1.1,
            color: 'var(--text-heading)',
            margin: '0 0 10px',
          }}
        >
          Find a Dealer
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-body), system-ui, sans-serif',
            fontSize: 'clamp(0.8125rem, 1.2vw, 1rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '68ch',
            margin: '0 0 16px',
          }}
        >
          {globalLoaded
            ? `${globalDealers.length} Royal Enfield dealers worldwide. `
            : ''}
          Data from{' '}
          <ExternalLink href="https://www.openstreetmap.org" unstyled className="enamel-link">
            OpenStreetMap
          </ExternalLink>
          {' '}— help improve coverage by{' '}
          <ExternalLink href="https://www.openstreetmap.org/edit" unstyled className="enamel-link">
            adding dealers to OSM
          </ExternalLink>
          .
        </p>

        {/* ── Freshness disclaimer — honest about data age ───────────────── */}
        {dealerMeta?.scraped_at && (
          <div
            role="note"
            style={{
              marginBottom: '16px',
              padding: '10px 12px',
              border: `1px solid ${isStale ? 'rgba(181,18,27,0.45)' : 'var(--border-subtle)'}`,
              borderLeft: `3px solid ${isStale ? 'var(--re-red)' : 'var(--re-gold)'}`,
              borderRadius: '0 4px 4px 0',
              background: isStale ? 'rgba(181,18,27,0.05)' : 'rgba(200,150,44,0.05)',
              maxWidth: '68ch',
              fontFamily: 'var(--font-body), system-ui, sans-serif',
              fontSize: '12px',
              lineHeight: 1.55,
              color: 'var(--text-secondary)',
            }}
          >
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: isStale ? 'var(--re-red)' : 'var(--re-gold)',
                marginBottom: '3px',
              }}
            >
              Last refresh · {new Date(dealerMeta.scraped_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              {scrapedAgeDays != null && ` · ${scrapedAgeDays} days ago`}
              {isStale && ' · STALE'}
            </span>
            Always call ahead to confirm hours and current address before
            riding in — dealers move, change names, or close without
            updating their map listing.
          </div>
        )}

        {/* ── Filters ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: '1 1 200px',
              maxWidth: '320px',
              minHeight: '40px',
              padding: '8px 12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body), system-ui, sans-serif',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 150ms ease',
            }}
          />

          {/* Country dropdown */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            style={{
              minHeight: '40px',
              padding: '8px 12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '11px',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">All Countries ({globalDealers.length})</option>
            {countries.map(([code, count]) => (
              <option key={code} value={code}>
                {countryDisplayName(code)} ({count})
              </option>
            ))}
            {countryStats['Unknown'] && (
              <option value="Unknown">
                Untagged ({countryStats['Unknown']})
              </option>
            )}
          </select>

          {/* Near me button */}
          <button
            onClick={handleLocateMe}
            disabled={locateState === 'loading'}
            aria-label="Sort dealers by proximity to my location"
            style={{
              minHeight:     '40px',
              padding:       '0 14px',
              display:       'flex',
              alignItems:    'center',
              gap:           '6px',
              background:    userLocation ? 'rgba(200,150,44,0.08)' : 'var(--bg-card)',
              border:        userLocation
                               ? '1px solid rgba(200,150,44,0.45)'
                               : locateState === 'denied' || locateState === 'unavailable'
                                 ? '1px solid rgba(181,18,27,0.45)'
                                 : '1px solid var(--border-subtle)',
              borderRadius:  '4px',
              color:         userLocation
                               ? 'var(--re-gold)'
                               : locateState === 'denied' || locateState === 'unavailable'
                                 ? 'var(--re-red)'
                                 : 'var(--text-primary)',
              fontFamily:    'var(--font-mono), monospace',
              fontSize:      '11px',
              letterSpacing: '0.08em',
              cursor:        locateState === 'loading' ? 'wait' : 'pointer',
              transition:    'all 150ms ease',
              whiteSpace:    'nowrap',
              flexShrink:    0,
            }}
          >
            {locateState === 'loading' ? (
              <span
                aria-hidden="true"
                style={{
                  display:      'inline-block',
                  width:        '12px',
                  height:       '12px',
                  border:       '1.5px solid rgba(200,150,44,0.2)',
                  borderTop:    '1.5px solid var(--re-gold)',
                  borderRadius: '50%',
                  animation:    'spin 0.8s linear infinite',
                  flexShrink:   0,
                }}
              />
            ) : (
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="5" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="2" y1="12" x2="5" y2="12" />
                <line x1="19" y1="12" x2="22" y2="12" />
              </svg>
            )}
            {locateState === 'loading'
              ? 'Locating…'
              : locateState === 'denied'
                ? 'Denied'
                : locateState === 'unavailable'
                  ? 'Unavailable'
                  : userLocation
                    ? 'Near me ✓'
                    : 'Near me'}
          </button>

          {/* Proximity radius select — only when we have a location */}
          {userLocation && (
            <select
              value={proximityKm ?? ''}
              onChange={(e) => setProximityKm(e.target.value === '' ? null : Number(e.target.value))}
              style={{
                minHeight:     '40px',
                padding:       '8px 12px',
                background:    'var(--bg-card)',
                border:        '1px solid rgba(200,150,44,0.35)',
                borderRadius:  '4px',
                color:         'var(--re-gold)',
                fontFamily:    'var(--font-mono), monospace',
                fontSize:      '11px',
                letterSpacing: '0.08em',
                cursor:        'pointer',
                outline:       'none',
              }}
            >
              <option value="">All distances</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
              <option value="250">250 km</option>
            </select>
          )}

          {/* Result count */}
          {(searchQuery || countryFilter) && (
            <span
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              {filteredDealers.length} result{filteredDealers.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Mobile tab bar ─────────────────────────────────────────────── */}
      <div className="dealers-tabs">
        <button
          onClick={() => setMobileView('map')}
          className={mobileView === 'map' ? 'active' : ''}
          style={{
            flex: 1,
            minHeight: '44px',
            background: mobileView === 'map' ? 'var(--bg-card)' : 'transparent',
            border: 'none',
            borderBottom: mobileView === 'map' ? '2px solid var(--re-gold)' : '2px solid transparent',
            color: mobileView === 'map' ? 'var(--re-gold)' : 'var(--text-muted)',
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          Map
        </button>
        <button
          onClick={() => setMobileView('list')}
          className={mobileView === 'list' ? 'active' : ''}
          style={{
            flex: 1,
            minHeight: '44px',
            background: mobileView === 'list' ? 'var(--bg-card)' : 'transparent',
            border: 'none',
            borderBottom: mobileView === 'list' ? '2px solid var(--re-gold)' : '2px solid transparent',
            color: mobileView === 'list' ? 'var(--re-gold)' : 'var(--text-muted)',
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          List ({filteredDealers.length})
        </button>
      </div>

      {/* ── Main layout ───────────────────────────────────────────────────── */}
      <div className="dealers-content">
        {/* Status bar — reserved for future use; hidden when idle */}
        <div style={{ minHeight: '20px', marginBottom: '10px' }} />

        {/* Map + sidebar grid */}
        <div className="dealers-grid">
          {/* Map */}
          <div className={`dealers-map-wrap ${mobileView === 'list' ? 'dealers-mobile-hidden' : ''}`}>
            <DealerMapWrapper
              dealers={filteredDealers}
              selectedDealer={selectedDealer}
              userLocation={userLocation}
              locateState={locateState}
              onLocateMe={handleLocateMe}
            />
          </div>

          {/* Dealer list — uses global index with filters, not map viewport */}
          <div className={`dealers-sidebar ${mobileView === 'map' ? 'dealers-mobile-hidden' : ''}`}>
            <DealerList
              dealers={filteredDealers}
              onDealerClick={handleDealerClick}
              isLoading={!globalLoaded}
              distanceMap={distanceMap}
            />
          </div>
        </div>
      </div>

      <style>{`
        .dealers-header {
          max-width: 1600px;
          margin: 0 auto;
          padding: 20px 16px 12px;
        }
        .dealers-content {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 16px 40px;
        }
        /* Always stacked: map on top, list below */
        .dealers-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .dealers-map-wrap {
          width: 100%;
          height: clamp(300px, 50vh, 420px);
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          position: relative;
        }
        .dealers-sidebar {
          display: flex;
          flex-direction: column;
          max-height: 50vh;
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
        }
        /* Mobile tab bar — only on small screens */
        .dealers-tabs {
          display: flex;
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 16px;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 10px;
        }
        .dealers-mobile-hidden {
          display: none !important;
        }

        @media (min-width: 768px) {
          .dealers-header { padding: 28px 24px 16px; }
          .dealers-content { padding: 0 24px 48px; }
          .dealers-tabs { display: none; }
          .dealers-map-wrap {
            height: clamp(380px, 50vh, 520px);
          }
          /* On tablet+, always show both map and list — no tabs needed */
          .dealers-mobile-hidden {
            display: flex !important;
          }
        }

        @media (min-width: 1024px) {
          .dealers-header { padding: 36px 32px 18px; }
          .dealers-content { padding: 0 32px 56px; }
          .dealers-map-wrap {
            height: clamp(420px, 52vh, 580px);
          }
          .dealers-sidebar {
            max-height: 45vh;
          }
        }

        @media (min-width: 1440px) {
          .dealers-header { padding: 44px 40px 20px; }
          .dealers-content { padding: 0 40px 64px; }
          .dealers-map-wrap {
            height: clamp(460px, 55vh, 640px);
            border-radius: 8px;
          }
        }

        @media (min-width: 1920px) {
          .dealers-header { padding: 52px 48px 24px; }
          .dealers-content { padding: 0 48px 72px; }
          .dealers-map-wrap { height: clamp(500px, 55vh, 720px); }
        }

        .dealers-header input:focus {
          border-color: var(--re-gold) !important;
        }
        .dealers-header select:focus {
          border-color: var(--re-gold) !important;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
