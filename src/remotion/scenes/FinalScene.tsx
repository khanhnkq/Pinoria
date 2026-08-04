import { AbsoluteFill, Easing, Interactive, interpolate } from 'remotion'
import { Backdrop } from '../components/Backdrop'
import { BrandMark } from '../components/BrandMark'
import { useDurationAt30, useFrameAt30 } from '../utils/useFrameAt30'

type FinalSceneProps = {
  readonly accentColor?: string
}

const MediaFolder = ({ color, label, from }: { readonly color: string; readonly label: string; readonly from: number }) => {
  const frame = useFrameAt30()
  return (
    <div
      style={{
        width: 230,
        height: 186,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 34,
        borderRadius: 28,
        color: '#172133',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 28px 60px rgba(0,0,0,0.24)',
        fontSize: 28,
        fontWeight: 820,
        opacity: interpolate(frame, [from, from + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        translate: interpolate(frame, [from, from + 18], ['0px 54px', '0px 0px'], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.spring({ damping: 200 }) }),
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: -18, width: 104, height: 38, borderRadius: '18px 18px 0 0', backgroundColor: color }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 28, borderTop: `18px solid ${color}` }} />
      {label}
    </div>
  )
}

export const FinalScene = ({ accentColor = '#1688f8' }: FinalSceneProps) => {
  const frame = useFrameAt30()
  const durationInFrames = useDurationAt30()
  const fps = 30

  return (
    <AbsoluteFill style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', color: '#ffffff' }}>
      <Backdrop dark />
      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 1550, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 120, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              <BrandMark size={102} />
              <div style={{ fontSize: 44, fontWeight: 840, letterSpacing: '-0.045em' }}>Pinoria</div>
            </div>
            <Interactive.Div
              name="Final headline"
              style={{
                marginTop: 42,
                fontSize: 96,
                lineHeight: 1.02,
                fontWeight: 850,
                letterSpacing: '-0.068em',
                opacity: interpolate(frame, [0.28 * fps, 0.95 * fps, durationInFrames - 14, durationInFrames - 1], [0, 1, 1, 0], {
                  easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
                  extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                }),
                translate: interpolate(frame, [0.28 * fps, 0.95 * fps], ['0px 42px', '0px 0px'], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) }),
              }}
            >
              Nhanh.
              <br />Riêng tư.
              <br /><span style={{ color: accentColor }}>Cục bộ.</span>
            </Interactive.Div>
            <Interactive.Div
              name="Final subtitle"
              style={{
                marginTop: 30,
                color: '#aebdce',
                fontSize: 34,
                lineHeight: 1.35,
                fontWeight: 520,
                letterSpacing: '-0.02em',
                opacity: interpolate(frame, [0.9 * fps, 1.45 * fps], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) }),
              }}
            >
              Không tài khoản. Không analytics.
              <br />Media của bạn, trên thiết bị của bạn.
            </Interactive.Div>
          </div>

          <div style={{ position: 'relative', height: 640, display: 'grid', placeItems: 'center' }}>
            <div style={{ position: 'absolute', width: 610, height: 610, borderRadius: 999, border: '1px solid rgba(116,194,255,0.18)' }} />
            <div style={{ position: 'absolute', width: 470, height: 470, borderRadius: 999, background: 'radial-gradient(circle, rgba(22,136,248,0.18) 0%, rgba(22,136,248,0) 70%)' }} />
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <MediaFolder color="#1688f8" label="Ảnh" from={24} />
              <MediaFolder color="#e60023" label="Video" from={34} />
              <MediaFolder color="#08a76c" label="GIF" from={44} />
            </div>
            <div style={{ position: 'absolute', bottom: 74, display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)', color: '#c6d3e1', fontSize: 20, fontWeight: 650, opacity: interpolate(frame, [58, 78], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: '#4fe0a2' }} />
              100% xử lý trong trình duyệt
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
