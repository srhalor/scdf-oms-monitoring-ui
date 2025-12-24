import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-description">Page not found</p>
      <Link href="/dashboard" className="not-found-link">
        Return to Dashboard
      </Link>
    </div>
  )
}
