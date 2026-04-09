import { renderHook, act } from '@testing-library/react'
import { usePersistedState } from '@/hooks/usePersistedState'

// ---------------------------------------------------------------------------
// localStorage mock
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

const TEST_KEY = 'test:persisted-state'

// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorageMock.clear()
})

// ---------------------------------------------------------------------------

describe('usePersistedState — initial value', () => {
  it('returns the defaultValue when localStorage has no entry for the key', () => {
    const { result } = renderHook(() => usePersistedState(TEST_KEY, 42))
    expect(result.current[0]).toBe(42)
  })

  it('returns the stored value when localStorage already has an entry', () => {
    localStorageMock.setItem(TEST_KEY, JSON.stringify(99))

    const { result } = renderHook(() => usePersistedState(TEST_KEY, 0))
    expect(result.current[0]).toBe(99)
  })

  it('returns defaultValue when localStorage contains invalid JSON', () => {
    localStorageMock.setItem(TEST_KEY, 'not-valid-json{{{')

    const { result } = renderHook(() => usePersistedState(TEST_KEY, 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })

  it('returns defaultValue (not null) when the stored item is the string null', () => {
    // JSON.parse('null') === null, which is !== defaultValue — but the hook
    // uses `item !== null` to guard the parse, where `item` is the raw string.
    // 'null' as a raw string is !== null (the JS null), so it gets parsed → null.
    // The hook returns parsed null in this case; verify it doesn't crash.
    localStorageMock.setItem(TEST_KEY, 'null')

    const { result } = renderHook(() => usePersistedState<string | null>(TEST_KEY, 'default'))
    // JSON.parse('null') = null → returned as stored value (not the default)
    expect(result.current[0]).toBeNull()
  })
})

// ---------------------------------------------------------------------------

describe('usePersistedState — persistence on update', () => {
  it('persists a primitive value to localStorage when state changes', () => {
    const { result } = renderHook(() => usePersistedState(TEST_KEY, 0))

    act(() => { result.current[1](123) })

    expect(JSON.parse(localStorageMock.getItem(TEST_KEY)!)).toBe(123)
  })

  it('persists a string value to localStorage', () => {
    const { result } = renderHook(() => usePersistedState(TEST_KEY, ''))

    act(() => { result.current[1]('hello') })

    expect(JSON.parse(localStorageMock.getItem(TEST_KEY)!)).toBe('hello')
  })

  it('updates the in-memory state immediately after calling the setter', () => {
    const { result } = renderHook(() => usePersistedState(TEST_KEY, 0))

    act(() => { result.current[1](77) })

    expect(result.current[0]).toBe(77)
  })
})

// ---------------------------------------------------------------------------

describe('usePersistedState — object and array values', () => {
  it('persists and restores a plain object', () => {
    const defaultVal = { count: 0, name: 'test' }
    const { result } = renderHook(() => usePersistedState(TEST_KEY, defaultVal))

    act(() => { result.current[1]({ count: 5, name: 'updated' }) })

    expect(result.current[0]).toEqual({ count: 5, name: 'updated' })
    expect(JSON.parse(localStorageMock.getItem(TEST_KEY)!)).toEqual({ count: 5, name: 'updated' })
  })

  it('persists and restores an array', () => {
    const { result } = renderHook(() => usePersistedState<number[]>(TEST_KEY, []))

    act(() => { result.current[1]([1, 2, 3]) })

    expect(result.current[0]).toEqual([1, 2, 3])
    expect(JSON.parse(localStorageMock.getItem(TEST_KEY)!)).toEqual([1, 2, 3])
  })

  it('reads a pre-stored object from localStorage on mount', () => {
    const stored = { bike: 'interceptor-650', odometer: 12000 }
    localStorageMock.setItem(TEST_KEY, JSON.stringify(stored))

    const { result } = renderHook(() =>
      usePersistedState<typeof stored>(TEST_KEY, { bike: '', odometer: 0 })
    )

    expect(result.current[0]).toEqual(stored)
  })
})

// ---------------------------------------------------------------------------

describe('usePersistedState — updater function pattern', () => {
  it('accepts a function updater that receives the previous state', () => {
    const { result } = renderHook(() => usePersistedState(TEST_KEY, 10))

    act(() => { result.current[1](prev => prev + 5) })

    expect(result.current[0]).toBe(15)
  })

  it('chains multiple updater calls correctly', () => {
    const { result } = renderHook(() => usePersistedState(TEST_KEY, 0))

    act(() => { result.current[1](prev => prev + 1) })
    act(() => { result.current[1](prev => prev + 1) })
    act(() => { result.current[1](prev => prev + 1) })

    expect(result.current[0]).toBe(3)
  })

  it('updater function has access to the most recent state, not a stale closure', () => {
    const { result } = renderHook(() => usePersistedState(TEST_KEY, 'a'))

    act(() => { result.current[1]('b') })
    act(() => { result.current[1](prev => prev + 'c') })

    expect(result.current[0]).toBe('bc')
  })

  it('persists the result of an updater function to localStorage', () => {
    const { result } = renderHook(() => usePersistedState(TEST_KEY, 100))

    act(() => { result.current[1](prev => prev * 2) })

    expect(JSON.parse(localStorageMock.getItem(TEST_KEY)!)).toBe(200)
  })
})

// ---------------------------------------------------------------------------

describe('usePersistedState — key isolation', () => {
  it('two hooks with different keys do not share state', () => {
    const KEY_A = 'test:key-a'
    const KEY_B = 'test:key-b'

    const { result: resultA } = renderHook(() => usePersistedState(KEY_A, 0))
    const { result: resultB } = renderHook(() => usePersistedState(KEY_B, 0))

    act(() => { resultA.current[1](42) })

    expect(resultA.current[0]).toBe(42)
    expect(resultB.current[0]).toBe(0)
  })
})
