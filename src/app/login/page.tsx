import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth/authHelpers'
import { LoginForm } from '@/components/auth/LoginForm'
import { Logo } from '@/components/Header/Logo'
import { APP_CONFIG } from '@/config/app.config'
import styles from './page.module.css'

/**
 * Login Page - Server Component
 * Checks authentication server-side before rendering
 */
export default async function LoginPage() {
  // Redirect to dashboard if already authenticated
  const authenticated = await isAuthenticated()
  if (authenticated) {
    redirect('/dashboard')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoSection}>
          <Logo size="lg" />
        </div>

        <h1 className={styles.title}>{APP_CONFIG.appName}</h1>
        <p className={styles.subtitle}>Secure Authentication</p>

        <LoginForm />
      </div>
    </div>
  )
}
