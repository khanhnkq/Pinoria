import { linearTiming, springTiming, TransitionSeries } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { slide } from '@remotion/transitions/slide'
import { wipe } from '@remotion/transitions/wipe'
import { CinematicBoardToFinder } from './scenes/CinematicBoardToFinder'
import { CinematicBoardTitle } from './scenes/CinematicBoardTitle'
import { CinematicAudio } from './components/CinematicAudio'
import { CinematicHome } from './scenes/CinematicHome'
import { CinematicIntro } from './scenes/CinematicIntro'
import { CinematicOutro } from './scenes/CinematicOutro'
import { CinematicPromise } from './scenes/CinematicPromise'
import { CinematicQuick } from './scenes/CinematicQuick'
import { CinematicSetup } from './scenes/CinematicSetup'
import { CinematicSetupTitle } from './scenes/CinematicSetupTitle'

export const PinoriaCinematic = () => {
  return (
    <>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={90} name="Logo reveal"><CinematicIntro /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 14 })} />
        <TransitionSeries.Sequence durationInFrames={120} name="Safari home"><CinematicHome /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: 'from-right' })} timing={linearTiming({ durationInFrames: 16 })} />
        <TransitionSeries.Sequence durationInFrames={72} name="Folder setup statement"><CinematicSetupTitle /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: 'from-bottom' })} timing={springTiming({ config: { damping: 24, stiffness: 220, mass: 0.6 }, durationInFrames: 12 })} />
        <TransitionSeries.Sequence durationInFrames={150} name="Folder setup"><CinematicSetup /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence durationInFrames={90} name="Main benefit"><CinematicPromise /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: 'from-bottom' })} timing={springTiming({ config: { damping: 22, stiffness: 220, mass: 0.6 }, durationInFrames: 14 })} />
        <TransitionSeries.Sequence durationInFrames={150} name="Quick download"><CinematicQuick /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence durationInFrames={72} name="Board download statement"><CinematicBoardTitle /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: 'from-bottom' })} timing={springTiming({ config: { damping: 24, stiffness: 220, mass: 0.6 }, durationInFrames: 12 })} />
        <TransitionSeries.Sequence durationInFrames={240} name="Board download to Finder"><CinematicBoardToFinder /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
        <TransitionSeries.Sequence durationInFrames={120} name="Pinoria CTA"><CinematicOutro /></TransitionSeries.Sequence>
      </TransitionSeries>
      <CinematicAudio />
    </>
  );
}
