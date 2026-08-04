import { CinematicFeatureStatement } from "../components/CinematicFeatureStatement";

export const CinematicBoardTitle = () => (
  <CinematicFeatureStatement
    lines={[
      [{ text: "Whole" }, { text: "boards." }],
      [{ text: "One" }, { text: "click.", accent: true }],
    ]}
  />
);
