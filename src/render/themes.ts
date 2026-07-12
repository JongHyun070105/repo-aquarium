import type { Theme } from "../model.js";

export interface ThemePalette {
  sky: string;
  waterTop: string;
  waterBottom: string;
  glass: string;
  sand: string;
  sandDark: string;
  rock: string;
  rockLight: string;
  plant: string;
  plantLight: string;
  coral: string;
  coralLight: string;
  text: string;
  muted: string;
  outline: string;
  glow: string;
  fish: readonly [string, string, string, string];
}

export const PALETTES: Record<Theme, ThemePalette> = {
  "coral-day": {
    sky: "#d9fff4",
    waterTop: "#36d6c0",
    waterBottom: "#087f91",
    glass: "#9ffff0",
    sand: "#ffd37a",
    sandDark: "#d99555",
    rock: "#535b78",
    rockLight: "#7885a3",
    plant: "#087f5b",
    plantLight: "#38d980",
    coral: "#f75f78",
    coralLight: "#ff9d8d",
    text: "#083344",
    muted: "#155e75",
    outline: "#073b4c",
    glow: "#fff3a3",
    fish: ["#ff7657", "#ffd166", "#9b7ede", "#23b5d3"],
  },
  "deep-ocean": {
    sky: "#06132d",
    waterTop: "#092a50",
    waterBottom: "#020617",
    glass: "#164e78",
    sand: "#283853",
    sandDark: "#172238",
    rock: "#111b34",
    rockLight: "#33476d",
    plant: "#124e66",
    plantLight: "#22d3a7",
    coral: "#7657c9",
    coralLight: "#d87cff",
    text: "#d9f9ff",
    muted: "#8edcf2",
    outline: "#020617",
    glow: "#71fff0",
    fish: ["#25e6c8", "#69b7ff", "#ca7cff", "#f4e285"],
  },
  "github-dark": {
    sky: "#0d1117",
    waterTop: "#172c3d",
    waterBottom: "#0d1117",
    glass: "#264a5f",
    sand: "#30363d",
    sandDark: "#21262d",
    rock: "#161b22",
    rockLight: "#484f58",
    plant: "#238636",
    plantLight: "#39d353",
    coral: "#a371f7",
    coralLight: "#d2a8ff",
    text: "#f0f6fc",
    muted: "#8b949e",
    outline: "#010409",
    glow: "#56d364",
    fish: ["#39d353", "#58a6ff", "#d29922", "#f778ba"],
  },
  "sunset-lagoon": {
    sky: "#4a214f",
    waterTop: "#e06576",
    waterBottom: "#46235f",
    glass: "#ffb077",
    sand: "#f3a65a",
    sandDark: "#b64d62",
    rock: "#512a54",
    rockLight: "#86516c",
    plant: "#176b69",
    plantLight: "#47c7a8",
    coral: "#ff5d73",
    coralLight: "#ffad87",
    text: "#fff3dd",
    muted: "#ffd0b3",
    outline: "#301735",
    glow: "#ffe38a",
    fish: ["#ff8364", "#ffd166", "#58d6c7", "#b992ff"],
  },
  "arctic-ice": {
    sky: "#e8fbff",
    waterTop: "#91dded",
    waterBottom: "#245b82",
    glass: "#d9fbff",
    sand: "#b8dce8",
    sandDark: "#729eb5",
    rock: "#486a83",
    rockLight: "#8bb7c9",
    plant: "#257b79",
    plantLight: "#7de1cf",
    coral: "#8a75c9",
    coralLight: "#c4b8f4",
    text: "#103654",
    muted: "#356681",
    outline: "#12344d",
    glow: "#f8ffff",
    fish: ["#207ea0", "#6c8de8", "#8b63b8", "#47b9a8"],
  },
  "neon-cyber": {
    sky: "#10051f",
    waterTop: "#1d1042",
    waterBottom: "#070312",
    glass: "#00e5ff",
    sand: "#25204f",
    sandDark: "#110b2c",
    rock: "#17122e",
    rockLight: "#423a70",
    plant: "#00a67e",
    plantLight: "#00ffb7",
    coral: "#ff2ead",
    coralLight: "#ff82d4",
    text: "#f4edff",
    muted: "#a992d4",
    outline: "#05010d",
    glow: "#e7ff38",
    fish: ["#00f0ff", "#ff3dbb", "#b7ff2a", "#9b6cff"],
  },
};
