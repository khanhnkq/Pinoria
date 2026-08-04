import { BrandMark } from "../../components/BrandMark";
import { interpolate, useCurrentFrame } from "remotion";

const AnimatedFolderName = ({
  frame,
  name,
}: {
  readonly frame: number;
  readonly name: string;
}) => (
  <div
    style={{ minHeight: 19, color: "#17202c", fontSize: 16, fontWeight: 790 }}>
    {name.split("").map((character, index) => {
      const from = 18 + ((index + 1) * 30) / name.length;
      return (
        <span
          key={`${character}-${index}`}
          style={{
            display: "inline-block",
            minWidth: character === " " ? "0.28em" : undefined,
            opacity: interpolate(frame, [from - 1, from + 2], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: `0px ${interpolate(frame, [from - 1, from + 3], [7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
            scale: interpolate(
              frame,
              [from - 1, from + 2, from + 5],
              [0.86, 1.06, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                output: "perceptual-scale",
              },
            ),
          }}>
          {character === " " ? "\u00a0" : character}
        </span>
      );
    })}
  </div>
);

const Row = ({
  color,
  label,
  path,
  editing = false,
  caretVisible = false,
  typingFrame,
}: {
  readonly color: string;
  readonly label: string;
  readonly path?: string;
  readonly editing?: boolean;
  readonly caretVisible?: boolean;
  readonly typingFrame?: number;
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "46px 1fr 30px",
      gap: 11,
      alignItems: "center",
      padding: 9,
      border: editing ? "1.5px solid #1688f8" : "1px solid #e8eaee",
      borderRadius: 16,
      backgroundColor: editing ? "#f8fbff" : "#fbfbfc",
      boxShadow: editing ? "0 0 0 3px rgba(22,136,248,0.12)" : "none",
    }}>
    <div
      style={{
        width: 46,
        height: 46,
        display: "grid",
        placeItems: "center",
        borderRadius: 13,
        color: "#ffffff",
        backgroundColor: color,
        boxShadow: `0 7px 16px ${color}30`,
        fontSize: 18,
        fontWeight: 850,
      }}>
      <span
        style={{
          scale:
            typingFrame === undefined
              ? 1
              : interpolate(typingFrame, [18, 21, 25], [0.78, 1.08, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  output: "perceptual-scale",
                }),
        }}>
        {typingFrame === undefined || typingFrame >= 21 ? label.charAt(0) : "+"}
      </span>
    </div>
    <div>
      {typingFrame === undefined ? (
        <div style={{ color: "#17202c", fontSize: 16, fontWeight: 790 }}>
          {label}
        </div>
      ) : (
        <AnimatedFolderName frame={typingFrame} name={label} />
      )}
      <div
        data-pointer-target={editing ? "setup-folder-input" : undefined}
        style={{
          marginTop: 3,
          color: editing ? "#246fb9" : "#89919d",
          fontSize: 12,
          fontWeight: editing ? 680 : 500,
        }}>
        {path ?? `Downloads/${label}`}
        <span
          style={{
            opacity: caretVisible ? 1 : 0,
            marginLeft: 1,
            color: "#1688f8",
            fontWeight: 900,
          }}>
          |
        </span>
      </div>
    </div>
  </div>
);

export const SettingsMini = () => {
  const frame = useCurrentFrame();
  const folderName = "Category 1";
  const typedCharacters = Math.floor(
    interpolate(frame, [18, 48], [0, folderName.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const folderPath = `Downloads/Pinoria/${folderName.slice(0, typedCharacters)}`;
  const editing = frame >= 14 && frame < 52;
  const caretVisible = editing && Math.floor((frame - 14) / 5) % 2 === 0;
  const saved = frame >= 114;

  return (
    <div
      style={{
        width: 500,
        padding: 22,
        border: "1px solid rgba(26,38,56,0.09)",
        borderRadius: 24,
        backgroundColor: "#ffffff",
        boxShadow:
          "0 34px 90px rgba(11, 25, 48, 0.25), 0 8px 24px rgba(11,25,48,0.08)",
      }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          paddingBottom: 17,
          borderBottom: "1px solid #eceef2",
        }}>
        <BrandMark size={52} />
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 850,
              letterSpacing: "-0.025em",
            }}>
            Pinoria
          </div>
          <div style={{ marginTop: 3, color: "#7b8490", fontSize: 13 }}>
            Configure download buttons
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "17px 2px 10px",
          color: "#252d38",
          fontSize: 14,
          fontWeight: 770,
        }}>
        <span>Folders &amp; download colors</span>
        <span style={{ color: "#8b94a0", fontWeight: 630 }}>3 active</span>
      </div>
      <div style={{ display: "grid", gap: 9 }}>
        <Row
          color="#e60023"
          label="Category 1"
          path={folderPath}
          editing={editing}
          caretVisible={caretVisible}
          typingFrame={frame}
        />
        <Row color="#1688f8" label="References" />
        <Row color="#08a76c" label="Campaign" />
      </div>
      <div
        data-pointer-target="setup-save"
        style={{
          marginTop: 14,
          height: 52,
          display: "grid",
          placeItems: "center",
          borderRadius: 15,
          color: "#ffffff",
          background: saved
            ? "linear-gradient(135deg, #18b674 0%, #087f51 100%)"
            : "linear-gradient(135deg, #1688f8 0%, #086de0 100%)",
          boxShadow: saved
            ? "0 12px 24px rgba(8,127,81,0.24)"
            : "0 12px 24px rgba(22,136,248,0.24)",
          fontSize: 15,
          fontWeight: 820,
        }}>
        {saved ? "Settings saved" : "Save settings"}
      </div>
    </div>
  );
};
