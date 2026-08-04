import { Composition, Folder } from 'remotion'
import { PinoriaDemo } from './PinoriaDemo'
import { PinoriaCinematic } from './cinematic/PinoriaCinematic'
import { CinematicBoard } from './cinematic/scenes/CinematicBoard'
import { CinematicBoardToFinder } from './cinematic/scenes/CinematicBoardToFinder'
import { CinematicBoardTitle } from './cinematic/scenes/CinematicBoardTitle'
import { CinematicFeatures } from './cinematic/scenes/CinematicFeatures'
import { CinematicFinder } from './cinematic/scenes/CinematicFinder'
import { CinematicHome } from './cinematic/scenes/CinematicHome'
import { CinematicIntro } from './cinematic/scenes/CinematicIntro'
import { CinematicOutro } from './cinematic/scenes/CinematicOutro'
import { CinematicPromise } from './cinematic/scenes/CinematicPromise'
import { CinematicQuick } from './cinematic/scenes/CinematicQuick'
import { CinematicSetup } from './cinematic/scenes/CinematicSetup'
import { CinematicSetupTitle } from './cinematic/scenes/CinematicSetupTitle'
import { BoardScene } from './scenes/BoardScene'
import { DownloadScene } from './scenes/DownloadScene'
import { FinalScene } from './scenes/FinalScene'
import { IntroScene } from './scenes/IntroScene'
import { SettingsScene } from './scenes/SettingsScene'

export const RemotionRoot = () => {
  return (
    <>
      <Folder name="Pinoria-Scenes">
        <Composition id="Pinoria-01-Intro" component={IntroScene} durationInFrames={240} fps={60} width={1920} height={1080} />
        <Composition id="Pinoria-02-Settings" component={SettingsScene} durationInFrames={330} fps={60} width={1920} height={1080} />
        <Composition id="Pinoria-03-Download" component={DownloadScene} durationInFrames={360} fps={60} width={1920} height={1080} />
        <Composition id="Pinoria-04-Board" component={BoardScene} durationInFrames={330} fps={60} width={1920} height={1080} />
        <Composition id="Pinoria-05-Final" component={FinalScene} durationInFrames={270} fps={60} width={1920} height={1080} />
      </Folder>
      <Folder name="Pinoria-Cinematic-Scenes">
        <Composition id="Cinematic-01-Intro" component={CinematicIntro} durationInFrames={90} fps={60} width={1920} height={1080} />
        <Composition id="Cinematic-02-Promise" component={CinematicPromise} durationInFrames={90} fps={60} width={1920} height={1080} />
        <Composition id="Cinematic-03-Setup" component={CinematicSetup} durationInFrames={150} fps={60} width={1920} height={1080} />
        <Composition id="Cinematic-04-Quick" component={CinematicQuick} durationInFrames={150} fps={60} width={1920} height={1080} />
        <Composition id="Cinematic-05-Board" component={CinematicBoard} durationInFrames={150} fps={60} width={1920} height={1080} />
        <Composition id="Cinematic-06-Features" component={CinematicFeatures} durationInFrames={90} fps={60} width={1920} height={1080} />
        <Composition id="Cinematic-07-Outro" component={CinematicOutro} durationInFrames={120} fps={60} width={1920} height={1080} />
        <Composition id="Cinematic-08-Home" component={CinematicHome} durationInFrames={120} fps={60} width={1920} height={1080} />
        <Composition id="Cinematic-09-Setup-Title" component={CinematicSetupTitle} durationInFrames={72} fps={60} width={1920} height={1080} />
        <Composition id="Cinematic-10-Board-Title" component={CinematicBoardTitle} durationInFrames={72} fps={60} width={1920} height={1080} />
        <Composition id="Cinematic-11-Finder" component={CinematicFinder} durationInFrames={150} fps={60} width={1920} height={1080} />
        <Composition id="Cinematic-12-Board-To-Finder" component={CinematicBoardToFinder} durationInFrames={240} fps={60} width={1920} height={1080} />
      </Folder>
      <Composition id="PinoriaCinematic" component={PinoriaCinematic} durationInFrames={1000} fps={60} width={1920} height={1080} />
      <Composition
        id="PinoriaDemo"
        component={PinoriaDemo}
        durationInFrames={1386}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{ accentColor: '#1688f8' }}
      />
    </>
  )
}
