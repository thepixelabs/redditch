'use client'
import { useEffect, useState, useCallback } from 'react'
import type { ThemePreference } from '@/lib/types'
import { STORAGE_KEYS } from '@/lib/constants'

/**
 * Manages light/dark mode.
 * - Reads initial preference from localStorage (set by the inline <head> script)
 * - Default: 'dark' (garage use)
 * - Applies by toggling 'dark' class on document.documentElement
 * - Persists choice to localStorage
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>('dark')

  useEffect(() => {
    // Read what the inline head script already applied
    const stored = localStorage.getItem(STORAGE_KEYS.THEME) as ThemePreference | null
    setThemeState(stored ?? 'dark')
  }, [])

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next)
    localStorage.setItem(STORAGE_KEYS.THEME, next)

    const root = document.documentElement
    const isDark =
      next === 'dark' ||
      (next === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  const toggle = useCallback(() => {
    setThemeState(current => {
      const next: ThemePreference = current === 'dark' ? 'light' : 'dark'
      setTheme(next)
      return next
    })
  }, [setTheme])

  return { theme, setTheme, toggle }
}
