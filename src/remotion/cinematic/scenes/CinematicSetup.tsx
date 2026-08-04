import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BrowserFrame } from "../../components/BrowserFrame";
import { PinGrid } from "../../components/PinGrid";
import { CinematicBackground } from "../components/CinematicBackground";
import { CinematicPointer } from "../components/CinematicPointer";
import { SettingsMini } from "../components/SettingsMini";

export const CinematicSetup = () => {
  const frame = useCurrentFrame();
  const cameraScale = interpolate(frame, [0, 52, 78], [1.5, 1.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    output: "perceptual-scale",
  });
  const cameraX = interpolate(frame, [0, 52, 78], [-400, -400, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const cameraY = interpolate(frame, [0, 52, 78], [20, 20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

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
          transformOrigin: "1130px 355px",
          transform: `translate(${cameraX}px, ${cameraY}px) scale(${cameraScale})`,
          opacity: interpolate(frame, [0, 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}>
        <BrowserFrame title="pinterest.com/homefeed">
          <div
            style={{
              height: 82,
              display: "flex",
              alignItems: "center",
              gap: 15,
              padding: "0 28px",
              borderBottom: "1px solid #eceef1",
              backgroundColor: "#ffffff",
            }}>
            <div
              style={{
                width: 46,
                height: 46,
                display: "grid",
                placeItems: "center",
                borderRadius: 999,
                color: "#ffffff",
                backgroundColor: "#e60023",
                fontSize: 25,
                fontWeight: 900,
              }}>
              P
            </div>
            <div
              style={{
                padding: "11px 17px",
                borderRadius: 999,
                color: "#ffffff",
                backgroundColor: "#111111",
                fontSize: 16,
                fontWeight: 760,
              }}>
              Home
            </div>
            <div
              style={{
                flex: 1,
                height: 48,
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                borderRadius: 999,
                color: "#858585",
                backgroundColor: "#f0f0f0",
                fontSize: 16,
              }}>
              ⌕ Search for new ideas
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                color: "#626973",
                fontSize: 20,
              }}>
              <span>●</span>
              <span>•••</span>
            </div>
          </div>
          <div style={{ opacity: 0.33, filter: "saturate(0.72)" }}>
            <PinGrid />
          </div>
          <div
            style={{
              position: "absolute",
              left: 34,
              bottom: 30,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 15px",
              border: "1px solid #e5e8ed",
              borderRadius: 14,
              color: "#596575",
              backgroundColor: "rgba(255,255,255,0.92)",
              boxShadow: "0 10px 24px rgba(17,31,52,0.08)",
              fontSize: 13,
              fontWeight: 680,
            }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 99,
                backgroundColor: "#34c759",
              }}
            />
            Pinoria is active on Pinterest
          </div>
          <div
            style={{
              position: "absolute",
              right: 54,
              top: 30,
              opacity: interpolate(frame, [0, 6], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: `0px ${interpolate(frame, [0, 10], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`,
              scale: interpolate(frame, [0, 9], [0.97, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                output: "perceptual-scale",
              }),
            }}>
            <div
              style={{
                position: "absolute",
                right: 27,
                top: -13,
                width: 24,
                height: 24,
                rotate: "45deg",
                borderTop: "1px solid rgba(26,38,56,0.09)",
                borderLeft: "1px solid rgba(26,38,56,0.09)",
                backgroundColor: "#ffffff",
              }}
            />
            <SettingsMini />
          </div>
        </BrowserFrame>
      </div>
      <CinematicPointer
        variant="setup"
        setupCamera={{ scale: cameraScale, x: cameraX, y: cameraY }}
      />
    </AbsoluteFill>
  );
};
