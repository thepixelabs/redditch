'use client'
import { useCallback } from 'react'
import { usePersistedState } from './usePersistedState'
import { STORAGE_KEYS } from '@/lib/constants'
import type { BikePersonalization } from '@/lib/types'

const DEFAULT_PERSONALIZATION: BikePersonalization = {
  nickname: undefined,
  color: undefined,
  accessories: [],
}

/**
 * Manages bike personalization state — nickname, color variant, accessories.
 * Persists to localStorage via usePersistedState.
 */
export function usePersonalization() {
  const [personalization, setPersonalization] = usePersistedState<BikePersonalization>(
    STORAGE_KEYS.PERSONALIZATION,
    DEFAULT_PERSONALIZATION
  )

  const setNickname = useCallback((nickname: string | undefined) => {
    setPersonalization(prev => ({ ...prev, nickname: nickname || undefined }))
  }, [setPersonalization])

  const setColor = useCallback((color: string | undefined) => {
    setPersonalization(prev => ({ ...prev, color }))
  }, [setPersonalization])

  const toggleAccessory = useCallback((accessory: string) => {
    setPersonalization(prev => ({
      ...prev,
      accessories: prev.accessories.includes(accessory)
        ? prev.accessories.filter(a => a !== accessory)
        : [...prev.accessories, accessory],
    }))
  }, [setPersonalization])

  const reset = useCallback(() => {
    setPersonalization(DEFAULT_PERSONALIZATION)
  }, [setPersonalization])

  return {
    personalization,
    setNickname,
    setColor,
    toggleAccessory,
    reset,
  }
}
