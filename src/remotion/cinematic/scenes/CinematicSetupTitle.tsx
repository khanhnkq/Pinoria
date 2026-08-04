import { CinematicFeatureStatement } from "../components/CinematicFeatureStatement";

export const CinematicSetupTitle = () => (
  <CinematicFeatureStatement
    lines={[
      [{ text: "Set" }, { text: "it" }, { text: "once.", accent: true }],
      [
        { text: "Every" },
        { text: "download," },
        { text: "sorted.", accent: true },
      ],
    ]}
  />
);
