import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { BrowserFrame } from "../../components/BrowserFrame";
import { BrandMark } from "../../components/BrandMark";
import { CheckIcon, DownloadIcon } from "../../components/DownloadIcon";
import { PinGrid } from "../../components/PinGrid";
import { CinematicBackground } from "../components/CinematicBackground";
import { CinematicPointer } from "../components/CinematicPointer";
import { MediaFolderIcon } from "../components/MediaFolderIcon";

const Actions = ({ frame }: { readonly frame: number }) => (
  <div style={{ display: "flex", gap: 8 }}>
    {["#e60023", "#1688f8", "#08a76c"].map((color, index) => (
      <div
        key={color}
        data-pointer-target={index === 1 ? "quick-download" : undefined}
        style={{
          width: 50,
          height: 50,
          display: "grid",
          placeItems: "center",
          border: "2px solid rgba(255,255,255,0.72)",
          borderRadius: 15,
          color: "#ffffff",
          backgroundColor: color,
          boxShadow: "0 10px 24px rgba(0,0,0,0.24)",
          scale:
            index === 1
              ? interpolate(frame, [52, 56, 61, 65], [1, 0.82, 1.06, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  output: "perceptual-scale",
                })
              : 1,
        }}>
        {frame >= 56 && index === 1 ? (
          <CheckIcon color="#ffffff" />
        ) : (
          <DownloadIcon color="#ffffff" />
        )}
      </div>
    ))}
  </div>
);

const MediaFolder = ({
  frame,
  label,
  color,
  delay,
  active = false,
}: {
  readonly frame: number;
  readonly label: string;
  readonly color: string;
  readonly delay: number;
  readonly active?: boolean;
}) => {
  const activeProgress = active
    ? interpolate(frame, [90, 98], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      })
    : 0;
  const entranceScale = interpolate(
    frame,
    [delay, delay + 7, delay + 12],
    [0.9, 1.035, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      output: "perceptual-scale",
    },
  );
  const receiveScale = active
    ? interpolate(frame, [88, 92, 98], [1, 1.075, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        output: "perceptual-scale",
      })
    : 1;
  return (
    <div
      style={{
        height: 70,
        display: "grid",
        gridTemplateColumns: "44px 1fr",
        gap: 8,
        alignItems: "center",
        padding: "8px 9px",
        border: `1.5px solid ${active ? `rgba(22,136,248,${0.14 + activeProgress * 0.58})` : "rgba(26,38,56,0.09)"}`,
        borderRadius: 14,
        backgroundColor: active
          ? `rgba(235,246,255,${0.5 + activeProgress * 0.5})`
          : "#f8f9fb",
        boxShadow: active
          ? `0 10px 26px rgba(22,136,248,${activeProgress * 0.18})`
          : "none",
        opacity: interpolate(frame, [delay, delay + 7], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: `0px ${interpolate(frame, [delay, delay + 10], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`,
        scale: entranceScale * receiveScale,
      }}>
      <MediaFolderIcon color={color} id={`quick-${label}`} width={42} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 820 }}>{label}</div>
        <div
          style={{
            marginTop: 3,
            color: activeProgress > 0.5 ? "#1688f8" : "#84909d",
            fontSize: 10,
            fontWeight: 650,
          }}>
          {activeProgress > 0.5 ? "1 file" : "Ready"}
        </div>
      </div>
    </div>
  );
};

export const CinematicQuick = () => {
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
          top: 155,
          transformOrigin: "50% 100%",
          transform: `perspective(1800px) rotateX(${interpolate(frame, [0, 14], [7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })}deg) rotateZ(${interpolate(frame, [0, 14], [1.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}deg)`,
          scale: interpolate(
            frame,
            [0, 8, 13, 18, 142, 149],
            [0.92, 1.02, 0.995, 1, 1, 1.015],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            },
          ),
          opacity: interpolate(frame, [0, 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}>
        <BrowserFrame title="pinterest.com/pin/design-reference">
          <div
            style={{
              height: 90,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "0 28px",
              borderBottom: "1px solid #eceef1",
            }}>
            <div
              style={{
                width: 48,
                height: 48,
                display: "grid",
                placeItems: "center",
                borderRadius: 999,
                color: "#ffffff",
                backgroundColor: "#e60023",
                fontSize: 27,
                fontWeight: 900,
              }}>
              P
            </div>
            <div
              style={{
                padding: "11px 17px",
                borderRadius: 999,
                color: "#ffffff",
                backgroundColor: "#101010",
                fontSize: 18,
                fontWeight: 780,
              }}>
              Home
            </div>
            <div
              style={{
                flex: 1,
                height: 50,
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                borderRadius: 999,
                color: "#787878",
                backgroundColor: "#efefef",
                fontSize: 17,
              }}>
              ⌕ Search Pinterest
            </div>
          </div>
          <PinGrid
            activeIndex={2}
            progress={interpolate(frame, [20, 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
            action={<Actions frame={frame} />}
          />
          <Interactive.Div
            name="Safari auto-sort folders"
            style={{
              position: "absolute",
              zIndex: 12,
              right: 20,
              bottom: 20,
              width: 440,
              padding: "14px 16px 16px",
              border: "1px solid rgba(26,38,56,0.11)",
              borderRadius: 20,
              color: "#17202c",
              backgroundColor: "rgba(255,255,255,0.97)",
              boxShadow: "0 26px 60px rgba(17,31,52,0.22)",
              opacity: interpolate(frame, [62, 68, 144, 149], [0, 1, 1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(frame, [62, 74], ["0px 34px", "0px 0px"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              scale: interpolate(frame, [62, 70, 77], [0.92, 1.025, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                output: "perceptual-scale",
              }),
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BrandMark size={40} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 830 }}>
                  Downloads / Pinoria / Category 1
                </div>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  width: 30,
                  height: 30,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 999,
                  backgroundColor: "#e5f8ef",
                  opacity: interpolate(frame, [92, 100], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                  scale: interpolate(frame, [92, 102], [0.72, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    output: "perceptual-scale",
                  }),
                }}>
                <CheckIcon color="#0a9b62" />
              </div>
            </div>
            <div style={{ position: "relative", height: 96, marginTop: 12 }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                }}>
                <MediaFolder
                  frame={frame}
                  label="Videos"
                  color="#e60023"
                  delay={68}
                />
                <MediaFolder
                  frame={frame}
                  label="Images"
                  color="#1688f8"
                  delay={72}
                  active
                />
                <MediaFolder
                  frame={frame}
                  label="GIFs"
                  color="#08a76c"
                  delay={76}
                />
              </div>
            </div>
          </Interactive.Div>
        </BrowserFrame>
        <div
          style={{
            position: "absolute",
            zIndex: 20,
            left: interpolate(
              frame,
              [62, 70, 80, 92],
              [1320, 1245, 1150, 1100],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
            top: interpolate(frame, [62, 70, 92], [48, 20, 650], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 12px",
            border: "1px solid rgba(22,136,248,0.24)",
            borderRadius: 12,
            color: "#246fb9",
            backgroundColor: "#ffffff",
            boxShadow: "0 12px 30px rgba(17,31,52,0.22)",
            fontSize: 12,
            fontWeight: 780,
            rotate: `${interpolate(frame, [62, 70, 84, 92], [-8, -8, 6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}deg`,
            opacity: interpolate(frame, [60, 64, 89, 95], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [62, 70, 92], [0.72, 1.08, 0.64], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              output: "perceptual-scale",
            }),
          }}>
          <span
            style={{
              width: 24,
              height: 24,
              display: "grid",
              placeItems: "center",
              borderRadius: 7,
              color: "#ffffff",
              backgroundColor: "#1688f8",
              fontSize: 9,
              fontWeight: 860,
            }}>
            JPG
          </span>
          design-reference.jpg
        </div>
      </div>
      <CinematicPointer variant="quick" />
    </AbsoluteFill>
  );
};
