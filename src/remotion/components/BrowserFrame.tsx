import type { ReactNode } from "react";
import { CanvasImage, staticFile } from "remotion";

export const BrowserFrame = ({
  children,
  title = "pinterest.com",
}: {
  readonly children: ReactNode;
  readonly title?: string;
}) => {
  return (
    <div
      style={{
        width: 1460,
        height: 790,
        overflow: "hidden",
        border: "1px solid rgba(25, 36, 54, 0.13)",
        borderRadius: 28,
        backgroundColor: "#ffffff",
        boxShadow:
          "0 48px 110px rgba(18, 41, 74, 0.17), 0 12px 34px rgba(18, 41, 74, 0.08)",
      }}>
      <div
        style={{
          position: "relative",
          height: 88,
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
          borderBottom: "1px solid rgba(28, 39, 56, 0.09)",
          background: "linear-gradient(180deg, #f8f8fa 0%, #f1f2f5 100%)",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
            <span
              key={color}
              style={{
                width: 15,
                height: 15,
                borderRadius: 99,
                backgroundColor: color,
                boxShadow: "inset 0 0 0 0.7px rgba(0,0,0,0.15)",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginLeft: 28 }}>
          {["‹", "›"].map((icon) => (
            <div
              key={icon}
              style={{
                width: 36,
                height: 36,
                display: "grid",
                placeItems: "center",
                borderRadius: 10,
                color: "#667180",
                backgroundColor: "rgba(255,255,255,0.64)",
                fontSize: 27,
                fontWeight: 500,
              }}>
              {icon}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            translate: "-50% 0px",
            width: 690,
            height: 48,
            display: "grid",
            gridTemplateColumns: "42px 1fr 42px",
            alignItems: "center",
            padding: "0 6px",
            border: "1px solid rgba(26,38,56,0.07)",
            borderRadius: 14,
            color: "#525d6a",
            backgroundColor: "rgba(255,255,255,0.84)",
            boxShadow: "0 1px 2px rgba(18,31,50,0.04)",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
          }}>
          <span
            style={{
              display: "grid",
              placeItems: "center",
              color: "#7c8794",
              fontSize: 15,
            }}>
            ▣
          </span>
          <div
            style={{
              textAlign: "center",
              fontSize: 17,
              fontWeight: 570,
              letterSpacing: "-0.01em",
            }}>
            <span style={{ marginRight: 7, color: "#7e8996", fontSize: 12 }}>
              ●
            </span>
            {title}
          </div>
          <span
            style={{
              display: "grid",
              placeItems: "center",
              color: "#7c8794",
              fontSize: 19,
            }}>
            ↻
          </span>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 9,
          }}>
          <div
            style={{
              width: 38,
              height: 38,
              display: "grid",
              placeItems: "center",
              borderRadius: 11,
              color: "#617080",
              backgroundColor: "rgba(255,255,255,0.65)",
              fontSize: 19,
            }}>
            □
          </div>
          <div
            style={{
              width: 38,
              height: 38,
              display: "grid",
              placeItems: "center",
              borderRadius: 11,
              color: "#617080",
              backgroundColor: "rgba(255,255,255,0.65)",
              fontSize: 21,
            }}>
            ＋
          </div>
          <div
            style={{
              position: "relative",
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              borderRadius: 13,
              border: "1px solid rgba(22,136,248,0.18)",
              backgroundColor: "#ffffff",
              boxShadow: "0 6px 16px rgba(22,136,248,0.13)",
            }}>
            <CanvasImage
              src={staticFile("icons/icon-128.png")}
              style={{ width: 32, height: 32, borderRadius: 9 }}
            />
            <span
              style={{
                position: "absolute",
                right: -3,
                top: -3,
                width: 10,
                height: 10,
                border: "2px solid #f3f4f6",
                borderRadius: 99,
                backgroundColor: "#34c759",
              }}
            />
          </div>
        </div>
      </div>
      <div
        style={{
          position: "relative",
          height: 702,
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}>
        {children}
      </div>
    </div>
  );
};
