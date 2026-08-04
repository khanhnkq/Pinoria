import { CinematicFeatureStatement } from "../components/CinematicFeatureStatement";

export const CinematicPromise = () => (
  <CinematicFeatureStatement
    lines={[
      [{ text: "Save" }, { text: "every" }, { text: "Pin.", accent: true }],
      [
        { text: "Into" },
        { text: "the" },
        { text: "right folder.", accent: true },
      ],
    ]}
  />
);
