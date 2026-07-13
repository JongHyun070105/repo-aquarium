import {
  CREATURES,
  normalizeStats,
  type AquariumModel,
  type Creature,
  type RepositoryStats,
  type Theme,
} from "../model.js";
import { PALETTES, type ThemePalette } from "./themes.js";

export interface RenderOptions {
  title?: string;
  creatures?: Creature[];
}

const DEFAULT_CREATURES: readonly Creature[] = ["contributors", "jellyfish", "crab"];

const escapeXml = (value: string): string => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const compact = (markup: string): string => markup
  .replace(/\n\s*/g, "")
  .replace(/>\s+</g, "><")
  .trim();

const symbolDefs = (palette: ThemePalette): string => `
  <symbol id="px-fish-0" viewBox="0 0 64 32">
    <path class="tail" d="M15 16 2 5v22z" fill="var(--fin)"/>
    <path d="M14 8h8V4h24v4h8v4h6v8h-6v4h-8v4H22v-4h-8z" fill="currentColor"/>
    <path d="M22 8h24v4H22zm-4 4h8v4h-8z" fill="var(--shine)" opacity=".8"/>
    <path d="M46 12h6v6h-6z" fill="${palette.outline}"/><path d="M48 12h2v2h-2z" fill="#fff"/>
    <path d="M28 24h12l-6 6z" fill="var(--fin)"/>
  </symbol>
  <symbol id="px-fish-1" viewBox="0 0 64 32">
    <path class="tail" d="M14 16 2 3h8l10 8v10L10 29H2z" fill="var(--fin)"/>
    <path d="M14 12h8V8h30v4h8v8h-8v4H22v-4h-8z" fill="currentColor"/>
    <path d="M25 8h7v16h-7zm14 0h6v16h-6z" fill="var(--shine)" opacity=".72"/>
    <path d="M50 12h6v6h-6z" fill="${palette.outline}"/><path d="M52 12h2v2h-2z" fill="#fff"/>
  </symbol>
  <symbol id="px-fish-2" viewBox="0 0 64 32">
    <path class="tail" d="M16 16 4 8v16z" fill="var(--fin)"/>
    <path d="M14 13h7V8h8V4h14v4h9v5h8v7h-8v5h-9v3H28v-3h-7v-5h-7z" fill="currentColor"/>
    <path d="M26 8h17v5H26zm-5 5h9v4h-9z" fill="var(--shine)" opacity=".75"/>
    <path d="M49 12h6v6h-6z" fill="${palette.outline}"/><path d="M51 12h2v2h-2z" fill="#fff"/>
    <path d="M34 4h9l-4-4z" fill="var(--fin)"/>
  </symbol>
  <symbol id="px-fish-3" viewBox="0 0 64 32">
    <path class="tail" d="M17 16 4 5v22z" fill="var(--fin)"/>
    <path d="M15 11h10V6h24v5h8v4h5v6h-5v4h-8v3H25v-3H15z" fill="currentColor"/>
    <path d="M25 6h16v5H25zm-4 5h9v5h-9z" fill="var(--shine)" opacity=".78"/>
    <path d="M49 12h6v6h-6z" fill="${palette.outline}"/><path d="M51 12h2v2h-2z" fill="#fff"/>
    <path d="m31 25 9 7H25z" fill="var(--fin)"/>
  </symbol>
  <symbol id="bubble" viewBox="0 0 8 8"><path d="M2 0h4v2h2v4H6v2H2V6H0V2h2z" fill="none" stroke="${palette.glass}" stroke-width="1"/><path d="M2 2h2v1H2z" fill="#fff" opacity=".7"/></symbol>
  <symbol id="pearl" viewBox="0 0 12 12"><path d="M2 2h2V0h4v2h2v2h2v4h-2v2H8v2H4v-2H2V8H0V4h2z" fill="${palette.glow}"/><path d="M3 2h3v2H3z" fill="#fff"/></symbol>
  <symbol id="spark" viewBox="0 0 12 12"><path d="M5 0h2v4h4v2H7v5H5V6H1V4h4z" fill="${palette.glow}"/></symbol>
  <symbol id="jelly" viewBox="0 0 44 54"><path d="M8 8h4V4h20v4h4v4h4v17H4V12h4z" fill="${palette.coralLight}"/><path d="M10 10h6v6h-6zm20 0h5v6h-5z" fill="#fff" opacity=".35"/><path d="M8 29h6v17h-4v8H6v-8h2zm12 0h6v21h-6zm14 0h4v17h-4v8h-4v-8h2z" fill="${palette.coral}"/></symbol>
  <symbol id="crab" viewBox="0 0 50 30"><path d="M12 12h26v14H12z" fill="${palette.coral}"/><path d="M16 8h5v5h-5zm13 0h5v5h-5z" fill="${palette.outline}"/><path d="M4 10h8v5H8v5H2v-5H0V8h4zm34 0h8V8h4v7h-2v5h-6v-5h-4z" fill="${palette.coralLight}"/><path d="M13 26h7v4h-9zm17 0h7l2 4h-9z" fill="${palette.outline}"/></symbol>
  <symbol id="turtle" viewBox="0 0 64 40"><path d="M15 11h8V7h24v4h8v5h7v11h-7v5h-8v4H23v-4h-8z" fill="var(--accent, ${palette.plant})"/><path d="M24 11h22v4h5v14h-5v4H24v-4h-5V15h5z" fill="var(--body, ${palette.plantLight})"/><path d="M28 15h14v4h5v7h-5v4H28v-4h-5v-7h5z" fill="var(--shine, ${palette.rockLight})"/><path d="M55 16h8v10h-8z" fill="var(--body, ${palette.plantLight})"/><path d="M59 18h3v3h-3z" fill="${palette.outline}"/><path class="flipper top" d="M22 11 10 1H4l8 15z" fill="var(--accent, ${palette.plant})"/><path class="flipper bottom" d="m24 31-13 8H5l8-13z" fill="var(--accent, ${palette.plant})"/></symbol>
  <symbol id="seahorse" viewBox="0 0 34 60"><path d="M13 4h12v4h5v13h-5v5h-8v7h8v12h-5v7h-6v4H5v-5h8v-5h5v-8h-8V23H5V11h4V7h4z" fill="${palette.coralLight}"/><path d="M8 14h12v5H8zm9 15h8v4h-8z" fill="${palette.coral}"/><path d="M22 11h5v5h-5z" fill="${palette.outline}"/><path d="M23 11h2v2h-2z" fill="#fff"/><path d="M7 23 0 18v14z" fill="${palette.coral}"/></symbol>
  <symbol id="octopus" viewBox="0 0 52 54"><path d="M10 9h5V4h22v5h5v5h5v21H5V14h5z" fill="var(--body, ${palette.coral})"/><path d="M14 13h7v7h-7zm17 0h7v7h-7z" fill="${palette.outline}"/><path d="M16 13h2v2h-2zm17 0h2v2h-2z" fill="#fff"/><path class="tentacle t1" d="M7 33h8v13h-4v7H4v-5h4z" fill="var(--accent, ${palette.coralLight})"/><path class="tentacle t2" d="M18 33h7v20h-7z" fill="var(--accent, ${palette.coralLight})"/><path class="tentacle t3" d="M28 33h7v20h-7z" fill="var(--accent, ${palette.coralLight})"/><path class="tentacle t4" d="M38 33h8v15h4v5h-8v-7h-4z" fill="var(--accent, ${palette.coralLight})"/></symbol>
  <symbol id="ray" viewBox="0 0 72 38"><path d="M4 21 22 8h28l18 13-18 10H22z" fill="${palette.rockLight}"/><path d="M17 16h38v9H17z" fill="${palette.glass}" opacity=".55"/><path d="m36 29 7 9H31z" fill="${palette.rock}"/><path d="M23 13h5v5h-5zm21 0h5v5h-5z" fill="${palette.outline}"/><path d="M25 13h2v2h-2zm21 0h2v2h-2z" fill="#fff"/></symbol>
  <symbol id="pufferfish" viewBox="0 0 48 42"><path d="M10 9h6V4h20v5h6v6h5v15h-5v6h-6v5H16v-5h-6v-6H5V15h5z" fill="${palette.glow}"/><path d="M0 21 8 13v16zM17 4 21 0l4 4zm12 0 4-4 3 5zM16 38l5 4 4-5zm16-1 3 5 4-6z" fill="${palette.coralLight}"/><path d="M34 13h7v7h-7z" fill="${palette.outline}"/><path d="M36 13h2v2h-2z" fill="#fff"/><path d="M37 25h8v3h-8z" fill="${palette.outline}"/></symbol>
  <symbol id="starfish" viewBox="0 0 38 38"><path d="m19 0 5 12 13-4-8 11 9 10-14-3-5 12-5-12-14 3 9-10L1 8l13 4z" fill="${palette.coral}"/><path d="M16 14h6v6h-6zm-4 9h4v4h-4zm12 0h4v4h-4z" fill="${palette.coralLight}"/></symbol>
  <symbol id="px-abyss-fish" viewBox="0 0 64 32"><path class="tail" d="M16 16 3 5v22z" fill="var(--fin)"/><path d="M14 10h9V6h25v4h8v5h7v7h-7v4H23v-4h-9z" fill="currentColor"/><path d="M24 10h23v4H24z" fill="var(--shine)" opacity=".45"/><path d="M48 13h6v6h-6z" fill="${palette.outline}"/><path d="M51 14h2v2h-2z" fill="${palette.glow}"/><path d="M58 12h4v2h-4zm4-4h2v4h-2z" fill="${palette.glow}"/></symbol>
  <symbol id="px-code-fish" viewBox="0 0 64 32"><path class="tail" d="M16 16 3 7v18z" fill="var(--fin)"/><path d="M15 9h10V5h24v4h8v5h6v8h-6v5H25v-4H15z" fill="currentColor"/><path d="M24 10h7v4h-7zm10 0h14v4H34zm-10 8h18v4H24z" fill="var(--shine)"/><path d="M49 13h5v5h-5z" fill="${palette.outline}"/></symbol>
  <symbol id="px-sunset-fish" viewBox="0 0 64 32"><path class="tail" d="M17 16 2 4l6 12-6 12z" fill="var(--fin)"/><path d="M15 11h9V6h27v5h7v4h5v7h-5v4h-7v3H24v-3h-9z" fill="currentColor"/><path d="M24 7h21v5H24zm0 11h27v4H24z" fill="var(--shine)" opacity=".75"/><path d="M50 13h5v5h-5z" fill="${palette.outline}"/></symbol>
  <symbol id="px-ice-fish" viewBox="0 0 64 32"><path class="tail" d="M17 16 4 6v20z" fill="var(--fin)"/><path d="M15 10h10V6h26v4h7v5h5v7h-5v4h-8v3H25v-3H15z" fill="currentColor"/><path d="M24 7h18l8 5H24zm5 13h19v4H29z" fill="var(--shine)" opacity=".85"/><path d="M50 13h5v5h-5z" fill="${palette.outline}"/></symbol>
  <symbol id="px-cyber-fish" viewBox="0 0 64 32"><path class="tail" d="M17 16 3 5h6l10 7v8L9 27H3z" fill="var(--fin)"/><path d="M16 9h9V5h25v4h8v5h5v8h-5v5h-8v3H25v-4h-9z" fill="currentColor"/><path d="M23 10h9v4h-9zm13 0h13v4H36zM25 19h22v3H25z" fill="var(--shine)"/><path d="M50 13h6v6h-6z" fill="${palette.outline}"/><path d="M52 14h3v3h-3z" fill="${palette.glow}"/></symbol>
  <symbol id="theme-reef-sprite" viewBox="0 0 48 44"><path d="M8 17h5V9h7V4h9v5h7v8h5v13h-5v7h-7v5H18v-5h-7v-7H6V17z" fill="${palette.coralLight}"/><path d="M14 18h20v7H14z" fill="${palette.glow}"/><path d="M15 13h5v5h-5zm13 0h5v5h-5z" fill="${palette.outline}"/></symbol>
  <symbol id="theme-angler" viewBox="0 0 62 44"><path d="M13 12h10V7h23v5h8v6h6v14h-6v5h-8v4H23v-4H13z" fill="${palette.rockLight}"/><path d="M13 22 2 10v25z" fill="${palette.coral}"/><path d="M44 16h7v7h-7z" fill="${palette.outline}"/><path d="M47 17h3v3h-3z" fill="${palette.glow}"/><path d="M49 11V5h8V1h4v8h-8v4z" fill="${palette.glow}"/></symbol>
  <symbol id="theme-octocat" viewBox="0 0 52 52"><path d="m11 13 5-11 8 8h8l8-8 3 12 5 7v18h-7v8h-9v4H20v-4h-9v-8H4V21z" fill="var(--body, ${palette.text})"/><path d="M14 20h24v17H14z" fill="var(--accent, ${palette.rockLight})"/><path d="M17 23h6v6h-6zm13 0h6v6h-6z" fill="${palette.outline}"/><path d="M20 35h12v4H20z" fill="var(--shine, ${palette.glow})"/></symbol>
  <symbol id="theme-sunbird" viewBox="0 0 58 42"><path d="M7 18h13l8-9h10l6 6h9v13h-9l-8 8H20l-7-7H2z" fill="var(--body, ${palette.coralLight})"/><path d="m21 18 8-16 9 16z" fill="var(--shine, ${palette.glow})"/><path d="M42 18h7v6h-7z" fill="${palette.outline}"/><path d="m6 18-6-8v22l8-5z" fill="var(--accent, ${palette.coral})"/></symbol>
  <symbol id="theme-penguin" viewBox="0 0 42 56"><path d="M10 8h5V3h13v5h5v7h5v28h-5v8h-7v4H16v-4H9v-8H4V15h6z" fill="var(--body, ${palette.outline})"/><path d="M13 17h16v8h5v18h-5v7H13v-7H8V25h5z" fill="#f5fbff"/><path d="M14 12h5v5h-5zm10 0h5v5h-5z" fill="var(--shine, ${palette.glow})"/><path d="m19 20 5 4-5 4z" fill="var(--accent, ${palette.coralLight})"/></symbol>
  <symbol id="theme-drone" viewBox="0 0 62 42"><path d="M12 12h38v22H12z" fill="var(--body, ${palette.rock})"/><path d="M17 8h28v4H17zm0 26h28v4H17z" fill="var(--shine, ${palette.glow})"/><path d="M18 17h9v9h-9zm17 0h9v9h-9z" fill="${palette.outline}"/><path d="M21 19h4v4h-4zm17 0h4v4h-4z" fill="var(--shine, ${palette.glow})"/><path d="M3 5h17v4H3zm39 0h17v4H42zM7 1h4v12H7zm44 0h4v12h-4z" fill="var(--accent, ${palette.coralLight})"/><path d="M26 29h10v4H26z" fill="var(--shine, ${palette.glow})"/></symbol>
  <symbol id="legend-whale" viewBox="0 0 220 88"><path d="M32 34h18V24h93v7h24v8h18v11h18v20h-18v8h-30v7H68v-7H44v-8H25V53H8V36h24z" fill="currentColor"/><path d="M143 31 166 8h16l-12 27zm27 4 23-22h17l-18 31z" fill="var(--fin)"/><path d="M48 50h16v8H48z" fill="var(--shine)"/><path d="M156 46h10v10h-10z" fill="${palette.outline}"/></symbol>
  <symbol id="legend-kraken" viewBox="0 0 150 104"><path d="M35 12h12V5h56v7h12v12h10v42H25V24h10z" fill="currentColor"/><path d="M45 28h14v14H45zm45 0h14v14H90z" fill="${palette.outline}"/><path d="M49 30h5v5h-5zm45 0h5v5h-5z" fill="${palette.glow}"/><path d="M28 63h18v25H35v14H18V91h9zm28 0h16v41H56zm26 0h16v41H82zm26 0h18v28h9v11h-20V88h-7z" fill="var(--fin)"/></symbol>
`;

const bubbles = (model: AquariumModel): string => Array.from({ length: model.bubbleCount }, (_, index) => {
  const x = 28 + ((index * 83 + model.commits30d * 7) % 842);
  const y = 118 + ((index * 47) % 170);
  const size = 4 + (index % 4) * 2;
  const duration = (5.6 + (index % 7) * 0.7 - model.activityScore * 1.2).toFixed(1);
  return `<use href="#bubble" x="${x}" y="${y}" width="${size}" height="${size}" class="bubble b${index % 4}" style="--rise:${duration}s;--wait:-${(index % 11) * 0.7}s"/>`;
}).join("");

interface ContributorSprite {
  symbol: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const contributorSprite = (theme: Theme): ContributorSprite => {
  if (theme === "deep-ocean") return { symbol: "octopus", label: "abyss octopod", x: 6, y: 0, width: 52, height: 54 };
  if (theme === "github-dark") return { symbol: "theme-octocat", label: "Octocat diver", x: 6, y: 1, width: 52, height: 52 };
  if (theme === "sunset-lagoon") return { symbol: "theme-sunbird", label: "sunset skyfin", x: 3, y: 5, width: 58, height: 42 };
  if (theme === "arctic-ice") return { symbol: "theme-penguin", label: "polar penguin", x: 11, y: 0, width: 42, height: 56 };
  if (theme === "neon-cyber") return { symbol: "theme-drone", label: "maintenance drone", x: 1, y: 5, width: 62, height: 42 };
  return { symbol: "turtle", label: "reef turtle", x: 0, y: 7, width: 64, height: 40 };
};

const evolutionMark = (stage: 1 | 2 | 3, palette: ThemePalette): string => {
  if (stage === 3) {
    return `<g class="evolution-mark" data-evolution="guardian"><path d="M18 5 23 0l5 5 6-5 5 5v6H18z" fill="${palette.glow}"/><path d="M20 8h17v4H20z" fill="${palette.coralLight}"/></g>`;
  }
  if (stage === 2) {
    return `<g class="evolution-mark" data-evolution="adept"><path d="M54 23h6v6h-6z" fill="${palette.glow}"/><path d="M56 19h2v14h-2zm-4 6h10v2H52z" fill="${palette.coralLight}"/></g>`;
  }
  return `<g class="evolution-mark" data-evolution="hatchling"><path d="M55 25h5v5h-5z" fill="${palette.glow}"/></g>`;
};

const contributorCast = (theme: Theme, model: AquariumModel, palette: ThemePalette): string => {
  const sprite = contributorSprite(theme);
  return model.fish.map((item, index) => {
  const y0 = 108 + (index % 4) * 37;
  const y1 = 126 + ((index * 41) % 96);
  const y2 = 104 + ((index * 29) % 92);
  const y3 = 118 + ((index * 53) % 100);
  const x0 = 50 + (index % 3) * 18;
  const x1 = 300 + (index % 4) * 28;
  const x2 = 748 - (index % 3) * 22;
  const x3 = 410 + (index % 4) * 24;
  const color = palette.fish[item.colorIndex];
  const fin = item.colorIndex % 2 === 0 ? palette.coralLight : palette.glow;
  const shine = index % 2 === 0 ? "#fff2a6" : "#dffbff";
  const restingX = 72 + (index % 4) * 178;
  const restingY = 112 + (index % 4) * 40;
  const labelWidth = Math.min(120, Math.max(32, item.label.length * 6 + 8));
  return `<g class="swimmer contributor-wander stage-${item.evolutionStage}" data-contributor="${escapeXml(item.label)}" data-contributor-form="${sprite.symbol}" data-evolution-stage="${item.evolutionStage}" data-activity-points="${item.activityPoints}" style="--swim:${Math.max(12, item.speedSeconds + 4)}s;--delay:${item.delaySeconds}s;--x0:${x0}px;--x1:${x1}px;--x2:${x2}px;--x3:${x3}px;--y0:${y0}px;--y1:${y1}px;--y2:${y2}px;--y3:${y3}px;--rest:${restingX}px;--rest-y:${restingY}px;--scale:${item.scale}"><title>${escapeXml(item.label)} · ${sprite.label} · evolution ${item.evolutionStage} · ${escapeXml(item.activityLabel)} · ${escapeXml(item.language)}</title><g class="contributor-facing"><use href="#${sprite.symbol}" x="${sprite.x}" y="${sprite.y}" width="${sprite.width}" height="${sprite.height}" style="--body:${color};--accent:${fin};--shine:${shine}"/>${evolutionMark(item.evolutionStage, palette)}</g><g class="fish-nameplate" transform="translate(32 -2)"><rect x="-${labelWidth / 2}" y="-12" width="${labelWidth}" height="11" rx="2"/><text class="fish-name" y="-4" text-anchor="middle" textLength="${Math.min(labelWidth - 8, item.label.length * 6)}" lengthAdjust="spacingAndGlyphs">${escapeXml(item.label)}</text></g></g>`;
}).join("");
};

export const resolveCreatures = (creatures?: readonly Creature[]): Creature[] => {
  const requested = creatures === undefined ? DEFAULT_CREATURES : creatures;
  return [...new Set(requested.map((creature) => creature === "fish" ? "contributors" : creature))]
    .filter((creature) => (CREATURES as readonly string[]).includes(creature)) as Creature[];
};

interface CreaturePlacement {
  creature: Exclude<Creature, "fish" | "contributors">;
  symbol: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  className: string;
  motionX: number;
  motionY: number;
}

const AMBIENT_PLACEMENTS: readonly CreaturePlacement[] = [
  { creature: "jellyfish", symbol: "jelly", label: "Jellyfish", x: 650, y: 120, width: 44, height: 54, className: "jelly-motion", motionX: 120, motionY: 80 },
  { creature: "crab", symbol: "crab", label: "Crab", x: 205, y: 248, width: 50, height: 30, className: "crab-motion", motionX: 150, motionY: 20 },
  { creature: "turtle", symbol: "turtle", label: "Sea turtle", x: 82, y: 150, width: 64, height: 40, className: "turtle-motion", motionX: 120, motionY: 70 },
  { creature: "seahorse", symbol: "seahorse", label: "Seahorse", x: 618, y: 130, width: 34, height: 60, className: "seahorse-motion", motionX: 80, motionY: 80 },
  { creature: "octopus", symbol: "octopus", label: "Octopus", x: 454, y: 180, width: 52, height: 54, className: "octopus-motion", motionX: 90, motionY: 50 },
  { creature: "ray", symbol: "ray", label: "Manta ray", x: 304, y: 110, width: 72, height: 38, className: "ray-motion", motionX: 120, motionY: 80 },
  { creature: "pufferfish", symbol: "pufferfish", label: "Pufferfish", x: 530, y: 116, width: 48, height: 42, className: "puffer-motion", motionX: 100, motionY: 70 },
  { creature: "starfish", symbol: "starfish", label: "Starfish", x: 770, y: 190, width: 38, height: 38, className: "starfish-motion", motionX: 60, motionY: 50 },
] as const;

const ambientCreatures = (creatures: readonly Creature[], model: AquariumModel): string => {
  const selected = new Set(creatures);
  return AMBIENT_PLACEMENTS
    .filter(({ creature }) => selected.has(creature))
    .map((placement, index) => {
      const phase = -(((model.commits30d + model.stars + index * 13) % 70) / 10);
      const halfX = Math.round(placement.motionX / 2);
      const thirdX = Math.round(placement.motionX / 3);
      const halfY = Math.round(placement.motionY / 2);
      return `<g data-creature="${placement.creature}" data-safe-zone="underwater" data-anchor-x="${placement.x}" data-anchor-y="${placement.y}" data-width="${placement.width}" data-height="${placement.height}" data-motion-x-min="0" data-motion-x-max="${placement.motionX}" data-motion-y-min="0" data-motion-y-max="${placement.motionY}" transform="translate(${placement.x} ${placement.y})"><title>${placement.label}</title><g class="free-roam roam-${index % 3}" style="--phase:${phase}s;--roam-time:${11 + index * 1.3}s;--roam-x:${placement.motionX}px;--roam-x-half:${halfX}px;--roam-x-third:${thirdX}px;--roam-y:${placement.motionY}px;--roam-y-half:${halfY}px"><g class="${placement.className}"><use href="#${placement.symbol}" width="${placement.width}" height="${placement.height}"/></g></g></g>`;
    })
    .join("");
};

const pearls = (model: AquariumModel): string => Array.from({ length: model.pearlCount }, (_, index) => {
  const x = 104 + ((index * 71) % 690);
  const y = 278 - (index % 3) * 4;
  return `<use href="#pearl" x="${x}" y="${y}" width="${7 + (index % 3) * 2}" height="${7 + (index % 3) * 2}" class="pearl p${index % 4}"/>`;
}).join("");

const languageLegend = (model: AquariumModel, palette: ThemePalette): string => {
  const list = model.languages.length > 0 ? model.languages : [{ name: "No language data", share: 0, species: 0 as const }];
  return list.map((language, index) => {
    const x = 28 + index * 174;
    const width = Math.round(language.share * 100);
    return `<g transform="translate(${x} 58)"><rect width="10" height="10" fill="${palette.fish[index % 4]}"/><text x="15" y="9" class="legend">${escapeXml(language.name)}${model.languages.length ? ` ${width}%` : ""}</text></g>`;
  }).join("");
};

const themeDecorations = (theme: Theme, palette: ThemePalette): string => {
  if (theme === "sunset-lagoon") {
    return `<g data-theme-decoration="sunset-reflection" class="theme-accent" opacity=".55"><path d="M816 96h48v5h-48zm8 11h32v4h-32zm6 10h20v4h-20zm5 10h10v4h-10z" fill="${palette.glow}"/><path d="M824 88h32v4h-32z" fill="${palette.coralLight}"/></g>`;
  }
  if (theme === "arctic-ice") {
    return `<g data-theme-decoration="ice-shelf"><path d="M8 88h88l12 8h60l15-8h91v10h-54l-13 8h-84l-15-8H8zm612 0h66l14 7h57l13-7h122v10h-98l-11 7h-91l-14-7h-58z" fill="${palette.glow}" opacity=".82"/><path d="M96 98h72l-9 9h-52zm604 0h57l-8 8h-38z" fill="${palette.glass}" opacity=".65"/></g>`;
  }
  if (theme === "neon-cyber") {
    return `<g data-theme-decoration="neon-grid" class="theme-accent" opacity=".2" stroke="${palette.glow}" fill="none"><path d="M120 112h660M90 152h720M55 202h790M20 262h860"/><path d="m170 88-70 197m210-197-35 197m175-197v197M590 88l35 197M730 88l70 197"/></g>`;
  }
  return "";
};

const themeCharacter = (theme: Theme): { symbol: string; label: string; x: number; y: number; width: number; height: number } => {
  if (theme === "deep-ocean") return { symbol: "theme-angler", label: "Abyss lantern keeper", x: 126, y: 192, width: 62, height: 44 };
  if (theme === "github-dark") return { symbol: "theme-octocat", label: "Octocat code diver", x: 118, y: 205, width: 52, height: 52 };
  if (theme === "sunset-lagoon") return { symbol: "theme-sunbird", label: "Sunset skyfin", x: 130, y: 178, width: 58, height: 42 };
  if (theme === "arctic-ice") return { symbol: "theme-penguin", label: "Polar repository penguin", x: 138, y: 210, width: 42, height: 56 };
  if (theme === "neon-cyber") return { symbol: "theme-drone", label: "Neon maintenance drone", x: 124, y: 188, width: 62, height: 42 };
  return { symbol: "theme-reef-sprite", label: "Coral reef sprite", x: 136, y: 198, width: 48, height: 44 };
};

const themeCast = (theme: Theme): string => {
  const character = themeCharacter(theme);
  return `<g data-theme-character="${character.symbol}" data-world="${theme}" data-motion-x-max="150" data-motion-y-max="55" transform="translate(${character.x} ${Math.min(character.y, 180)})"><title>${character.label}</title><g class="free-roam roam-1" style="--phase:-2.7s;--roam-time:13s;--roam-x:150px;--roam-x-half:75px;--roam-x-third:50px;--roam-y:55px;--roam-y-half:28px"><g class="theme-character"><use href="#${character.symbol}" width="${character.width}" height="${character.height}"/></g></g></g>`;
};

const legendaryCreature = (theme: Theme, model: AquariumModel, palette: ThemePalette): string => {
  if (!model.legendaryVisible || !model.releaseLabel) return "";
  const kraken = theme === "deep-ocean";
  const symbol = kraken ? "legend-kraken" : "legend-whale";
  const label = theme === "neon-cyber" ? "Legendary mecha whale" : kraken ? "Legendary release kraken" : "Legendary release whale";
  const x = kraken ? 355 : 300;
  const y = kraken ? 140 : 130;
  const width = kraken ? 150 : 220;
  const height = kraken ? 104 : 88;
  const mechaOverlay = theme === "neon-cyber"
    ? `<g data-mecha-upgrade="true" fill="${palette.glow}"><path d="M74 45h42v4H74zm46 0h18v4h-18zM96 34h5v15h-5zm47 10h13v4h-13z"/><path d="M64 55h8v8h-8zm83-10h8v8h-8z" fill="${palette.coralLight}"/></g>`
    : "";
  return `<g data-event="release-legendary" data-release="${escapeXml(model.releaseLabel)}" data-motion-x-max="100" data-motion-y-max="30" transform="translate(${x} ${y})" opacity=".28"><title>${label}: ${escapeXml(model.releaseLabel)} · visible for 7 days</title><g class="free-roam roam-2" style="--phase:-4s;--roam-time:18s;--roam-x:100px;--roam-x-half:50px;--roam-x-third:34px;--roam-y:30px;--roam-y-half:15px"><g class="legendary"><use href="#${symbol}" width="${width}" height="${height}" style="color:${palette.coralLight};--fin:${palette.coral};--shine:${palette.glow}"/>${mechaOverlay}</g></g></g>`;
};

const repositoryPhenomena = (model: AquariumModel, palette: ThemePalette): string => {
  const meteorCount = Math.min(6, model.mergedPullRequests30d);
  const meteors = meteorCount > 0
    ? `<g data-phenomenon="merge-meteor-shower"><title>${model.mergedPullRequests30d} merged pull requests in the recent event window</title>${Array.from({ length: meteorCount }, (_, index) => {
      const x = 210 + index * 103;
      const y = 106 + (index % 3) * 28;
      return `<path class="meteor m${index}" d="M${x} ${y}h8l-21 21h-8z" fill="${palette.glow}"/>`;
    }).join("")}</g>`
    : "";
  const aurora = model.closedIssues30d > 0
    ? `<g data-phenomenon="issue-aurora" opacity=".34"><title>${model.closedIssues30d} issues closed in the recent event window</title><path class="aurora" d="M45 124c95-35 155 34 250 0s155 32 250 0 155 30 310-4v25c-120 32-192-18-296 12s-160-27-258 3S137 139 45 166z" fill="${palette.plantLight}"/></g>`
    : "";
  const reviews = model.reviews30d > 0
    ? `<g data-phenomenon="review-constellation"><title>${model.reviews30d} pull request reviews in the recent event window</title>${Array.from({ length: Math.min(8, model.reviews30d) }, (_, index) => `<use href="#spark" class="review-star r${index}" x="${92 + index * 91}" y="${112 + (index % 3) * 37}" width="${6 + index % 3}"/>`).join("")}</g>`
    : "";
  const storm = model.ciState === "failure"
    ? `<g data-phenomenon="ci-storm"><title>${escapeXml(model.ciLabel)} · storm active</title><path class="lightning" d="M720 102h22l-17 35h15l-33 49 10-38h-15z" fill="${palette.glow}"/>${Array.from({ length: 9 }, (_, index) => `<path class="rain rain-${index}" d="M${75 + index * 94} 108l-11 28" stroke="${palette.glass}" stroke-width="3"/>`).join("")}</g>`
    : "";
  return `${aurora}${meteors}${reviews}${storm}`;
};

const ciBuoy = (model: AquariumModel, palette: ThemePalette): string => {
  const color = model.ciState === "success" ? "#39d353" : model.ciState === "failure" ? "#ff5d68" : model.ciState === "in-progress" ? "#ffd166" : palette.muted;
  const icon = model.ciState === "success"
    ? '<path d="m4 10 4 4L17 5l3 3L8 19 1 12z" fill="#fff"/>'
    : model.ciState === "failure"
      ? '<path d="m3 4 3-3 5 5 5-5 3 3-5 5 5 5-3 3-5-5-5 5-3-3 5-5z" fill="#fff"/>'
      : model.ciState === "in-progress"
        ? '<path d="M2 3h18v4l-6 5 6 5v4H2v-4l6-5-6-5zm5 4 4 3 4-3zm0 10h8l-4-3z" fill="#fff"/>'
        : '<path d="M9 2h4v12H9zm0 16h4v4H9z" fill="#fff"/>';
  return `<g class="buoy ${model.ciState}" transform="translate(798 90)"><path d="M31 0h10v18H31z" fill="${palette.outline}"/><rect x="18" y="16" width="36" height="13" fill="${color}"/><path d="M13 29h46l-6 23H19z" fill="#f5f7fa"/><path d="M16 35h40l-2 9H18z" fill="${color}"/><g transform="translate(25 2) scale(.72)">${icon}</g><path d="M35 52h4v31h-4z" fill="${palette.outline}"/><text x="36" y="96" text-anchor="middle" class="tiny">${escapeXml(model.ciState.toUpperCase())}</text><title>${escapeXml(model.ciLabel)}</title></g>`;
};

const treasure = (model: AquariumModel, palette: ThemePalette): string => {
  const lid = model.chestOpen ? "rotate(-18 52 11) translate(0 -7)" : "";
  const sparkles = model.chestOpen ? '<use href="#spark" x="32" y="-18" width="12"/><use href="#spark" x="67" y="-10" width="8" class="p2"/>' : "";
  return `<g class="chest ${model.chestOpen ? "open" : "closed"}" transform="translate(680 249)">${sparkles}<g class="lid" transform="${lid}"><path d="M9 1h78v11H9z" fill="${palette.outline}"/><path d="M13 4h70v8H13z" fill="#b26a32"/><path d="M44 2h10v12H44z" fill="${palette.glow}"/></g><path d="M7 13h82v35H7z" fill="${palette.outline}"/><path d="M12 17h72v26H12z" fill="#8b4b2b"/><path d="M43 16h12v18H43z" fill="${palette.glow}"/><path d="M20 21h16v5H20zm42 0h15v5H62z" fill="#d58942"/><title>${model.releaseLabel ? `Latest release: ${escapeXml(model.releaseLabel)}` : "No release detected"}</title></g>`;
};

const scene = (theme: Theme, model: AquariumModel, creatures: readonly Creature[]): string => {
  const palette = PALETTES[theme];
  const titleId = `title-${theme}`;
  const descId = `desc-${theme}`;
  const contributorCount = creatures.includes("contributors") ? model.fish.length : 0;
  const description = `${model.repository}: ${model.commits30d} commits in 30 days, ${contributorCount} evolving contributors, ${model.mergedPullRequests30d} merges, ${model.closedIssues30d} closed issues, ${model.reviews30d} reviews, ${model.stars} stars. World: ${theme}. Creatures: ${creatures.join(", ") || "none"}. ${model.ciLabel}.`;
  return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="900" height="320" viewBox="0 0 900 320" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges" role="img" aria-labelledby="${titleId} ${descId}" data-theme="${theme}" data-world="${theme}">
  <title id="${titleId}">${escapeXml(model.title)} · Repo Aquarium</title>
  <desc id="${descId}">${escapeXml(description)} Motion pauses when reduced motion is preferred.</desc>
  <defs>
    <linearGradient id="water-${theme}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${palette.waterTop}"/><stop offset="1" stop-color="${palette.waterBottom}"/></linearGradient>
    <linearGradient id="ray-${theme}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".24"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="tank-${theme}"><rect x="8" y="8" width="884" height="304" rx="7"/></clipPath>
    <clipPath id="water-zone-${theme}"><rect x="8" y="88" width="884" height="224"/></clipPath>
    ${symbolDefs(palette)}
    <style>
      text{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;fill:${palette.text}}.heading{font-size:18px;font-weight:700;letter-spacing:.5px}.meta{font-size:11px;fill:${palette.muted}}.legend{font-size:10px;fill:${palette.text}}.tiny{font-size:8px;font-weight:700;fill:${palette.text}}.fish-name{font-size:8px;font-weight:700;fill:#fff}.fish-nameplate rect{fill:${palette.outline};opacity:.82}
      .surface{animation:surface 5s steps(4,end) infinite}.theme-accent{animation:accent 6s steps(4,end) infinite alternate}.ray-a{animation:ray 8s steps(8,end) infinite}.ray-b{animation:ray 11s steps(8,end) -4s infinite}.far{animation:drift 16s steps(16,end) infinite}.plant-motion{transform-box:fill-box;transform-origin:bottom center;animation:sway 4.6s steps(6,end) infinite alternate}.plant-motion.alt{animation-delay:-2.3s}.plant-root{fill:${palette.plant}}.plant-mound{fill:${palette.sandDark}}.bubble{animation:rise var(--rise) steps(18,end) var(--wait) infinite}.b1{opacity:.55}.b2{opacity:.8}.b3{opacity:.4}.free-roam{animation:roam-a var(--roam-time) steps(30,end) var(--phase) infinite}.free-roam.roam-1{animation-name:roam-b}.free-roam.roam-2{animation-name:roam-c}.theme-character{transform-origin:center;animation:character-pulse 3.8s steps(4,end) infinite alternate}.legendary{transform-origin:center;animation:legendary-pulse 6s steps(6,end) infinite alternate}.meteor{animation:meteor 3.8s steps(6,end) infinite}.m1,.m4{animation-delay:-1.2s}.m2,.m5{animation-delay:-2.4s}.aurora{animation:aurora 7s steps(6,end) infinite alternate}.review-star{animation:twinkle 2.4s steps(3,end) infinite}.r1,.r4,.r7{animation-delay:-.8s}.r2,.r5{animation-delay:-1.6s}.lightning{animation:lightning 2.6s steps(2,end) infinite}.rain{animation:rain 1.8s steps(5,end) infinite}.rain-1,.rain-4,.rain-7{animation-delay:-.6s}.rain-2,.rain-5,.rain-8{animation-delay:-1.2s}
      .swimmer{animation:contributor-wander var(--swim) steps(48,end) var(--delay) infinite}.contributor-facing{transform-box:fill-box;transform-origin:32px center;animation:contributor-turn var(--swim) steps(1,end) var(--delay) infinite}.evolution-mark{animation:twinkle 3s steps(3,end) infinite}.stage-1 .evolution-mark{opacity:.7}.stage-3 .evolution-mark{animation-duration:1.8s}.tail{transform-box:fill-box;transform-origin:right center;animation:tail .45s steps(2,end) infinite}.pearl{animation:twinkle 2.8s steps(3,end) infinite}.p1{animation-delay:-.7s}.p2{animation-delay:-1.4s}.p3{animation-delay:-2.1s}.jelly-motion{animation:jelly 4.2s steps(5,end) var(--phase) infinite}.crab-motion{animation:crab 4.6s steps(6,end) var(--phase) infinite}.turtle-motion{animation:turtle 3.8s steps(5,end) var(--phase) infinite}.seahorse-motion{animation:seahorse 4.8s steps(6,end) var(--phase) infinite}.octopus-motion{animation:octopus 4s steps(5,end) var(--phase) infinite}.ray-motion{animation:ray-swim 3.8s steps(5,end) var(--phase) infinite}.puffer-motion{transform-origin:center;animation:puffer 5s steps(4,end) var(--phase) infinite}.starfish-motion{transform-origin:center;animation:starfish 8s steps(12,end) var(--phase) infinite}.flipper{transform-box:fill-box;transform-origin:right center;animation:flipper 1.2s steps(2,end) infinite alternate}.tentacle{transform-box:fill-box;transform-origin:top center;animation:tentacle 1.8s steps(3,end) infinite alternate}.t2,.t4{animation-delay:-.9s}.chest.open .lid{transform-box:fill-box;transform-origin:left bottom;animation:chest 4s steps(3,end) infinite}.buoy.in-progress{animation:signal 1.5s steps(2,end) infinite}.buoy.failure{animation:signal .8s steps(2,end) infinite}
      @keyframes surface{50%{transform:translateX(-12px)}}@keyframes accent{to{opacity:.7}}@keyframes ray{50%{opacity:.35;transform:translateX(25px)}}@keyframes drift{to{transform:translateX(35px)}}@keyframes sway{from{transform:skewX(-2.5deg)}to{transform:skewX(2.5deg)}}@keyframes roam-a{0%,100%{transform:translate(0,0)}25%{transform:translate(var(--roam-x-half),var(--roam-y))}50%{transform:translate(var(--roam-x),var(--roam-y-half))}75%{transform:translate(var(--roam-x-third),0)}}@keyframes roam-b{0%,100%{transform:translate(0,var(--roam-y-half))}25%{transform:translate(var(--roam-x-third),0)}50%{transform:translate(var(--roam-x),var(--roam-y))}75%{transform:translate(var(--roam-x-half),var(--roam-y-half))}}@keyframes roam-c{0%,100%{transform:translate(0,0)}33%{transform:translate(var(--roam-x),var(--roam-y-half))}66%{transform:translate(var(--roam-x-third),var(--roam-y))}}@keyframes character-pulse{to{transform:rotate(3deg) scale(1.04)}}@keyframes legendary-pulse{to{transform:scale(1.03)}}@keyframes contributor-wander{0%,100%{transform:translate(var(--x0),var(--y0)) scale(var(--scale))}25%{transform:translate(var(--x1),var(--y1)) scale(var(--scale))}50%{transform:translate(var(--x2),var(--y2)) scale(var(--scale))}75%{transform:translate(var(--x3),var(--y3)) scale(var(--scale))}}@keyframes contributor-turn{0%,49%{transform:scaleX(1)}50%,99%{transform:scaleX(-1)}100%{transform:scaleX(1)}}@keyframes meteor{from{transform:translate(35px,-35px);opacity:0}35%{opacity:.9}to{transform:translate(-35px,35px);opacity:0}}@keyframes aurora{to{transform:translateX(22px);opacity:.55}}@keyframes lightning{0%,45%,55%,100%{opacity:0}50%{opacity:1}}@keyframes rain{from{transform:translate(15px,-25px)}to{transform:translate(-15px,70px)}}@keyframes rise{from{transform:translateY(15px);opacity:0}15%{opacity:.8}to{transform:translateY(-210px);opacity:0}}@keyframes tail{50%{transform:scaleX(.55)}}@keyframes twinkle{50%{opacity:.35}}@keyframes jelly{50%{transform:translateY(8px) scaleY(.92)}}@keyframes crab{50%{transform:translateY(-3px)}}@keyframes turtle{50%{transform:rotate(3deg)}}@keyframes seahorse{50%{transform:translateY(7px) rotate(2deg)}}@keyframes octopus{50%{transform:translateY(5px) scaleY(.95)}}@keyframes ray-swim{50%{transform:rotate(-3deg)}}@keyframes puffer{50%{transform:scale(1.05)}}@keyframes starfish{to{transform:rotate(18deg)}}@keyframes flipper{to{transform:rotate(13deg)}}@keyframes tentacle{to{transform:skewX(6deg)}}@keyframes chest{50%{transform:rotate(-7deg)}}@keyframes signal{50%{opacity:.45}}
      @media(prefers-reduced-motion:reduce){*{animation:none!important}.swimmer{transform:translate(var(--rest),var(--rest-y)) scale(var(--scale))}.contributor-facing{transform:none}.bubble{opacity:.65}.chest.open .lid{transform:rotate(-18deg) translateY(-7px)}}
    </style>
  </defs>
  <g clip-path="url(#tank-${theme})">
    <rect width="900" height="320" fill="${palette.sky}"/>
    <rect y="88" width="900" height="232" fill="url(#water-${theme})"/>
    ${themeDecorations(theme, palette)}
    <g class="surface" opacity=".8"><path d="M0 92h50v-4h48v4h48v4h52v-4h52v-4h50v4h52v4h48v-4h50v-4h50v4h50v4h52v-4h52v-4h48v4h50v4h48v-4h50v-4h52v4h50v8H0z" fill="${palette.glass}"/></g>
    <path class="ray-a" d="m85 88 82 0 92 191H198z" fill="url(#ray-${theme})"/><path class="ray-b" d="m390 88 58 0 68 165h-45z" fill="url(#ray-${theme})"/><path class="ray-a" d="m690 88 68 0 55 143h-38z" fill="url(#ray-${theme})"/>
    <g class="far" opacity=".45"><path d="M-30 263h90l20-35 24 35h77l32-29 37 29h91l29-38 42 38h93l37-28 26 28h98l26-37 36 37h140v57H-30z" fill="${palette.rock}"/></g>
    ${languageLegend(model, palette)}
    <text x="28" y="31" class="heading">${escapeXml(model.title)}</text><text x="28" y="48" class="meta">${model.commits30d} commits / 30d · ${model.stars} stars · ${escapeXml(model.lastCommitLabel)}</text>
    <g clip-path="url(#water-zone-${theme})">${repositoryPhenomena(model, palette)}${legendaryCreature(theme, model, palette)}${bubbles(model)}${creatures.includes("contributors") ? contributorCast(theme, model, palette) : ""}${ambientCreatures(creatures, model)}${themeCast(theme)}</g>
    ${ciBuoy(model, palette)}
    <g class="near"><path d="M0 285h900v35H0z" fill="${palette.sand}"/><path d="M0 300h900v20H0z" fill="${palette.sandDark}"/><path d="M0 287h65v4h72v-3h80v5h85v-4h70v3h90v-5h78v4h92v-3h90v5h89v-4h89v31H0z" fill="${palette.sand}"/></g>
    <g data-scene-object="plant" data-safe-zone="underwater" data-root-y="287" transform="translate(52 220)"><g class="plant-motion"><path d="M10 67V12h8v55zm8-31 20-22v10L18 47zm-8 8L0 28v-9l10 13z" fill="${palette.plant}"/><path d="M14 57V25h4v32z" fill="${palette.plantLight}"/></g><rect class="plant-root" x="10" y="61" width="8" height="12"/><path class="plant-mound" d="M3 67h24l5 7H-2z"/></g>
    <g data-scene-object="plant" data-safe-zone="underwater" data-root-y="287" transform="translate(590 209)"><g class="plant-motion alt"><path d="M12 78V15h8v63zm8-37 21-24v12L20 52zM12 51 0 35V23l12 15z" fill="${palette.plant}"/><path d="M16 65V24h4v41z" fill="${palette.plantLight}"/></g><rect class="plant-root" x="12" y="71" width="8" height="13"/><path class="plant-mound" d="M4 78h25l5 7H-2z"/></g>
    <g transform="translate(805 250)"><path d="M20 55V13h7v42zM8 54V31h7v23zm19-25 12-15v13L27 42zM20 27 9 14V4l11 12z" fill="${palette.coral}"/><path d="M23 40V20h4v20z" fill="${palette.coralLight}"/></g>
    ${pearls(model)}
    ${treasure(model, palette)}
    <g transform="translate(330 282)"><path d="M0 12h17V5h12v7h20v19H0z" fill="${palette.rock}"/><path d="M10 7h8V0h9v7z" fill="${palette.rockLight}"/></g>
  </g>
  <rect x="4" y="4" width="892" height="312" rx="10" fill="none" stroke="${palette.outline}" stroke-width="8"/>
  <text x="876" y="304" text-anchor="end" class="tiny" opacity=".75">REPO AQUARIUM · ${escapeXml(model.activity.toUpperCase())}</text>
</svg>`;
};

export const renderAquarium = (theme: Theme, stats: RepositoryStats, options: RenderOptions = {}): string =>
  compact(scene(theme, normalizeStats(stats, options), resolveCreatures(options.creatures)));

export { PALETTES } from "./themes.js";
