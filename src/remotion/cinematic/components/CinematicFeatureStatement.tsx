import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { CinematicBackground } from "./CinematicBackground";

export type StatementWord = {
  readonly text: string;
  readonly accent?: boolean;
};

type CinematicFeatureStatementProps = {
  readonly eyebrow?: string;
  readonly footer?: string;
  readonly lines: readonly (readonly StatementWord[])[];
};

export const CinematicFeatureStatement = ({
  eyebrow,
  lines,
}: CinematicFeatureStatementProps) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        color: "#101114",
      }}>
      <CinematicBackground />
      {eyebrow ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 150,
            color: "#718091",
            textAlign: "center",
            fontSize: 22,
            fontWeight: 790,
            letterSpacing: "0.12em",
            opacity: interpolate(frame, [0, 13], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}>
          {eyebrow}
        </div>
      ) : null}
      <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
        <Interactive.Div
          name="Feature statement"
          style={{
            width: 1810,
            padding: "24px 18px 34px",
            overflow: "visible",
            textAlign: "center",
            fontSize: 126,
            lineHeight: 1.04,
            fontWeight: 890,
            letterSpacing: "-0.072em",
            scale: interpolate(frame, [0, 71], [0.97, 1.018], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            }),
          }}>
          {lines.map((line, lineIndex) => (
            <div
              key={`line-${lineIndex}`}
              style={{
                overflow: "visible",
                marginTop: lineIndex === 0 ? 0 : 8,
                padding: "0.04em 0.02em 0.12em",
              }}>
              {line.map((word, wordIndex) => {
                const from = lineIndex * 22 + wordIndex * 7;
                return (
                  <span
                    key={`${word.text}-${wordIndex}`}
                    style={{
                      display: "inline-block",
                      overflow: "hidden",
                      marginRight: wordIndex === line.length - 1 ? 0 : "0.14em",
                      padding: "0.06em 0.08em 0.16em",
                      verticalAlign: "top",
                    }}>
                    <span
                      style={{
                        display: "inline-block",
                        color: word.accent ? "#1688f8" : "#101114",
                        opacity: interpolate(frame, [from, from + 11], [0, 1], {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                        }),
                        translate: interpolate(
                          frame,
                          [from, from + 17],
                          ["0px 105%", "0px 0%"],
                          {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                            easing: Easing.bezier(0.16, 1, 0.3, 1),
                          },
                        ),
                        filter: `blur(${interpolate(frame, [from, from + 13], [8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
                      }}>
                      {word.text}
                    </span>
                  </span>
                );
              })}
            </div>
          ))}
        </Interactive.Div>
        <div
          style={{
            position: "absolute",
            top: 700,
            width: interpolate(frame, [42, 64], [0, 500], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            height: 8,
            borderRadius: 99,
            background: "linear-gradient(90deg, #6de1ff, #1688f8)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
