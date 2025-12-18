import type { Metadata } from 'next'
import '@styles/global.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { LayoutWrapper } from '@components/LayoutWrapper'
import { APP_CONFIG } from '@/config/app.config'
import { getCurrentUser } from '@/lib/auth/authHelpers'

export const metadata: Metadata = {
  title: APP_CONFIG.appName,
  description: APP_CONFIG.description,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Check authentication server-side (for data fetching, not redirection)
  const user = await getCurrentUser()

  return (
    <html lang="en">
      <body>
        {user ? (
          <LayoutWrapper user={user}>{children}</LayoutWrapper>
        ) : (
          children
        )}
      </body>
    </html>
  )
}
