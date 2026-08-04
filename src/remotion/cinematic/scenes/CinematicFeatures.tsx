import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { CinematicBackground } from "../components/CinematicBackground";

const BENEFITS = ["No account", "No analytics", "No cloud upload"] as const;

export const CinematicFeatures = () => {
  const frame = useCurrentFrame();
  const metric = Math.round(
    interpolate(frame, [8, 52], [0, 100], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
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
          left: 0,
          right: 0,
          top: 134,
          color: "#718091",
          textAlign: "center",
          fontSize: 24,
          fontWeight: 780,
          letterSpacing: "0.11em",
          opacity: interpolate(frame, [0, 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}>
        YOUR MEDIA STAYS YOURS
      </div>
      <Interactive.Div
        name="Local processing metric"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 190,
          textAlign: "center",
          color: "#1688f8",
          fontSize: 230,
          lineHeight: 1,
          fontWeight: 900,
          letterSpacing: "-0.09em",
          opacity: interpolate(frame, [0, 13], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, 28, 89], [0.9, 1, 1.025], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear],
            output: "perceptual-scale",
          }),
        }}>
        {metric}%
      </Interactive.Div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 438,
          textAlign: "center",
          fontSize: 60,
          fontWeight: 870,
          letterSpacing: "-0.055em",
          opacity: interpolate(frame, [20, 34], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [20, 38], ["0px 26px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}>
        Local processing.
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 560,
          display: "flex",
          justifyContent: "center",
          gap: 16,
        }}>
        {BENEFITS.map((benefit, index) => {
          const from = 32 + index * 7;
          return (
            <div
              key={benefit}
              style={{
                padding: "16px 22px",
                border: "1px solid #e5e9ee",
                borderRadius: 999,
                color: "#4f5c6c",
                backgroundColor: "#ffffff",
                boxShadow: "0 12px 28px rgba(17,31,52,0.07)",
                fontSize: 20,
                fontWeight: 700,
                opacity: interpolate(frame, [from, from + 10], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                translate: interpolate(
                  frame,
                  [from, from + 14],
                  ["0px 20px", "0px 0px"],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.16, 1, 0.3, 1),
                  },
                ),
              }}>
              <span style={{ marginRight: 9, color: "#0aaa69" }}>●</span>
              {benefit}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
