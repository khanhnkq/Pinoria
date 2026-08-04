import { AbsoluteFill, Easing, Interactive, interpolate } from 'remotion'
import { Backdrop } from '../components/Backdrop'
import { BrandMark } from '../components/BrandMark'
import { useDurationAt30, useFrameAt30 } from '../utils/useFrameAt30'

type IntroSceneProps = {
  readonly accentColor?: string
}

export const IntroScene = ({ accentColor = '#1688f8' }: IntroSceneProps) => {
  const frame = useFrameAt30()
  const durationInFrames = useDurationAt30()
  const fps = 30

  return (
    <AbsoluteFill style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', color: '#0d1726' }}>
      <Backdrop />
      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 1480, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', alignItems: 'center', gap: 80 }}>
          <div>
            <Interactive.Div
              name="Eyebrow"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 18px',
                borderRadius: 999,
                backgroundColor: '#e7f3ff',
                color: '#0b6ed0',
                fontSize: 26,
                fontWeight: 750,
                letterSpacing: '-0.02em',
                opacity: interpolate(frame, [0, 0.55 * fps], [0, 1], {
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
                translate: interpolate(frame, [0, 0.55 * fps], ['0px 24px', '0px 0px'], {
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              <span style={{ width: 12, height: 12, borderRadius: 99, backgroundColor: accentColor }} />
              Chrome extension · Local-first
            </Interactive.Div>
            <Interactive.Div
              name="Main headline"
              style={{
                marginTop: 34,
                fontSize: 118,
                lineHeight: 0.94,
                fontWeight: 850,
                letterSpacing: '-0.075em',
                opacity: interpolate(frame, [0.18 * fps, 0.95 * fps], [0, 1], {
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
                translate: interpolate(frame, [0.18 * fps, 0.95 * fps], ['0px 48px', '0px 0px'], {
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              Pin it.
              <br />
              <span style={{ color: accentColor }}>Keep it.</span>
            </Interactive.Div>
            <Interactive.Div
              name="Intro subtitle"
              style={{
                width: 700,
                marginTop: 34,
                color: '#536174',
                fontSize: 39,
                lineHeight: 1.28,
                fontWeight: 540,
                letterSpacing: '-0.025em',
                opacity: interpolate(frame, [0.72 * fps, 1.35 * fps, durationInFrames - 20, durationInFrames - 1], [0, 1, 1, 0], {
                  easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear, Easing.bezier(0.7, 0, 0.84, 0)],
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              Tải media Pinterest vào đúng folder — chỉ với một cú nhấp.
            </Interactive.Div>
          </div>

          <div
            style={{
              position: 'relative',
              height: 620,
              display: 'grid',
              placeItems: 'center',
              opacity: interpolate(frame, [0.35 * fps, 1.2 * fps], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              scale: interpolate(frame, [0.35 * fps, 1.2 * fps], [0.78, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.spring({ damping: 200 }),
                output: 'perceptual-scale',
              }),
              rotate: interpolate(frame, [0.35 * fps, 1.2 * fps], ['-8deg', '0deg'], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.spring({ damping: 200 }),
              }),
            }}
          >
            <div style={{ position: 'absolute', width: 470, height: 470, borderRadius: 999, backgroundColor: '#dff0ff', filter: 'blur(2px)' }} />
            <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: 999, border: '2px solid rgba(22,136,248,0.16)' }} />
            <BrandMark size={270} />
            <div style={{ position: 'absolute', right: 34, top: 92, padding: '14px 20px', borderRadius: 18, color: '#08703e', backgroundColor: '#dff8eb', fontSize: 24, fontWeight: 750, boxShadow: '0 16px 30px rgba(8,112,62,0.10)' }}>✓ Đã tải</div>
            <div style={{ position: 'absolute', left: 22, bottom: 94, padding: '14px 20px', borderRadius: 18, color: '#1f5fa0', backgroundColor: '#e7f3ff', fontSize: 24, fontWeight: 750, boxShadow: '0 16px 30px rgba(31,95,160,0.10)' }}>Ảnh · Video · GIF</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
