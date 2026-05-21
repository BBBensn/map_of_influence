interface Props {
  message?: string
}

export function LoadingOverlay({ message = 'Loading…' }: Props) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(10,10,15,0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 200,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid rgba(99,102,241,0.2)',
          borderTop: '2px solid #6366f1',
          borderRadius: '50%',
          margin: '0 auto 12px',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{
          color: '#64748b',
          fontSize: '13px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {message}
        </div>
      </div>
    </div>
  )
}
