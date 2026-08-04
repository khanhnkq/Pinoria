import type { ReactNode } from 'react'

const PIN_COLORS = [
  ['#f6bfad', '#8a4138'],
  ['#bcd9ce', '#315d4e'],
  ['#d4c7ef', '#5d477e'],
  ['#f1dca6', '#7a6130'],
  ['#b8d9f7', '#345d85'],
  ['#e8b9cf', '#7f3f5e'],
] as const

const PinArtwork = ({ index, height }: { readonly index: number; readonly height: number }) => {
  const colors = PIN_COLORS[index % PIN_COLORS.length] ?? PIN_COLORS[0]
  return (
    <div
      style={{
        position: 'relative',
        height,
        overflow: 'hidden',
        borderRadius: 26,
        background: `linear-gradient(145deg, ${colors[0]} 0%, #ffffff 48%, ${colors[1]} 140%)`,
      }}
    >
      <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: 999, top: 34, right: -15, backgroundColor: colors[1], opacity: 0.17 }} />
      <div style={{ position: 'absolute', width: 110, height: 190, borderRadius: '70px 70px 28px 28px', bottom: -28, left: 36, rotate: '-12deg', backgroundColor: colors[1], opacity: 0.72 }} />
      <div style={{ position: 'absolute', width: 130, height: 20, borderRadius: 99, bottom: 38, right: 24, backgroundColor: '#ffffff', opacity: 0.72 }} />
      <div style={{ position: 'absolute', width: 88, height: 16, borderRadius: 99, bottom: 18, right: 40, backgroundColor: '#ffffff', opacity: 0.48 }} />
    </div>
  )
}

type PinGridProps = {
  readonly activeIndex?: number
  readonly action?: ReactNode
  readonly actionIndices?: readonly number[]
  readonly actionOverlayColor?: string
  readonly progress?: number
}

export const PinGrid = ({ activeIndex = -1, action, actionIndices = [], actionOverlayColor = 'rgba(10, 15, 24, 0.18)', progress = 0 }: PinGridProps) => {
  const heights = [260, 350, 285, 330, 248, 310, 288, 360, 278, 330]
  return (
    <div style={{ padding: '26px 32px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20, alignItems: 'start' }}>
      {heights.map((height, index) => (
        <div key={`${height}-${index}`} style={{ display: 'grid', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <PinArtwork index={index} height={height} />
            {index === activeIndex || actionIndices.includes(index) ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  padding: 16,
                  borderRadius: 26,
                  backgroundColor: actionOverlayColor,
                  opacity: progress,
                }}
              >
                {action}
              </div>
            ) : null}
          </div>
          <div style={{ width: `${66 + (index % 3) * 8}%`, height: 12, borderRadius: 99, backgroundColor: '#e8e8e8' }} />
        </div>
      ))}
    </div>
  )
}
