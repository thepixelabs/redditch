'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { GarageEntry, OdometerUnit } from '@/lib/types'
import { STORAGE_KEYS } from '@/lib/constants'

// ─── localStorage helpers ────────────────────────────────────────────────────

function lsRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function lsWrite(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// ─── Init — runs synchronously inside useState() ─────────────────────────────

function initEntries(): GarageEntry[] {
  const existing = lsRead<GarageEntry[]>(STORAGE_KEYS.GARAGE, [])
  if (existing.length > 0) return existing

  // One-time migration from v1 storage
  const slug = lsRead<string | null>(STORAGE_KEYS.BIKE, null)
  if (!slug) return []

  return [{
    id: slug,        // id === slug preserves existing service log keys
    slug,
    nickname: '',
    odometerKm: lsRead<number>(STORAGE_KEYS.ODOMETER, 0),
    unit: lsRead<OdometerUnit>(STORAGE_KEYS.UNIT, 'km'),
    createdAt: Date.now(),
  }]
}

function initActiveId(entries: GarageEntry[]): string | null {
  const stored = lsRead<string | null>(STORAGE_KEYS.ACTIVE_ID, null)
  if (stored && entries.some(e => e.id === stored)) return stored
  const legacy = lsRead<string | null>(STORAGE_KEYS.BIKE, null)
  if (legacy && entries.some(e => e.id === legacy)) return legacy
  return entries[0]?.id ?? null
}

// ─── useGarage ───────────────────────────────────────────────────────────────

export function useGarage() {
  const [entries, setEntries] = useState<GarageEntry[]>(() =>
    typeof window === 'undefined' ? [] : initEntries(),
  )
  const [activeId, setActiveId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const e = initEntries()
    return initActiveId(e)
  })

  // Keep a ref so callbacks always see the latest entries without stale closure
  const entriesRef = useRef(entries)
  entriesRef.current = entries

  // Persist on change (skip first render — init already read the stored values)
  const firstEntriesWrite = useRef(true)
  useEffect(() => {
    if (firstEntriesWrite.current) {
      firstEntriesWrite.current = false
      // If we migrated from v1, persist to v2 storage now
      if (entries.length > 0 && lsRead<GarageEntry[]>(STORAGE_KEYS.GARAGE, []).length === 0) {
        lsWrite(STORAGE_KEYS.GARAGE, entries)
      }
      return
    }
    lsWrite(STORAGE_KEYS.GARAGE, entries)
  }, [entries])

  useEffect(() => {
    lsWrite(STORAGE_KEYS.ACTIVE_ID, activeId)
  }, [activeId])

  const activeEntry = entries.find(e => e.id === activeId) ?? entries[0] ?? null

  const addEntry = useCallback((
    slug: string,
    nickname: string,
    odometerKm: number,
    unit: OdometerUnit,
  ): string => {
    const existingCount = entriesRef.current.filter(e => e.slug === slug).length
    const id = existingCount === 0 ? slug : `${slug}-${Date.now()}`
    const entry: GarageEntry = { id, slug, nickname: nickname.trim(), odometerKm, unit, createdAt: Date.now() }
    setEntries(prev => [...prev, entry])
    setActiveId(id)
    return id
  }, [])

  const updateEntry = useCallback((
    id: string,
    patch: Partial<Pick<GarageEntry, 'nickname' | 'odometerKm' | 'unit'>>,
  ) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))
  }, [])

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id)
      setActiveId(cur => {
        if (cur !== id) return cur
        return next[0]?.id ?? null
      })
      return next
    })
  }, [])

  const setActive = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  return { entries, activeEntry, activeId, addEntry, updateEntry, removeEntry, setActive }
}
