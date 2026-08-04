import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BrowserFrame } from "../../components/BrowserFrame";
import { BrandMark } from "../../components/BrandMark";
import { DownloadIcon } from "../../components/DownloadIcon";
import { PinGrid } from "../../components/PinGrid";
import { CinematicBackground } from "../components/CinematicBackground";

const HomeDownloadActions = () => (
  <div
    style={{
      width: 42,
      height: 42,
      display: "grid",
      placeItems: "center",
      border: "2px solid rgba(255,255,255,0.9)",
      borderRadius: 13,
      color: "#ffffff",
      backgroundColor: "#e60023",
      boxShadow: "0 9px 22px rgba(230,0,35,0.34)",
    }}>
    <DownloadIcon color="#ffffff" />
  </div>
);

export const CinematicHome = () => {
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
          left: 230,
          top: 145,
          opacity: interpolate(frame, [0, 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [0, 28], ["0px 54px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          scale: interpolate(frame, [0, 28, 119], [0.94, 1, 1.018], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [Easing.bezier(0.16, 1, 0.3, 1), Easing.linear],
            output: "perceptual-scale",
          }),
        }}>
        <BrowserFrame title="pinterest.com/homefeed">
          <div
            style={{
              position: "relative",
              zIndex: 4,
              height: 84,
              display: "flex",
              alignItems: "center",
              gap: 16,
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
                fontWeight: 770,
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
              ⌕ Search for inspiration
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 12px",
                border: "1px solid #e2e6eb",
                borderRadius: 999,
                color: "#657180",
                backgroundColor: "#f7f8fa",
                fontSize: 13,
                fontWeight: 760,
              }}>
              Before / After
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              zIndex: 1,
              left: 0,
              right: 0,
              top: 84,
              bottom: 0,
              overflow: "hidden",
              backgroundColor: "#ffffff",
            }}>
            <div
              style={{
                position: "absolute",
                zIndex: 0,
                left: "50%",
                right: 0,
                top: 0,
                bottom: 0,
                background:
                  "linear-gradient(90deg, rgba(22,136,248,0.02), rgba(22,136,248,0.055))",
                opacity: interpolate(frame, [8, 16], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                paddingTop: 44,
                translate: `0px ${interpolate(frame, [22, 119], [0, -72], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`,
              }}>
              <PinGrid
                action={<HomeDownloadActions />}
                actionIndices={[3, 4, 8, 9]}
                actionOverlayColor="rgba(255,255,255,0.04)"
                progress={interpolate(frame, [14, 22], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                })}
              />
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              zIndex: 5,
              right: 28,
              bottom: 28,
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "12px 15px",
              border: "1px solid rgba(22,136,248,0.14)",
              borderRadius: 16,
              color: "#17202c",
              backgroundColor: "rgba(255,255,255,0.94)",
              boxShadow: "0 16px 38px rgba(17,31,52,0.14)",
              opacity: interpolate(frame, [28, 42], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              scale: interpolate(frame, [28, 45], [0.9, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                output: "perceptual-scale",
              }),
            }}>
            <BrandMark size={38} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 810 }}>Pinoria</div>
              <div style={{ marginTop: 2, color: "#7c8794", fontSize: 11 }}>
                Active on the right side
              </div>
            </div>
          </div>
        </BrowserFrame>
        <div
          style={{
            position: "absolute",
            zIndex: 10,
            left: 0,
            top: 0,
            width: 730,
            height: 790,
            borderRadius: "28px 0 0 28px",
            background:
              "linear-gradient(90deg, rgba(10,16,26,0.29), rgba(10,16,26,0.22))",
            opacity: interpolate(frame, [6, 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            zIndex: 11,
            left: 727,
            top: 0,
            width: 6,
            height: 790,
            background:
              "linear-gradient(180deg, #087cf0 0%, #26b9ff 48%, #087cf0 100%)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.76), 0 0 24px rgba(22,136,248,0.72)",
            opacity: interpolate(frame, [8, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            pointerEvents: "none",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
