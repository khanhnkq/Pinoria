import { useCurrentFrame, useVideoConfig } from 'remotion'

/** Keeps the existing time-based motion identical while compositions render at 60fps. */
export const useFrameAt30 = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return frame * (30 / fps)
}

export const useDurationAt30 = () => {
  const { durationInFrames, fps } = useVideoConfig()

  return durationInFrames * (30 / fps)
}
