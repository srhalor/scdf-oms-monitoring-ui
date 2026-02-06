import type { Metadata } from 'next'
import localFont from 'next/font/local'
import '@styles/global.css'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { LayoutWrapper } from '@components/LayoutWrapper'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { APP_CONFIG } from '@/config/app.config'
import { getCurrentUser } from '@/lib/auth/authHelpers'

const basePath = process.env.NEXT_PUBLIC_BASEPATH || ''

// Load all GCOSans font variants (next/font automatically handles basePath)
const gcoSans = localFont({
  src: [
    // Regular (400)
    {
      path: '../../public/fonts/GCOSans.woff2',
      weight: '400',
      style: 'normal',
    },
    // Regular Italic (400)
    {
      path: '../../public/fonts/GCOSans-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    // Medium (500)
    {
      path: '../../public/fonts/GCOSans-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    // Medium Italic (500)
    {
      path: '../../public/fonts/GCOSans-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    // Bold (600)
    {
      path: '../../public/fonts/GCOSans-Bold.woff2',
      weight: '600',
      style: 'normal',
    },
    // Bold (700)
    {
      path: '../../public/fonts/GCOSans-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    // Bold Italic (700)
    {
      path: '../../public/fonts/GCOSans-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-gco-sans',
  display: 'swap',
  // Fallback to .woff handled by browser if .woff2 not supported
})

export const metadata: Metadata = {
  title: APP_CONFIG.appName,
  description: APP_CONFIG.description,
  icons: {
    icon: `${basePath}/favicon.svg`,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Check authentication server-side (for data fetching, not redirection)
  const user = await getCurrentUser()

  return (
    <html lang="en" className={gcoSans.variable}>
      <body>
        <ErrorBoundary>
          {user ? (
            <LayoutWrapper user={user}>{children}</LayoutWrapper>
          ) : (
            children
          )}
        </ErrorBoundary>
      </body>
    </html>
  )
}
