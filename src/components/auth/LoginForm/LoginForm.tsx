'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ValidationErrors } from '@/components/ui/ValidationErrors'
import { useApiMutation } from '@/hooks'
import { logger } from '@/lib/logger'
import styles from './LoginForm.module.css'

const LOG_CONTEXT = 'LoginForm'

interface LoginResponse {
  success: boolean
  message?: string
}

export function LoginForm() {
  const router = useRouter()

  const { mutate: login, loading, error } = useApiMutation<LoginResponse, void>({
    mutationFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASEPATH || ''}/api/auth/login`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw data // Backend ErrorResponseDto
      }

      return response.json()
    },
    onSuccess: () => {
      logger.info(LOG_CONTEXT, 'Login successful, redirecting to dashboard')
      router.push('/dashboard')
      router.refresh()
    },
    onError: (err) => {
      logger.error(LOG_CONTEXT, 'Login failed', {
        status: err.status,
        message: err.message,
      })
    },
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    logger.info(LOG_CONTEXT, 'Login attempt initiated')
    await login()
  }

  return (
    <form onSubmit={handleLogin} className={styles.form}>
      {error && !error.errors && (
        <div className={styles.error} role="alert">
          {error.message || 'Login failed'}
        </div>
      )}

      {error?.errors && <ValidationErrors errors={error.errors} />}

      <Button
        type="submit"
        hierarchy="primary"
        size="lg"
        disabled={loading}
        loading={loading}
        fullWidth
      >
        {loading ? 'Authenticating...' : 'Login with Client Credentials'}
      </Button>

      <p className={styles.note}>Development mode authentication</p>
    </form>
  )
}
