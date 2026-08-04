import { AbsoluteFill } from 'remotion'
import { useFrameAt30 } from '../utils/useFrameAt30'

export const Backdrop = ({ dark = false }: { readonly dark?: boolean }) => {
  const frame = useFrameAt30()

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        backgroundColor: dark ? '#08111f' : '#f6f8fb',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 760,
          height: 760,
          borderRadius: 999,
          top: -360,
          left: -160,
          opacity: dark ? 0.25 : 0.5,
          background: 'radial-gradient(circle, rgba(22,136,248,0.30) 0%, rgba(22,136,248,0) 70%)',
          translate: `${Math.sin(frame / 45) * 30}px ${Math.cos(frame / 55) * 20}px`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: 999,
          right: -320,
          bottom: -430,
          opacity: dark ? 0.18 : 0.42,
          background: 'radial-gradient(circle, rgba(126,203,255,0.30) 0%, rgba(126,203,255,0) 70%)',
          translate: `${Math.cos(frame / 60) * 35}px ${Math.sin(frame / 50) * 24}px`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: dark ? 0.035 : 0.028,
          backgroundImage: 'radial-gradient(currentColor 0.8px, transparent 0.8px)',
          backgroundSize: '20px 20px',
          color: dark ? '#ffffff' : '#0b172a',
        }}
      />
    </AbsoluteFill>
  )
}
