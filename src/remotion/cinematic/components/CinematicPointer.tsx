import { Easing, interpolate, useCurrentFrame } from "remotion";

type CinematicPointerProps = {
  readonly variant: "setup" | "quick" | "board";
  readonly setupCamera?: {
    readonly scale: number;
    readonly x: number;
    readonly y: number;
  };
};

export const CinematicPointer = ({
  variant,
  setupCamera,
}: CinematicPointerProps) => {
  const frame = useCurrentFrame();
  const points =
    variant === "setup"
      ? {
          frames: [0, 8, 14, 52, 78, 104, 112],
          x: [1420, 1300, 1200, 1200, 1520, 1378, 1378],
          y: [520, 450, 426, 426, 441, 660, 660],
          clicks: [14, 112],
        }
      : variant === "quick"
        ? {
            frames: [0, 28, 56, 80],
            x: [1060, 1010, 982, 982],
            y: [800, 800, 597, 597],
            clicks: [56],
          }
        : {
            frames: [0, 30, 58, 70],
            x: [1500, 1600, 1600, 1600],
            y: [850, 290, 290, 290],
            clicks: [30],
          };

  const pointerScale = points.clicks.reduce(
    (scale, click) =>
      scale *
      interpolate(
        frame,
        [click - 3, click, click + 4, click + 8],
        [1, 0.82, 1.06, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          output: "perceptual-scale",
        },
      ),
    1,
  );

  const defaultX = interpolate(frame, points.frames, points.x, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const defaultY = interpolate(frame, points.frames, points.y, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // The input anchor is the position adjusted in Studio at frame 52 while the
  // Safari camera is at scale 1.5 and translated by (-400, 20).
  const inputLocalDeltaX = (1200 - 230 - 1130 - -400) / 1.5;
  const inputLocalDeltaY = (426 - 155 - 355 - 20) / 1.5;
  const trackedInputX = setupCamera
    ? 230 + 1130 + setupCamera.x + setupCamera.scale * inputLocalDeltaX
    : defaultX;
  const trackedInputY = setupCamera
    ? 155 + 355 + setupCamera.y + setupCamera.scale * inputLocalDeltaY
    : defaultY;
  const pointerX =
    variant === "setup" && frame >= 52 && frame <= 78
      ? trackedInputX
      : defaultX;
  const pointerY =
    variant === "setup" && frame >= 52 && frame <= 78
      ? trackedInputY
      : defaultY;

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 100,
        left: 0,
        top: 0,
        translate: `${pointerX}px ${pointerY}px`,
        scale: pointerScale,
        opacity: interpolate(frame, [2, 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.28))",
      }}>
      {points.clicks.map((click) => (
        <div
          key={click}
          style={{
            position: "absolute",
            zIndex: -1,
            left: -6,
            top: -5,
            width: 56,
            height: 56,
            borderRadius: 999,
            border: "4px solid #1688f8",
            opacity: interpolate(
              frame,
              [click - 2, click, click + 10],
              [0, 0.82, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
            scale: interpolate(
              frame,
              [click - 2, click, click + 10],
              [0.35, 0.62, 1.9],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                output: "perceptual-scale",
              },
            ),
          }}
        />
      ))}
      <svg
        width="58"
        height="64"
        viewBox="0 0 58 64"
        fill="none"
        aria-hidden="true">
        <defs>
          <linearGradient
            id={`pointer-${variant}`}
            x1="4"
            y1="4"
            x2="48"
            y2="54"
            gradientUnits="userSpaceOnUse">
            <stop stopColor="#7de4ff" />
            <stop offset="1" stopColor="#1688f8" />
          </linearGradient>
        </defs>
        <path
          d="M6 4L51 37H30L21 58L6 4Z"
          fill={`url(#pointer-${variant})`}
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
