export default function HotelCardSkeleton() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--booking-border)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      {/* Image skeleton */}
      <div style={{
        paddingTop: '65%',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />
      <div style={{ padding: '12px' }}>
        <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, marginBottom: 8, width: '60%' }} />
        <div style={{ height: 16, background: '#f0f0f0', borderRadius: 4, marginBottom: 6, width: '90%' }} />
        <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, marginBottom: 12, width: '45%' }} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <div style={{ width: 34, height: 28, background: '#f0f0f0', borderRadius: 4 }} />
          <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, width: '40%' }} />
        </div>
        <div style={{ height: 16, background: '#f0f0f0', borderRadius: 4, width: '55%', marginLeft: 'auto' }} />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
