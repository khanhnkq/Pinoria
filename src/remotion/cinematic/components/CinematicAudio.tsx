import { Audio } from '@remotion/media'
import { Sequence, staticFile } from 'remotion'

type SoundCue = {
  readonly name: string
  readonly cue: string
  readonly frame: number
  readonly durationInFrames: number
  readonly volume: number
}

const MASTER_SFX_VOLUME = 0.55

const SOUND_CUES: readonly SoundCue[] = [
  { name: 'Intro brand reward', cue: 'reward', frame: 18, durationInFrames: 31, volume: 0.18 },

  { name: 'Setup input focus', cue: 'focus', frame: 254, durationInFrames: 13, volume: 0.12 },
  { name: 'Setup typing 1', cue: 'typing', frame: 260, durationInFrames: 6, volume: 0.055 },
  { name: 'Setup typing 2', cue: 'typing', frame: 266, durationInFrames: 6, volume: 0.055 },
  { name: 'Setup typing 3', cue: 'typing', frame: 272, durationInFrames: 6, volume: 0.055 },
  { name: 'Setup typing 4', cue: 'typing', frame: 278, durationInFrames: 6, volume: 0.055 },
  { name: 'Setup typing 5', cue: 'typing', frame: 284, durationInFrames: 6, volume: 0.055 },
  { name: 'Setup typing 6', cue: 'typing', frame: 290, durationInFrames: 6, volume: 0.055 },
  { name: 'Setup save press', cue: 'press', frame: 352, durationInFrames: 9, volume: 0.18 },
  { name: 'Setup save success', cue: 'success', frame: 354, durationInFrames: 36, volume: 0.2 },

  { name: 'Quick download press', cue: 'press', frame: 510, durationInFrames: 9, volume: 0.18 },
  { name: 'Quick file send', cue: 'send', frame: 516, durationInFrames: 22, volume: 0.18 },
  { name: 'Quick download complete', cue: 'complete', frame: 550, durationInFrames: 39, volume: 0.21 },

  { name: 'Board download press', cue: 'press', frame: 682, durationInFrames: 9, volume: 0.2 },
  { name: 'Board files send', cue: 'send', frame: 760, durationInFrames: 22, volume: 0.19 },
  { name: 'Finder organized success', cue: 'success', frame: 796, durationInFrames: 36, volume: 0.21 },

  { name: 'Outro brand achievement', cue: 'achievement', frame: 902, durationInFrames: 56, volume: 0.22 },
]

export const CinematicAudio = () => (
  <>
    {SOUND_CUES.map(({ name, cue, frame, durationInFrames, volume }) => (
      <Sequence
        key={`${name}-${frame}`}
        name={name}
        from={frame}
        durationInFrames={durationInFrames}
        layout="none">
        <Audio
          src={staticFile(`audio/uisfx/minimal/${cue}.mp3`)}
          volume={volume * MASTER_SFX_VOLUME}
        />
      </Sequence>
    ))}
  </>
)
