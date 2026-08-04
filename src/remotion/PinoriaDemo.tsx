import { TransitionSeries, springTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { slide } from '@remotion/transitions/slide'
import { BoardScene } from './scenes/BoardScene'
import { DownloadScene } from './scenes/DownloadScene'
import { FinalScene } from './scenes/FinalScene'
import { IntroScene } from './scenes/IntroScene'
import { SettingsScene } from './scenes/SettingsScene'

type PinoriaDemoProps = {
  readonly accentColor: string
}

export const PinoriaDemo = ({ accentColor }: PinoriaDemoProps) => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={240} name="Intro">
        <IntroScene accentColor={accentColor} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: 'from-bottom' })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 36 })}
      />
      <TransitionSeries.Sequence durationInFrames={330} name="Folder settings">
        <SettingsScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 36 })}
      />
      <TransitionSeries.Sequence durationInFrames={360} name="Quick download">
        <DownloadScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: 'from-right' })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 36 })}
      />
      <TransitionSeries.Sequence durationInFrames={330} name="Board download">
        <BoardScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 36 })}
      />
      <TransitionSeries.Sequence durationInFrames={270} name="Outro">
        <FinalScene accentColor={accentColor} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  )
}
