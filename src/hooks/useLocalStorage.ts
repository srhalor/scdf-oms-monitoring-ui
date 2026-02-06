import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react'
import { logger } from '@/lib/logger'

export interface UseLocalStorageOptions<T> {
  /** Custom serializer (default: JSON.stringify) */
  serializer?: (value: T) => string
  /** Custom deserializer (default: JSON.parse) */
  deserializer?: (value: string) => T
  /** Whether to sync state across tabs/windows (default: true) */
  syncData?: boolean
  /** Callback when value changes from another tab */
  onCrossTabSync?: (newValue: T) => void
}

export type UseLocalStorageReturn<T> = [
  T,
  Dispatch<SetStateAction<T>>,
  {
    remove: () => void
    refresh: () => void
  }
]

/**
 * useLocalStorage Hook
 *
 * Type-safe localStorage hook with SSR safety, cross-tab synchronization,
 * and custom serialization support.
 *
 * Features:
 * - Type-safe storage access with TypeScript generics
 * - SSR-safe (checks for window availability)
 * - Cross-tab/window synchronization via storage events
 * - Custom serialization/deserialization support
 * - Automatic error handling and recovery
 * - setState API compatible with React's useState
 *
 * @example Basic usage
 * ```tsx
 * function UserSettings() {
 *   const [theme, setTheme] = useLocalStorage('theme', 'light')
 *
 *   return (
 *     <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *       Toggle Theme (Current: {theme})
 *     </Button>
 *   )
 * }
 * ```
 *
 * @example With object storage
 * ```tsx
 * interface User {
 *   name: string
 *   email: string
 * }
 *
 * function UserProfile() {
 *   const [user, setUser, { remove }] = useLocalStorage<User>('user', {
 *     name: '',
 *     email: ''
 *   })
 *
 *   return (
 *     <div>
 *       <input value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
 *       <Button onClick={remove}>Clear User</Button>
 *     </div>
 *   )
 * }
 * ```
 *
 * @example With cross-tab sync callback
 * ```tsx
 * const [count, setCount] = useLocalStorage('count', 0, {
 *   onCrossTabSync: (newValue) => {
 *     console.log('Count updated in another tab:', newValue)
 *   }
 * })
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    syncData = true,
    onCrossTabSync,
  } = options

  // Get initial value from localStorage or use provided initial value
  const getStoredValue = useCallback((): T => {
    // SSR safety check
    if (globalThis.window === undefined) {
      return initialValue
    }

    try {
      const item = globalThis.localStorage.getItem(key)
      return item ? deserializer(item) : initialValue
    } catch (error) {
      logger.warn(`Error reading localStorage key "${key}":`, error instanceof Error ? error.message : String(error))
      return initialValue
    }
  }, [key, initialValue, deserializer])

  const [storedValue, setStoredValue] = useState<T>(getStoredValue)

  // Update localStorage when state changes
  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      try {
        // Allow value to be a function (like useState)
        const valueToStore = (typeof value === 'function' && !(value as object instanceof Date))
          ? (value as (prevState: T) => T)(storedValue)
          : value

        setStoredValue(valueToStore)

        // SSR safety check
        if (globalThis.window !== undefined) {
          globalThis.localStorage.setItem(key, serializer(valueToStore))
        }
      } catch (error) {
        logger.error(`Error setting localStorage key "${key}":`, error instanceof Error ? error.message : String(error))
      }
    },
    [key, storedValue, serializer]
  )

  // Remove item from localStorage
  const remove = useCallback(() => {
    try {
      if (globalThis.window !== undefined) {
        globalThis.localStorage.removeItem(key)
        setStoredValue(initialValue)
      }
    } catch (error) {
      logger.error(`Error removing localStorage key "${key}":`, error instanceof Error ? error.message : String(error))
    }
  }, [key, initialValue])

  // Refresh value from storage (useful after manual localStorage changes)
  const refresh = useCallback(() => {
    setStoredValue(getStoredValue())
  }, [getStoredValue])

  // Sync state across tabs/windows
  useEffect(() => {
    if (!syncData || globalThis.window === undefined) {
      return
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = deserializer(e.newValue)
          setStoredValue(newValue)
          onCrossTabSync?.(newValue)
        } catch (error) {
          logger.warn(`Error parsing storage event for key "${key}":`, error instanceof Error ? error.message : String(error))
        }
      }
    }

    globalThis.addEventListener('storage', handleStorageChange)
    return () => globalThis.removeEventListener('storage', handleStorageChange)
  }, [key, syncData, deserializer, onCrossTabSync])

  return [storedValue, setValue, { remove, refresh }]
}
