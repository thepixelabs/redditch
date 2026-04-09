'use client'
import { useCallback } from 'react'
import { usePersistedState } from './usePersistedState'
import type { OdometerUnit } from '@/lib/types'
import { STORAGE_KEYS } from '@/lib/constants'
import { miToKm, kmToMi } from '@/lib/utils'

/**
 * Manages odometer state. Always stores internally in km.
 * Returns display value in the user's preferred unit.
 */
export function useOdometer() {
  const [odometerKm, setOdometerKm] = usePersistedState<number>(STORAGE_KEYS.ODOMETER, 0)
  const [unit, setUnit] = usePersistedState<OdometerUnit>(STORAGE_KEYS.UNIT, 'km')

  const displayValue = unit === 'km' ? odometerKm : kmToMi(odometerKm)

  const setDisplayValue = useCallback((value: number) => {
    setOdometerKm(unit === 'km' ? value : miToKm(value))
  }, [unit, setOdometerKm])

  const toggleUnit = useCallback(() => {
    setUnit(u => u === 'km' ? 'mi' : 'km')
  }, [setUnit])

  return { odometerKm, displayValue, unit, setDisplayValue, toggleUnit }
}
