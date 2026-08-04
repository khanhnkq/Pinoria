import { AbsoluteFill, Easing, Interactive, interpolate } from 'remotion'
import { Backdrop } from '../components/Backdrop'
import { BrowserFrame } from '../components/BrowserFrame'
import { CheckIcon, DownloadIcon } from '../components/DownloadIcon'
import { Cursor } from '../components/Cursor'
import { PinGrid } from '../components/PinGrid'
import { useFrameAt30 } from '../utils/useFrameAt30'

const QuickActions = ({ frame }: { readonly frame: number }) => {
  const completed = frame >= 118
  return (
    <div style={{ display: 'flex', gap: 9 }}>
      {['#e60023', '#1688f8', '#08a76c'].map((color, index) => (
        <div
          key={color}
          style={{
            width: 50,
            height: 50,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 15,
            color: '#ffffff',
            backgroundColor: color,
            boxShadow: '0 5px 16px rgba(0,0,0,0.20)',
            scale: index === 1 ? interpolate(frame, [112, 118, 126], [1, 0.84, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1,
          }}
        >
          {completed && index === 1 ? <CheckIcon color="#ffffff" /> : <DownloadIcon color="#ffffff" />}
        </div>
      ))}
    </div>
  )
}

export const DownloadScene = () => {
  const frame = useFrameAt30()
  const fps = 30

  return (
    <AbsoluteFill style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', color: '#0d1726' }}>
      <Backdrop />
      <div style={{ position: 'absolute', left: 230, top: 150, opacity: interpolate(frame, [0, 0.8 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) }), scale: interpolate(frame, [0, 0.8 * fps], [0.94, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.spring({ damping: 200 }), output: 'perceptual-scale' }) }}>
        <BrowserFrame>
          <div style={{ height: 92, display: 'flex', alignItems: 'center', gap: 18, padding: '0 30px', borderBottom: '1px solid #f0f1f3' }}>
            <div style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', borderRadius: 999, color: '#ffffff', backgroundColor: '#e60023', fontSize: 28, fontWeight: 900 }}>P</div>
            <div style={{ padding: '12px 18px', borderRadius: 999, backgroundColor: '#111111', color: '#ffffff', fontSize: 18, fontWeight: 750 }}>Trang chủ</div>
            <div style={{ flex: 1, height: 52, display: 'flex', alignItems: 'center', padding: '0 22px', borderRadius: 999, backgroundColor: '#efefef', color: '#7b7b7b', fontSize: 18 }}>⌕  Tìm kiếm</div>
            <div style={{ fontSize: 26 }}>•••</div>
          </div>
          <PinGrid activeIndex={2} progress={interpolate(frame, [42, 58], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} action={<QuickActions frame={frame} />} />
        </BrowserFrame>
      </div>

      <Interactive.Div
        name="Quick download caption"
        style={{
          position: 'absolute',
          left: 80,
          top: 58,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '16px 24px',
          borderRadius: 20,
          backgroundColor: '#ffffff',
          boxShadow: '0 16px 45px rgba(18, 41, 74, 0.12)',
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: '-0.025em',
          opacity: interpolate(frame, [0.55 * fps, 1.1 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          translate: interpolate(frame, [0.55 * fps, 1.1 * fps], ['0px 22px', '0px 0px'], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: 99, backgroundColor: '#1688f8' }} />
        Rê chuột. Chọn màu. Xong.
      </Interactive.Div>

      <div
        style={{
          position: 'absolute',
          right: 98,
          bottom: 62,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '18px 24px',
          borderRadius: 20,
          backgroundColor: '#101722',
          color: '#ffffff',
          boxShadow: '0 20px 60px rgba(5, 12, 22, 0.28)',
          fontSize: 22,
          fontWeight: 680,
          opacity: interpolate(frame, [122, 138, 165, 178], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          translate: interpolate(frame, [122, 138], ['0px 28px', '0px 0px'], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        <CheckIcon color="#4fe0a2" />
        Đã tải vào Downloads/References/Ảnh
      </div>
      <Cursor mode="pin" />
    </AbsoluteFill>
  )
}
