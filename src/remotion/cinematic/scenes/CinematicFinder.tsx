import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'
import { BrandMark } from '../../components/BrandMark'
import { CinematicBackground } from '../components/CinematicBackground'
import { MediaFolderIcon } from '../components/MediaFolderIcon'

const FOLDERS = [
  ['Images', '24 files', '#1688f8'],
  ['Videos', '8 files', '#e60023'],
  ['GIFs', '12 files', '#08a76c'],
] as const

const FinderToolbar = () => (
  <div style={{ position: 'relative', zIndex: 5, height: 88, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #dfe3e8', background: 'linear-gradient(180deg, #f8f8fa 0%, #eceef2 100%)' }}>
    <div style={{ display: 'flex', gap: 10 }}>{['#ff5f57', '#febc2e', '#28c840'].map((color) => <span key={color} style={{ width: 15, height: 15, borderRadius: 99, backgroundColor: color, boxShadow: 'inset 0 0 0 0.7px rgba(0,0,0,0.14)' }} />)}</div>
    <div style={{ display: 'flex', gap: 8, marginLeft: 30 }}><span style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 10, color: '#65717f', backgroundColor: 'rgba(255,255,255,0.72)', fontSize: 25 }}>‹</span><span style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 10, color: '#a3aab4', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: 25 }}>›</span></div>
    <div style={{ marginLeft: 24, color: '#28313d', fontSize: 17, fontWeight: 790 }}>Category 1</div>
    <div style={{ marginLeft: 'auto', display: 'flex', gap: 9 }}>{['▦', '≡', '•••'].map((item) => <span key={item} style={{ minWidth: 36, height: 36, display: 'grid', placeItems: 'center', padding: '0 7px', borderRadius: 10, color: '#66717f', backgroundColor: 'rgba(255,255,255,0.72)', fontSize: 15 }}>{item}</span>)}</div>
  </div>
)

const FinderSidebar = () => (
  <div style={{ width: 230, height: '100%', padding: '28px 18px', borderRight: '1px solid #e2e6eb', backgroundColor: '#f1f7fb' }}>
    <div style={{ margin: '0 11px 12px', color: '#929aa5', fontSize: 11, fontWeight: 820, letterSpacing: '0.08em' }}>FAVORITES</div>
    {['AirDrop', 'Recents', 'Downloads', 'Desktop', 'Documents'].map((item) => <div key={item} style={{ padding: '11px 12px', borderRadius: 10, color: item === 'Downloads' ? '#202936' : '#687381', backgroundColor: item === 'Downloads' ? 'rgba(22,136,248,0.13)' : 'transparent', fontSize: 14, fontWeight: item === 'Downloads' ? 780 : 580 }}><span style={{ display: 'inline-block', width: 22, color: item === 'Downloads' ? '#1688f8' : '#94a0ad' }}>{item === 'Downloads' ? '↓' : '◇'}</span>{item}</div>)}
    <div style={{ marginTop: 26, padding: '12px', border: '1px solid rgba(22,136,248,0.12)', borderRadius: 13, color: '#246fb9', backgroundColor: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: 720 }}>Pinoria<br /><span style={{ color: '#87929f', fontSize: 10, fontWeight: 560 }}>Category 1</span></div>
  </div>
)

const FolderTile = ({ frame, index, name, count, color }: { readonly frame: number; readonly index: number; readonly name: string; readonly count: string; readonly color: string }) => {
  const delay = 18 + index * 7
  const settle = interpolate(frame, [46 + index * 3, 56 + index * 3, 67 + index * 3], [1, 1.055, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', output: 'perceptual-scale' })
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 15, opacity: interpolate(frame, [delay, delay + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), translate: `0px ${interpolate(frame, [delay, delay + 12], [34, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`, scale: interpolate(frame, [delay, delay + 7, delay + 13], [0.8, 1.08, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', output: 'perceptual-scale' }) * settle }}>
      <MediaFolderIcon color={color} id={`finder-${index}`} />
      <div style={{ textAlign: 'center' }}><div style={{ color: '#202936', fontSize: 18, fontWeight: 840 }}>{name}</div><div style={{ marginTop: 4, color: '#85909d', fontSize: 12, fontWeight: 630 }}>{count}</div></div>
    </div>
  )
}

export const CinematicFinder = () => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', color: '#101114' }}>
      <CinematicBackground />
      <div style={{ position: 'absolute', left: 420, top: 210, width: 1080, height: 690, borderRadius: 999, background: 'radial-gradient(circle, rgba(22,136,248,0.17), rgba(22,136,248,0) 68%)', filter: 'blur(28px)', opacity: interpolate(frame, [0, 34, 140], [0, 0.88, 0.34], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), scale: interpolate(frame, [0, 72], [0.84, 1.08], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', output: 'perceptual-scale' }) }} />
      <div style={{ position: 'absolute', left: 230, top: 145, width: 1460, height: 790, overflow: 'hidden', border: '1px solid rgba(24,35,52,0.14)', borderRadius: 28, backgroundColor: '#ffffff', boxShadow: '0 46px 108px rgba(18,41,74,0.20), 0 12px 32px rgba(18,41,74,0.08)', transformOrigin: '50% 100%', transform: `perspective(1900px) rotateX(${interpolate(frame, [0, 20], [6.5, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) })}deg) rotateZ(${interpolate(frame, [0, 20], [-0.9, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}deg)`, opacity: interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), translate: `0px ${interpolate(frame, [0, 22], [48, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`, scale: interpolate(frame, [0, 18, 82, 140, 149], [0.94, 1, 1, 1.018, 1.028], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', output: 'perceptual-scale' }) }}>
        <FinderToolbar />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 88, bottom: 0, display: 'grid', gridTemplateColumns: '230px 1fr', backgroundColor: '#ffffff' }}>
          <FinderSidebar />
          <div style={{ padding: '34px 38px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ color: '#08764a', fontSize: 12, fontWeight: 830, letterSpacing: '0.06em' }}>ORGANIZED BY PINORIA</div><div style={{ color: '#9ba3ad', fontSize: 12 }}>3 folders</div></div>
            <div style={{ marginTop: 17, color: '#7b8794', fontSize: 13, fontWeight: 650 }}><span style={{ color: '#1688f8' }}>Downloads</span><span style={{ margin: '0 10px', color: '#b0b7c0' }}>›</span><span style={{ color: '#1688f8' }}>Pinoria</span><span style={{ margin: '0 10px', color: '#b0b7c0' }}>›</span><span style={{ color: '#27313d', fontWeight: 780 }}>Category 1</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'center', gap: 36, marginTop: 146 }}>{FOLDERS.map(([name, count, color], index) => <FolderTile key={name} frame={frame} index={index} name={name} count={count} color={color} />)}</div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 760, bottom: 54, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: '1px solid rgba(22,136,248,0.14)', borderRadius: 17, color: '#17202c', backgroundColor: 'rgba(255,255,255,0.95)', boxShadow: '0 16px 38px rgba(17,31,52,0.14)', opacity: interpolate(frame, [70, 84], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), translate: `0px ${interpolate(frame, [70, 90], [24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`, scale: interpolate(frame, [70, 84, 92], [0.9, 1.04, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', output: 'perceptual-scale' }) }}><BrandMark size={38} /><div><div style={{ fontSize: 14, fontWeight: 830 }}>Everything in its place.</div><div style={{ marginTop: 2, color: '#7c8794', fontSize: 11 }}>Downloads / Pinoria / Category 1</div></div></div>
    </AbsoluteFill>
  )
}
