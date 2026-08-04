import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BrowserFrame } from "../../components/BrowserFrame";
import { PinGrid } from "../../components/PinGrid";
import { CinematicBackground } from "../components/CinematicBackground";
import { CinematicPointer } from "../components/CinematicPointer";

export const CinematicBoard = () => {
  const frame = useCurrentFrame();
  const count = Math.round(
    interpolate(frame, [36, 108], [3, 69], {
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
          left: 230,
          top: 155,
          transformOrigin: "50% 100%",
          transform: `perspective(1800px) rotateX(${interpolate(frame, [0, 14], [7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })}deg) rotateZ(${interpolate(frame, [0, 14], [-1.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}deg)`,
          opacity: interpolate(frame, [0, 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, 8, 13, 18], [0.92, 1.02, 0.995, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
        }}>
        <BrowserFrame title="pinterest.com/board/design-reference">
          <div
            style={{
              position: "relative",
              zIndex: 4,
              height: 142,
              padding: "22px 30px",
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #eceef1",
            }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
              <div>
                <div
                  style={{
                    color: "#8a9099",
                    fontSize: 14,
                    fontWeight: 760,
                    letterSpacing: "0.08em",
                  }}>
                  PINTEREST BOARD · 69 PINS
                </div>
                <div
                  style={{
                    marginTop: 5,
                    fontSize: 34,
                    fontWeight: 870,
                    letterSpacing: "-0.045em",
                  }}>
                  Design references
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    width: 300,
                    height: 50,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 18px",
                    borderRadius: 999,
                    color: "#777",
                    backgroundColor: "#efefef",
                    fontSize: 16,
                  }}>
                  ⌕ Search this board
                </div>
                <div
                  data-pointer-target="board-download"
                  style={{
                    minWidth: 188,
                    height: 50,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 999,
                    color: "#ffffff",
                    backgroundColor:
                      frame < 30
                        ? "#e60023"
                        : frame < 111
                          ? "#101010"
                          : "#0b9b62",
                    boxShadow:
                      frame < 30
                        ? "0 10px 22px rgba(230,0,35,0.18)"
                        : "0 10px 22px rgba(10,17,28,0.14)",
                    fontSize: 16,
                    fontWeight: 820,
                    scale: interpolate(
                      frame,
                      [26, 30, 35, 39, 107, 112, 117],
                      [1, 0.82, 1.06, 1, 1, 1.04, 1],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                        output: "perceptual-scale",
                      },
                    ),
                  }}>
                  {frame < 30
                    ? "↓  Download board"
                    : frame < 111
                      ? `Downloading ${count}/69`
                      : "69 Pins downloaded"}
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              translate: `0px ${interpolate(frame, [38, 110], [0, -165], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`,
            }}>
            <PinGrid />
          </div>
          <div
            style={{
              position: "absolute",
              zIndex: 6,
              top: 138,
              left: 0,
              right: 0,
              height: 6,
              backgroundColor: "#eceef1",
              opacity: interpolate(frame, [30, 36], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}>
            <div
              style={{
                width: `${interpolate(frame, [30, 111], [2, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%`,
                height: "100%",
                backgroundColor: "#1688f8",
              }}
            />
          </div>
        </BrowserFrame>
      </div>
      <CinematicPointer variant="board" />
    </AbsoluteFill>
  );
};
