'use client'
import { useState, useEffect, useCallback } from 'react'

/**
 * localStorage-backed useState. SSR-safe (returns defaultValue on server).
 * Handles JSON parse errors gracefully by falling back to defaultValue.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize from localStorage if available
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const item = localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // localStorage unavailable (private browsing, storage full) — fail silently
    }
  }, [key, state])

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value
      return next
    })
  }, [])

  return [state, setValue]
}
