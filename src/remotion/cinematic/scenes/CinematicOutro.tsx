import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { BrandMark } from "../../components/BrandMark";
import { CinematicBackground } from "../components/CinematicBackground";

export const CinematicOutro = () => {
  const frame = useCurrentFrame();

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
          inset: -220,
          background:
            "radial-gradient(circle at 50% 48%, rgba(22,136,248,0.18) 0%, rgba(102,220,255,0.07) 30%, rgba(255,255,255,0) 65%)",
          opacity: interpolate(frame, [0, 24, 104, 119], [0, 1, 0.72, 0.25], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, 119], [0.94, 1.1], {
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
            top: 195,
            width: 154,
            height: 154,
            overflow: "hidden",
            borderRadius: 44,
            opacity: interpolate(frame, [0, 17], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [0, 22, 31], [0.88, 1.035, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            }),
            filter: `blur(${interpolate(frame, [0, 20], [10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
          }}>
          <BrandMark size={154} />
          <div
            style={{
              position: "absolute",
              zIndex: 4,
              top: -18,
              bottom: -18,
              width: 54,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.88), transparent)",
              translate: `${interpolate(frame, [18, 44], [-100, 210], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })}px 0px`,
              rotate: "-13deg",
              opacity: interpolate(frame, [16, 22, 39, 47], [0, 0.9, 0.9, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        </div>
        <Interactive.Div
          name="Final app name"
          style={{
            position: "absolute",
            top: 385,
            display: "flex",
            alignItems: "baseline",
            gap: 22,
            fontSize: 88,
            fontWeight: 890,
            letterSpacing: "-0.07em",
            opacity: interpolate(frame, [12, 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [12, 34], ["0px 34px", "0px 0px"], {
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
              opacity: interpolate(frame, [22, 35], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              translate: interpolate(frame, [22, 39], ["0px 22px", "0px 0px"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              scale: interpolate(frame, [22, 37, 47], [0.88, 1.045, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                output: "perceptual-scale",
              }),
              filter: `blur(${interpolate(frame, [22, 36], [8, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}px)`,
            }}>
            Personal
          </span>
        </Interactive.Div>
        <Interactive.Div
          name="Final tagline"
          style={{
            position: "absolute",
            top: 505,
            color: "#667384",
            fontSize: 27,
            fontWeight: 650,
            letterSpacing: "-0.015em",
            opacity: interpolate(frame, [30, 48], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [30, 52], ["0px 22px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}>
          Pinterest downloads, sorted locally.
        </Interactive.Div>
        <Interactive.Div
          name="Final CTA"
          style={{
            position: "absolute",
            top: 590,
            minWidth: 210,
            height: 62,
            display: "grid",
            placeItems: "center",
            padding: "0 30px",
            borderRadius: 18,
            color: "#ffffff",
            background: "linear-gradient(135deg, #1688f8, #086de0)",
            boxShadow: "0 18px 38px rgba(22,136,248,0.25)",
            fontSize: 20,
            fontWeight: 820,
            opacity: interpolate(frame, [48, 66], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [48, 70], ["0px 20px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            scale: interpolate(frame, [48, 68, 78], [0.94, 1.025, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            }),
          }}>
          Get Pinoria
        </Interactive.Div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#1688f8",
            opacity: interpolate(frame, [110, 119], [0, 0.08], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
