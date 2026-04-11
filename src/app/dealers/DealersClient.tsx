'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { DealerList } from '@/components/dealers/DealerList'
import DealerMapWrapper from '@/components/dealers/DealerMapWrapper'
import type { Dealer } from '@/lib/types'
import {
  fetchDealersFromOverpass,
  mergeDealers,
  type BoundingBox,
} from '@/lib/dealers'

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

// ─── Component ────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 500

export default function DealersClient() {
  // Map-viewport dealers (live Overpass)
  const [mapDealers, setMapDealers] = useState<Dealer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Global dealer index (static JSON, loaded once)
  const [globalDealers, setGlobalDealers] = useState<Dealer[]>([])
  const [countryStats, setCountryStats] = useState<Record<string, number>>({})
  const [globalLoaded, setGlobalLoaded] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [countryFilter, setCountryFilter] = useState('')

  // Mobile view toggle
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map')

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load global index on mount
  useEffect(() => {
    Promise.all([fetchGlobalDealers(), fetchCountryStats()]).then(
      ([dealers, stats]) => {
        setGlobalDealers(dealers)
        setCountryStats(stats)
        setGlobalLoaded(true)
      }
    )
  }, [])

  // ── Map viewport dealer loading ────────────────────────────────────────

  const loadDealers = useCallback(async (bounds: BoundingBox) => {
    setIsLoading(true)
    setError(null)
    try {
      const osmDealers = await fetchDealersFromOverpass(bounds)
      setMapDealers(osmDealers)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load dealers.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleBoundsChange = useCallback(
    (bounds: BoundingBox) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        loadDealers(bounds)
      }, DEBOUNCE_MS)
    },
    [loadDealers]
  )

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  // ── Filtered global dealers for the list view ──────────────────────────

  const filteredDealers = useMemo(() => {
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

    return result
  }, [globalDealers, countryFilter, searchQuery])

  // Countries that have dealers (for the dropdown)
  const countries = useMemo(() => {
    return Object.entries(countryStats)
      .filter(([code]) => code !== 'Unknown')
      .sort((a, b) => b[1] - a[1])
  }, [countryStats])

  // Combine global dealers + live Overpass results for the map.
  // Global dealers are shown as pins always; Overpass adds any OSM-only
  // dealers discovered in the current viewport.
  const allMapDealers = useMemo(() => {
    if (mapDealers.length === 0) return filteredDealers
    // Merge, dedup by ID
    const seen = new Set(filteredDealers.map(d => d.id))
    const extra = mapDealers.filter(d => !seen.has(d.id))
    return [...filteredDealers, ...extra]
  }, [filteredDealers, mapDealers])

  const handleDealerClick = useCallback(() => {}, [])

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
            color: 'var(--re-cream)',
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
                {code} ({count})
              </option>
            ))}
            {countryStats['Unknown'] && (
              <option value="Unknown">
                Untagged ({countryStats['Unknown']})
              </option>
            )}
          </select>

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
        {/* Status bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '10px',
            minHeight: '20px',
          }}
        >
          {isLoading && (
            <span
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--re-gold)',
              }}
            >
              Scanning area...
            </span>
          )}
          {error && (
            <span
              role="alert"
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--re-red)',
              }}
            >
              {error}
            </span>
          )}
        </div>

        {/* Map + sidebar grid */}
        <div className="dealers-grid">
          {/* Map */}
          <div className={`dealers-map-wrap ${mobileView === 'list' ? 'dealers-mobile-hidden' : ''}`}>
            <DealerMapWrapper
              dealers={allMapDealers}
              onBoundsChange={handleBoundsChange}
              isLoading={isLoading}
            />
          </div>

          {/* Dealer list — uses global index with filters, not map viewport */}
          <div className={`dealers-sidebar ${mobileView === 'map' ? 'dealers-mobile-hidden' : ''}`}>
            <DealerList
              dealers={filteredDealers}
              onDealerClick={handleDealerClick}
              isLoading={!globalLoaded}
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
      `}</style>
    </div>
  )
}
