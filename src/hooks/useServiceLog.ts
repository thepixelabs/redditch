'use client'

import { useCallback, useMemo } from 'react'
import { usePersistedState } from './usePersistedState'
import { STORAGE_KEYS } from '@/lib/constants'
import type { ServiceLog, ServiceLogEntry } from '@/lib/types'

/**
 * Service log — per-bike, per-task completion history.
 *
 * Shape: { [bikeSlug]: { [taskId]: ServiceLogEntry[] } }
 * Entries are stored newest-first so the calculator can read [0] for "last
 * done". Full history is retained for a future history view; v1 only writes.
 */
export function useServiceLog() {
  const [log, setLog] = usePersistedState<ServiceLog>(
    STORAGE_KEYS.SERVICE_LOG,
    {},
  )

  const logService = useCallback(
    (bikeSlug: string, taskId: string, atKm: number) => {
      const entry: ServiceLogEntry = { doneAtKm: atKm, doneAt: new Date().toISOString() }
      setLog((prev) => {
        const bike = prev[bikeSlug] ?? {}
        const existing = bike[taskId] ?? []
        return {
          ...prev,
          [bikeSlug]: {
            ...bike,
            [taskId]: [entry, ...existing],
          },
        }
      })

      // Plausible — instrument the one event we care about.
      if (typeof window !== 'undefined') {
        const plausible = (window as unknown as { plausible?: (e: string, o?: { props: Record<string, string | number> }) => void }).plausible
        plausible?.('service_logged', { props: { bike: bikeSlug, task: taskId, atKm } })
      }
    },
    [setLog],
  )

  const forBike = useCallback(
    (bikeSlug: string): Record<string, ServiceLogEntry[]> => log[bikeSlug] ?? {},
    [log],
  )

  const historyFor = useMemo(
    () => (bikeSlug: string) => {
      const bike = log[bikeSlug] ?? {}
      const flat: Array<{ taskId: string; doneAtKm: number; doneAt: string }> = []
      for (const [taskId, entries] of Object.entries(bike)) {
        for (const e of entries) flat.push({ taskId, ...e })
      }
      flat.sort((a, b) => (a.doneAt < b.doneAt ? 1 : -1))
      return flat
    },
    [log],
  )

  return { log, logService, forBike, historyFor }
}
