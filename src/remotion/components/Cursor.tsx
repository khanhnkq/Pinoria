import { Easing, interpolate } from 'remotion'
import { useFrameAt30 } from '../utils/useFrameAt30'

type CursorProps = {
  readonly mode: 'settings' | 'pin' | 'board'
}

export const Cursor = ({ mode }: CursorProps) => {
  const frame = useFrameAt30()

  const keyframes = mode === 'settings'
    ? { x: [1510, 1320, 1230], y: [920, 800, 755], frames: [0, 45, 80] }
    : mode === 'pin'
      ? { x: [1530, 1120, 988, 988], y: [860, 500, 575, 575], frames: [0, 48, 82, 118] }
      : { x: [1530, 1434, 1434], y: [820, 230, 264], frames: [0, 55, 95] }

  const lastFrame = keyframes.frames[keyframes.frames.length - 1] ?? 1
  const x = interpolate(frame, keyframes.frames, keyframes.x, {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const y = interpolate(frame, keyframes.frames, keyframes.y, {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const clickFrame = mode === 'settings' ? 80 : mode === 'pin' ? 118 : 95
  const clicking = interpolate(frame, [clickFrame - 4, clickFrame, clickFrame + 6], [1, 0.78, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 50,
        translate: `${x}px ${y}px`,
        scale: clicking,
        opacity: interpolate(frame, [0, 10, lastFrame + 30, lastFrame + 42], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        filter: 'drop-shadow(0 5px 7px rgba(0,0,0,0.24))',
      }}
    >
      <svg width="46" height="54" viewBox="0 0 46 54" fill="none" aria-hidden="true">
        <path d="M5 3L39 29H23L16 47L5 3Z" fill="white" stroke="#101827" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
