import { AbsoluteFill, Easing, Interactive, interpolate } from 'remotion'
import { Backdrop } from '../components/Backdrop'
import { BrowserFrame } from '../components/BrowserFrame'
import { CheckIcon } from '../components/DownloadIcon'
import { Cursor } from '../components/Cursor'
import { PinGrid } from '../components/PinGrid'
import { useFrameAt30 } from '../utils/useFrameAt30'

export const BoardScene = () => {
  const frame = useFrameAt30()
  const fps = 30
  const progress = Math.round(interpolate(frame, [100, 150], [8, 84], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))

  return (
    <AbsoluteFill style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', color: '#0d1726' }}>
      <Backdrop />
      <div style={{ position: 'absolute', left: 230, top: 155, opacity: interpolate(frame, [0, 0.7 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) }) }}>
        <BrowserFrame title="pinterest.com/board/design-reference">
          <div style={{ position: 'relative', zIndex: 5, height: 145, padding: '22px 32px 18px', borderBottom: '1px solid #f0f1f3', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#8a9099', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Board</div>
                <div style={{ marginTop: 4, fontSize: 34, fontWeight: 850, letterSpacing: '-0.04em' }}>Design references</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 310, height: 50, display: 'flex', alignItems: 'center', padding: '0 18px', borderRadius: 999, backgroundColor: '#efefef', color: '#777', fontSize: 17 }}>⌕ Search this board</div>
                <div
                  style={{
                    minWidth: 174,
                    height: 50,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 999,
                    backgroundColor: frame < 100 ? '#e60023' : frame < 154 ? '#111111' : '#098759',
                    color: '#ffffff',
                    fontSize: 17,
                    fontWeight: 800,
                    scale: interpolate(frame, [90, 96, 104], [1, 0.95, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                  }}
                >
                  {frame < 100 ? 'Tải board' : frame < 154 ? `Đang tải ${progress}/84` : 'Đã tải 84 Pin'}
                </div>
              </div>
            </div>
          </div>
          <div style={{ translate: `0px ${interpolate(frame, [102, 158], [0, -150], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) })}px` }}>
            <PinGrid />
          </div>
          <div style={{ position: 'absolute', zIndex: 6, left: 0, right: 0, top: 140, height: 6, backgroundColor: '#f0f1f3', opacity: interpolate(frame, [96, 105], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            <div style={{ width: `${interpolate(frame, [100, 154], [2, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}%`, height: '100%', borderRadius: 99, backgroundColor: '#1688f8' }} />
          </div>
        </BrowserFrame>
      </div>

      <Interactive.Div
        name="Board download caption"
        style={{
          position: 'absolute',
          left: 86,
          top: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '16px 24px',
          borderRadius: 20,
          backgroundColor: '#ffffff',
          boxShadow: '0 16px 45px rgba(18, 41, 74, 0.12)',
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: '-0.025em',
          opacity: interpolate(frame, [0.4 * fps, 1 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          translate: interpolate(frame, [0.4 * fps, 1 * fps], ['0px 24px', '0px 0px'], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: 99, backgroundColor: '#e60023' }} />
        Cả board. Một lần bấm.
      </Interactive.Div>

      <div style={{ position: 'absolute', right: 90, bottom: 54, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 22px', borderRadius: 20, color: '#087145', backgroundColor: '#e4f8ee', fontSize: 21, fontWeight: 720, opacity: interpolate(frame, [152, 162], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
        <CheckIcon color="#087145" /> 84 Pin đã được phân loại
      </div>
      <Cursor mode="board" />
    </AbsoluteFill>
  )
}
