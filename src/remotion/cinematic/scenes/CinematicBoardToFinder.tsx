import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from 'remotion'
import { CinematicBoard } from './CinematicBoard'
import { CinematicFinder } from './CinematicFinder'

const BRIDGE_FILES = [
  { type: 'JPG', color: '#1688f8', targetX: 660, targetY: 570 },
  { type: 'MP4', color: '#e60023', targetX: 1015, targetY: 595 },
  { type: 'GIF', color: '#08a76c', targetX: 1365, targetY: 570 },
] as const

const BridgeFile = ({ frame, index }: { readonly frame: number; readonly index: number }) => {
  const file = BRIDGE_FILES[index] ?? BRIDGE_FILES[0]
  const start = 108 + index * 4
  const end = 140 + index * 4
  const travel = interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) })
  const x = 1540 * (1 - travel) + file.targetX * travel
  const y = 285 * (1 - travel) + file.targetY * travel - Math.sin(travel * Math.PI) * (170 + index * 22)
  return (
    <div style={{ position: 'absolute', zIndex: 120, left: x, top: y, width: 74, height: 90, border: '2px solid rgba(255,255,255,0.88)', borderRadius: 13, backgroundColor: '#ffffff', boxShadow: `0 18px 38px ${file.color}42`, opacity: interpolate(frame, [start - 4, start, end - 3, end + 7], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), rotate: `${interpolate(travel, [0, 0.5, 1], [index % 2 === 0 ? -14 : 14, index % 2 === 0 ? 12 : -12, 0])}deg`, scale: interpolate(travel, [0, 0.48, 1], [0.68, 1.14, 0.56], { output: 'perceptual-scale' }) }}>
      <div style={{ position: 'absolute', right: -2, top: -2, width: 25, height: 25, borderLeft: '1px solid #dce1e7', borderBottom: '1px solid #dce1e7', borderRadius: '0 12px 0 8px', backgroundColor: '#eef2f6' }} />
      <div style={{ position: 'absolute', left: 10, bottom: 11, padding: '5px 7px', borderRadius: 7, color: '#ffffff', backgroundColor: file.color, fontSize: 10, fontWeight: 880 }}>{file.type}</div>
    </div>
  )
}

export const CinematicBoardToFinder = () => {
  const frame = useCurrentFrame()
  const boardOpacity = interpolate(frame, [112, 132], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const finderOpacity = interpolate(frame, [108, 130], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Sequence durationInFrames={140} layout="none">
        <AbsoluteFill style={{ opacity: boardOpacity, filter: `blur(${interpolate(frame, [116, 132], [0, 3.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`, scale: interpolate(frame, [112, 132], [1, 0.985], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', output: 'perceptual-scale' }) }}><CinematicBoard /></AbsoluteFill>
      </Sequence>
      <Sequence from={90} durationInFrames={150} layout="none">
        <AbsoluteFill style={{ opacity: finderOpacity, scale: interpolate(frame, [108, 132], [1.035, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', output: 'perceptual-scale' }) }}><CinematicFinder /></AbsoluteFill>
      </Sequence>
      <div style={{ position: 'absolute', zIndex: 115, left: 1510, top: 250, width: 110, height: 110, border: '4px solid #1688f8', borderRadius: 999, opacity: interpolate(frame, [104, 110, 124], [0, 0.72, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), scale: interpolate(frame, [104, 124], [0.35, 2.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', output: 'perceptual-scale' }) }} />
      {[0, 1, 2].map((index) => <BridgeFile key={index} frame={frame} index={index} />)}
    </AbsoluteFill>
  )
}
