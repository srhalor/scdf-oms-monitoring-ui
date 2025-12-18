import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
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
  // Get current pathname from headers
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || headersList.get('referer') || ''
  const isLoginPage = pathname.includes('/login')

  // Check authentication server-side
  const user = await getCurrentUser()

  // Redirect to login if not authenticated (unless already on login page)
  if (!user && !isLoginPage) {
    redirect('/login')
  }

  // Render without layout for login page
  if (!user || isLoginPage) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    )
  }

  // Authenticated - render with layout
  return (
    <html lang="en">
      <body>
        <LayoutWrapper user={user}>{children}</LayoutWrapper>
      </body>
    </html>
  )
}
