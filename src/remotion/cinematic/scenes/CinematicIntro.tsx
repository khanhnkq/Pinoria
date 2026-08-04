import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { BrandMark } from "../../components/BrandMark";
import { CinematicBackground } from "../components/CinematicBackground";

const SUBTITLE = "Pinterest downloads, sorted automatically.";

export const CinematicIntro = () => {
  const frame = useCurrentFrame();
  const visibleCharacters = Math.floor(
    interpolate(frame, [38, 76], [0, SUBTITLE.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        color: "#101114",
      }}>
      <CinematicBackground />
      <div
        style={{
          position: "absolute",
          inset: -180,
          background:
            "radial-gradient(circle at 50% 46%, rgba(22,136,248,0.16) 0%, rgba(111,219,255,0.07) 28%, rgba(255,255,255,0) 62%)",
          opacity: interpolate(frame, [0, 24, 70, 89], [0, 1, 0.72, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, 89], [0.9, 1.08], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
        }}
      />
      <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
        <div
          style={{
            position: "absolute",
            top: 235,
            width: 190,
            height: 190,
            borderRadius: 56,
            backgroundColor: "rgba(22,136,248,0.15)",
            filter: `blur(${interpolate(frame, [0, 28], [32, 9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
            opacity: interpolate(frame, [0, 18, 54, 88], [0, 0.78, 0.36, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [0, 30, 52], [0.86, 1.16, 1.06], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            }),
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 238,
            width: 178,
            height: 178,
            overflow: "hidden",
            borderRadius: 50,
            opacity: interpolate(frame, [0, 18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            scale: interpolate(frame, [0, 28], [0.9, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              output: "perceptual-scale",
            }),
            filter: `blur(${interpolate(frame, [0, 24], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
          }}>
          <BrandMark size={178} />
          <div
            style={{
              position: "absolute",
              zIndex: 4,
              top: -20,
              bottom: -20,
              width: 64,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.86), transparent)",
              translate: `${interpolate(frame, [22, 52], [-120, 245], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })}px 0px`,
              rotate: "-13deg",
              opacity: interpolate(frame, [20, 25, 47, 54], [0, 0.9, 0.9, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        </div>
        <Interactive.Div
          name="App name"
          style={{
            position: "absolute",
            top: 452,
            display: "flex",
            alignItems: "baseline",
            gap: 24,
            fontSize: 96,
            fontWeight: 880,
            letterSpacing: "-0.07em",
            opacity: interpolate(frame, [18, 36], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [18, 38], ["0px 30px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}>
          <span>Pinoria</span>
          <span
            style={{
              display: "inline-block",
              color: "#1688f8",
              opacity: interpolate(frame, [27, 38], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              translate: interpolate(frame, [27, 42], ["0px 22px", "0px 0px"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              scale: interpolate(frame, [27, 40, 49], [0.88, 1.045, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                output: "perceptual-scale",
              }),
              filter: `blur(${interpolate(frame, [27, 39], [8, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}px)`,
            }}>
            Personal
          </span>
        </Interactive.Div>
        <Interactive.Div
          name="Intro subtitle"
          style={{
            position: "absolute",
            top: 585,
            minWidth: 570,
            height: 40,
            color: "#677384",
            textAlign: "center",
            fontSize: 27,
            fontWeight: 620,
            letterSpacing: interpolate(frame, [38, 76], ["0.01em", "0.025em"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            opacity: interpolate(frame, [34, 44], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [38, 58], ["0px 16px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}>
          {SUBTITLE.slice(0, visibleCharacters)}
          <span
            style={{
              marginLeft: 2,
              color: "#1688f8",
              opacity: visibleCharacters < SUBTITLE.length ? 1 : 0,
            }}>
            |
          </span>
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
