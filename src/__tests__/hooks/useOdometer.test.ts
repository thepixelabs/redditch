import { renderHook, act } from '@testing-library/react'
import { useOdometer } from '@/hooks/useOdometer'

// ---------------------------------------------------------------------------
// localStorage mock
// Defined at module scope so the same instance is used across all tests.
// ---------------------------------------------------------------------------

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem:    (key: string) => store[key] ?? null,
    setItem:    (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear:      () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: false,
})

// ---------------------------------------------------------------------------
// Constants that mirror the hook's own keys (avoids importing STORAGE_KEYS
// here so the test doesn't become coupled to the constants module).
// ---------------------------------------------------------------------------

const ODOMETER_KEY = 'redditch:odometer'
const UNIT_KEY     = 'redditch:unit'

// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorageMock.clear()
})

// ---------------------------------------------------------------------------

describe('useOdometer — initial state', () => {
  it('starts with odometerKm = 0 and unit = km when localStorage is empty', () => {
    const { result } = renderHook(() => useOdometer())

    expect(result.current.odometerKm).toBe(0)
    expect(result.current.unit).toBe('km')
  })

  it('starts with displayValue = 0 when localStorage is empty', () => {
    const { result } = renderHook(() => useOdometer())
    expect(result.current.displayValue).toBe(0)
  })

  it('reads odometerKm from localStorage on mount', () => {
    localStorageMock.setItem(ODOMETER_KEY, JSON.stringify(8000))

    const { result } = renderHook(() => useOdometer())
    expect(result.current.odometerKm).toBe(8000)
  })

  it('reads unit from localStorage on mount', () => {
    localStorageMock.setItem(UNIT_KEY, JSON.stringify('mi'))

    const { result } = renderHook(() => useOdometer())
    expect(result.current.unit).toBe('mi')
  })
})

// ---------------------------------------------------------------------------

describe('useOdometer — setting values in km mode', () => {
  it('setDisplayValue stores the value directly as odometerKm when unit is km', () => {
    const { result } = renderHook(() => useOdometer())

    act(() => { result.current.setDisplayValue(12500) })

    expect(result.current.odometerKm).toBe(12500)
    expect(result.current.displayValue).toBe(12500)
  })

  it('persists the km value to localStorage after setDisplayValue', () => {
    const { result } = renderHook(() => useOdometer())

    act(() => { result.current.setDisplayValue(7300) })

    expect(JSON.parse(localStorageMock.getItem(ODOMETER_KEY)!)).toBe(7300)
  })
})

// ---------------------------------------------------------------------------

describe('useOdometer — unit toggling', () => {
  it('toggleUnit switches unit from km to mi', () => {
    const { result } = renderHook(() => useOdometer())

    act(() => { result.current.toggleUnit() })

    expect(result.current.unit).toBe('mi')
  })

  it('toggleUnit switches unit from mi back to km', () => {
    const { result } = renderHook(() => useOdometer())

    act(() => { result.current.toggleUnit() })  // km → mi
    act(() => { result.current.toggleUnit() })  // mi → km

    expect(result.current.unit).toBe('km')
  })

  it('persists the toggled unit to localStorage', () => {
    const { result } = renderHook(() => useOdometer())

    act(() => { result.current.toggleUnit() })

    expect(JSON.parse(localStorageMock.getItem(UNIT_KEY)!)).toBe('mi')
  })
})

// ---------------------------------------------------------------------------

describe('useOdometer — display value conversion', () => {
  it('displayValue converts 1000 km to miles (~621) when unit is mi', () => {
    // kmToMi uses Math.round(km / 1.60934)
    const { result } = renderHook(() => useOdometer())

    act(() => { result.current.setDisplayValue(1000) })  // store 1000 km
    act(() => { result.current.toggleUnit() })            // switch to mi

    // 1000 / 1.60934 ≈ 621.37 → rounds to 621
    expect(result.current.displayValue).toBe(621)
  })

  it('displayValue equals odometerKm exactly when unit is km', () => {
    const { result } = renderHook(() => useOdometer())

    act(() => { result.current.setDisplayValue(4567) })

    expect(result.current.displayValue).toBe(result.current.odometerKm)
  })
})

// ---------------------------------------------------------------------------

describe('useOdometer — setting values in mi mode', () => {
  it('setDisplayValue in miles converts and stores the correct km value', () => {
    const { result } = renderHook(() => useOdometer())

    act(() => { result.current.toggleUnit() })     // switch to mi
    act(() => { result.current.setDisplayValue(621) })  // set 621 mi

    // miToKm uses Math.round(mi * 1.60934): 621 * 1.60934 ≈ 999.4 → 999 km
    expect(result.current.odometerKm).toBeCloseTo(999, -1)  // within ±5
  })

  it('odometerKm always reflects km regardless of active unit', () => {
    const { result } = renderHook(() => useOdometer())

    act(() => { result.current.setDisplayValue(5000) })   // 5000 km stored
    act(() => { result.current.toggleUnit() })             // switch to mi

    // odometerKm must still be 5000 km, not the mi display value
    expect(result.current.odometerKm).toBe(5000)
    expect(result.current.unit).toBe('mi')
    // displayValue should now be in miles
    expect(result.current.displayValue).not.toBe(5000)
  })
})
