import type { ReactNode } from 'react'

export const CinematicScreen = ({ children }: { readonly children: ReactNode }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: 1480,
        height: 790,
        overflow: 'hidden',
        border: '6px solid #080b10',
        borderBottomWidth: 14,
        borderRadius: '36px 36px 26px 26px',
        background: 'linear-gradient(135deg, #f5dfb8 0%, #a6d9f8 28%, #1478df 60%, #67c9f7 100%)',
        boxShadow: '0 48px 100px rgba(18, 40, 70, 0.24)',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, rgba(255,255,255,0.28), transparent 42%, rgba(0,62,145,0.20))' }} />
      <div style={{ position: 'absolute', left: 30, right: 30, top: 17, display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.82)', fontSize: 13, fontWeight: 700 }}>
        <span>Pinoria</span><span>● ● ● &nbsp; Tue 14:24</span>
      </div>
      {children}
    </div>
  )
}
