'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/Button'
import { logger } from '@/lib/logger'
import styles from './LoginForm.module.css'

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    logger.info('LoginForm', 'Login attempt initiated')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        logger.warn('LoginForm', 'Login failed', { error: data.error })
        throw new Error(data.error || 'Login failed')
      }

      logger.info('LoginForm', 'Login successful, redirecting to dashboard')
      // Redirect to dashboard on success
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      logger.error('LoginForm', 'Login error', err)
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className={styles.form}>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <Button
        type="submit"
        hierarchy="primary"
        size="lg"
        disabled={isLoading}
        loading={isLoading}
        fullWidth
      >
        {isLoading ? 'Authenticating...' : 'Login with Client Credentials'}
      </Button>

      <p className={styles.note}>Development mode authentication</p>
    </form>
  )
}
