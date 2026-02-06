import { useState, useCallback } from 'react'

export interface UseClipboardOptions {
  /** Duration in milliseconds to show success state (default: 2000) */
  successDuration?: number
  /** Callback when copy succeeds */
  onSuccess?: () => void
  /** Callback when copy fails */
  onError?: (error: Error) => void
}

export interface UseClipboardReturn {
  /** Whether the text was recently copied (for showing feedback) */
  isCopied: boolean
  /** Whether a copy operation is in progress */
  isLoading: boolean
  /** Error from the last copy attempt */
  error: Error | null
  /** Function to copy text to clipboard */
  copy: (text: string) => Promise<boolean>
  /** Function to reset the copied state manually */
  reset: () => void
}

/**
 * useClipboard Hook
 *
 * Provides copy-to-clipboard functionality with success feedback and error handling.
 *
 * Features:
 * - Async clipboard API with fallback to execCommand
 * - Success state management for UI feedback
 * - Error handling and reporting
 * - Automatic state reset after success duration
 * - SSR-safe (checks for navigator.clipboard availability)
 *
 * @example
 * ```tsx
 * function CopyButton({ text }: { text: string }) {
 *   const { isCopied, copy } = useClipboard()
 *
 *   return (
 *     <Button onClick={() => copy(text)}>
 *       {isCopied ? 'Copied!' : 'Copy'}
 *     </Button>
 *   )
 * }
 * ```
 *
 * @example With callbacks
 * ```tsx
 * const { copy } = useClipboard({
 *   successDuration: 3000,
 *   onSuccess: () => console.log('Copied!'),
 *   onError: (err) => console.error('Copy failed:', err)
 * })
 * ```
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { successDuration = 2000, onSuccess, onError } = options

  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const reset = useCallback(() => {
    setIsCopied(false)
    setError(null)
  }, [])

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      // SSR safety check
      if (globalThis.window === undefined || typeof navigator === 'undefined') {
        const err = new Error('Clipboard API not available in this environment')
        setError(err)
        onError?.(err)
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        // Try modern Clipboard API first
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
        } else {
          // Fallback to deprecated execCommand for older browsers
          const textArea = document.createElement('textarea')
          textArea.value = text
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()

          // Using deprecated execCommand as fallback for older browsers
          // NOSONAR typescript:S1874 - Intentional use for backward compatibility
          const successful = document.execCommand('copy')
          textArea.remove()

          if (!successful) {
            throw new Error('execCommand copy failed')
          }
        }

        setIsCopied(true)
        setIsLoading(false)
        onSuccess?.()

        // Auto-reset after success duration
        setTimeout(() => {
          setIsCopied(false)
        }, successDuration)

        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to copy to clipboard')
        setError(error)
        setIsLoading(false)
        onError?.(error)
        return false
      }
    },
    [successDuration, onSuccess, onError]
  )

  return {
    isCopied,
    isLoading,
    error,
    copy,
    reset,
  }
}
