export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 60px)',
        padding: '24px',
      }}
    >
      <h1 style={{ fontSize: '48px', fontWeight: 700, marginBottom: '16px' }}>404</h1>
      <p style={{ fontSize: '18px', color: 'var(--color-gray-600)' }}>
        Page not found
      </p>
    </div>
  )
}
