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

const DEFAULT_CREATURES: readonly Creature[] = ["fish", "jellyfish", "crab"];

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
  <symbol id="turtle" viewBox="0 0 64 40"><path d="M15 11h8V7h24v4h8v5h7v11h-7v5h-8v4H23v-4h-8z" fill="${palette.plant}"/><path d="M24 11h22v4h5v14h-5v4H24v-4h-5V15h5z" fill="${palette.plantLight}"/><path d="M28 15h14v4h5v7h-5v4H28v-4h-5v-7h5z" fill="${palette.rockLight}"/><path d="M55 16h8v10h-8z" fill="${palette.plantLight}"/><path d="M59 18h3v3h-3z" fill="${palette.outline}"/><path class="flipper top" d="M22 11 10 1H4l8 15z" fill="${palette.plant}"/><path class="flipper bottom" d="m24 31-13 8H5l8-13z" fill="${palette.plant}"/></symbol>
  <symbol id="seahorse" viewBox="0 0 34 60"><path d="M13 4h12v4h5v13h-5v5h-8v7h8v12h-5v7h-6v4H5v-5h8v-5h5v-8h-8V23H5V11h4V7h4z" fill="${palette.coralLight}"/><path d="M8 14h12v5H8zm9 15h8v4h-8z" fill="${palette.coral}"/><path d="M22 11h5v5h-5z" fill="${palette.outline}"/><path d="M23 11h2v2h-2z" fill="#fff"/><path d="M7 23 0 18v14z" fill="${palette.coral}"/></symbol>
  <symbol id="octopus" viewBox="0 0 52 54"><path d="M10 9h5V4h22v5h5v5h5v21H5V14h5z" fill="${palette.coral}"/><path d="M14 13h7v7h-7zm17 0h7v7h-7z" fill="${palette.outline}"/><path d="M16 13h2v2h-2zm17 0h2v2h-2z" fill="#fff"/><path class="tentacle t1" d="M7 33h8v13h-4v7H4v-5h4z" fill="${palette.coralLight}"/><path class="tentacle t2" d="M18 33h7v20h-7z" fill="${palette.coralLight}"/><path class="tentacle t3" d="M28 33h7v20h-7z" fill="${palette.coralLight}"/><path class="tentacle t4" d="M38 33h8v15h4v5h-8v-7h-4z" fill="${palette.coralLight}"/></symbol>
  <symbol id="ray" viewBox="0 0 72 38"><path d="M4 21 22 8h28l18 13-18 10H22z" fill="${palette.rockLight}"/><path d="M17 16h38v9H17z" fill="${palette.glass}" opacity=".55"/><path d="m36 29 7 9H31z" fill="${palette.rock}"/><path d="M23 13h5v5h-5zm21 0h5v5h-5z" fill="${palette.outline}"/><path d="M25 13h2v2h-2zm21 0h2v2h-2z" fill="#fff"/></symbol>
  <symbol id="pufferfish" viewBox="0 0 48 42"><path d="M10 9h6V4h20v5h6v6h5v15h-5v6h-6v5H16v-5h-6v-6H5V15h5z" fill="${palette.glow}"/><path d="M0 21 8 13v16zM17 4 21 0l4 4zm12 0 4-4 3 5zM16 38l5 4 4-5zm16-1 3 5 4-6z" fill="${palette.coralLight}"/><path d="M34 13h7v7h-7z" fill="${palette.outline}"/><path d="M36 13h2v2h-2z" fill="#fff"/><path d="M37 25h8v3h-8z" fill="${palette.outline}"/></symbol>
  <symbol id="starfish" viewBox="0 0 38 38"><path d="m19 0 5 12 13-4-8 11 9 10-14-3-5 12-5-12-14 3 9-10L1 8l13 4z" fill="${palette.coral}"/><path d="M16 14h6v6h-6zm-4 9h4v4h-4zm12 0h4v4h-4z" fill="${palette.coralLight}"/></symbol>
`;

const bubbles = (model: AquariumModel): string => Array.from({ length: model.bubbleCount }, (_, index) => {
  const x = 28 + ((index * 83 + model.commits30d * 7) % 842);
  const y = 118 + ((index * 47) % 170);
  const size = 4 + (index % 4) * 2;
  const duration = (5.6 + (index % 7) * 0.7 - model.activityScore * 1.2).toFixed(1);
  return `<use href="#bubble" x="${x}" y="${y}" width="${size}" height="${size}" class="bubble b${index % 4}" style="--rise:${duration}s;--wait:-${(index % 11) * 0.7}s"/>`;
}).join("");

const fish = (model: AquariumModel, palette: ThemePalette): string => model.fish.map((item, index) => {
  const y = 106 + item.lane * 31 + (index % 2) * 5;
  const color = palette.fish[item.colorIndex];
  const fin = item.colorIndex % 2 === 0 ? palette.coralLight : palette.glow;
  const shine = index % 2 === 0 ? "#fff2a6" : "#dffbff";
  const reverse = item.reverse ? " reverse" : "";
  const restingX = item.reverse ? 680 - index * 72 : 72 + index * 82;
  const labelWidth = Math.min(120, Math.max(32, item.label.length * 6 + 8));
  return `<g class="swimmer${reverse}" data-contributor="${escapeXml(item.label)}" style="--swim:${item.speedSeconds}s;--delay:${item.delaySeconds}s;--lane:${y}px;--rest:${restingX}px;--scale:${item.scale}"><title>${escapeXml(item.label)} · ${escapeXml(item.language)}</title><use href="#px-fish-${item.species}" width="64" height="32" style="color:${color};--fin:${fin};--shine:${shine}"/><g class="fish-nameplate" transform="translate(32 -2)"><rect x="-${labelWidth / 2}" y="-12" width="${labelWidth}" height="11" rx="2"/><text class="fish-name" y="-4" text-anchor="middle" textLength="${Math.min(labelWidth - 8, item.label.length * 6)}" lengthAdjust="spacingAndGlyphs">${escapeXml(item.label)}</text></g></g>`;
}).join("");

export const resolveCreatures = (creatures?: readonly Creature[]): Creature[] => {
  const requested = creatures === undefined ? DEFAULT_CREATURES : creatures;
  return [...new Set(requested)].filter((creature): creature is Creature =>
    (CREATURES as readonly string[]).includes(creature));
};

interface CreaturePlacement {
  creature: Exclude<Creature, "fish">;
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
  { creature: "jellyfish", symbol: "jelly", label: "Jellyfish", x: 738, y: 118, width: 44, height: 54, className: "jelly-motion", motionX: 0, motionY: 8 },
  { creature: "crab", symbol: "crab", label: "Crab", x: 205, y: 276, width: 50, height: 30, className: "crab-motion", motionX: 90, motionY: 0 },
  { creature: "turtle", symbol: "turtle", label: "Sea turtle", x: 82, y: 166, width: 64, height: 40, className: "turtle-motion", motionX: 22, motionY: 5 },
  { creature: "seahorse", symbol: "seahorse", label: "Seahorse", x: 618, y: 160, width: 34, height: 60, className: "seahorse-motion", motionX: 0, motionY: 7 },
  { creature: "octopus", symbol: "octopus", label: "Octopus", x: 454, y: 218, width: 52, height: 54, className: "octopus-motion", motionX: 0, motionY: 5 },
  { creature: "ray", symbol: "ray", label: "Manta ray", x: 304, y: 112, width: 72, height: 38, className: "ray-motion", motionX: 42, motionY: 4 },
  { creature: "pufferfish", symbol: "pufferfish", label: "Pufferfish", x: 530, y: 126, width: 48, height: 42, className: "puffer-motion", motionX: 12, motionY: 4 },
  { creature: "starfish", symbol: "starfish", label: "Starfish", x: 770, y: 210, width: 38, height: 38, className: "starfish-motion", motionX: 0, motionY: 0 },
] as const;

const ambientCreatures = (creatures: readonly Creature[], model: AquariumModel): string => {
  const selected = new Set(creatures);
  return AMBIENT_PLACEMENTS
    .filter(({ creature }) => selected.has(creature))
    .map((placement, index) => {
      const phase = -(((model.commits30d + model.stars + index * 13) % 70) / 10);
      return `<g data-creature="${placement.creature}" data-safe-zone="underwater" data-anchor-x="${placement.x}" data-anchor-y="${placement.y}" data-width="${placement.width}" data-height="${placement.height}" data-motion-x-min="0" data-motion-x-max="${placement.motionX}" data-motion-y-min="0" data-motion-y-max="${placement.motionY}" transform="translate(${placement.x} ${placement.y})"><title>${placement.label}</title><g class="${placement.className}" style="--phase:${phase}s"><use href="#${placement.symbol}" width="${placement.width}" height="${placement.height}"/></g></g>`;
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
  const fishCount = creatures.includes("fish") ? model.fish.length : 0;
  const description = `${model.repository}: ${model.commits30d} commits in 30 days, ${fishCount} contributor fish, ${model.stars} stars. Creatures: ${creatures.join(", ") || "none"}. ${model.ciLabel}.`;
  return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="900" height="320" viewBox="0 0 900 320" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges" role="img" aria-labelledby="${titleId} ${descId}" data-theme="${theme}">
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
      .surface{animation:surface 5s steps(4,end) infinite}.theme-accent{animation:accent 6s steps(4,end) infinite alternate}.ray-a{animation:ray 8s steps(8,end) infinite}.ray-b{animation:ray 11s steps(8,end) -4s infinite}.far{animation:drift 16s steps(16,end) infinite}.plant-motion{transform-box:fill-box;transform-origin:bottom center;animation:sway 3.4s steps(4,end) infinite alternate}.plant-motion.alt{animation-delay:-1.7s}.plant-root{fill:${palette.plant}}.plant-mound{fill:${palette.sandDark}}.bubble{animation:rise var(--rise) steps(18,end) var(--wait) infinite}.b1{opacity:.55}.b2{opacity:.8}.b3{opacity:.4}
      .swimmer{transform:translate(-80px,var(--lane)) scale(var(--scale));animation:swim var(--swim) linear var(--delay) infinite}.swimmer.reverse{animation-name:swim-reverse}.swimmer.reverse use{transform:translateX(64px) scaleX(-1)}.tail{transform-box:fill-box;transform-origin:right center;animation:tail .45s steps(2,end) infinite}.pearl{animation:twinkle 2.8s steps(3,end) infinite}.p1{animation-delay:-.7s}.p2{animation-delay:-1.4s}.p3{animation-delay:-2.1s}.jelly-motion{animation:jelly 4.2s steps(5,end) var(--phase) infinite}.crab-motion{animation:crab 13s steps(20,end) var(--phase) infinite}.turtle-motion{animation:turtle 9s steps(12,end) var(--phase) infinite}.seahorse-motion{animation:seahorse 4.8s steps(6,end) var(--phase) infinite}.octopus-motion{animation:octopus 4s steps(5,end) var(--phase) infinite}.ray-motion{animation:ray-swim 8s steps(12,end) var(--phase) infinite}.puffer-motion{transform-origin:center;animation:puffer 5s steps(4,end) var(--phase) infinite}.starfish-motion{transform-origin:center;animation:starfish 12s steps(12,end) var(--phase) infinite}.flipper{transform-box:fill-box;transform-origin:right center;animation:flipper 1.2s steps(2,end) infinite alternate}.tentacle{transform-box:fill-box;transform-origin:top center;animation:tentacle 1.8s steps(3,end) infinite alternate}.t2,.t4{animation-delay:-.9s}.chest.open .lid{transform-box:fill-box;transform-origin:left bottom;animation:chest 4s steps(3,end) infinite}.buoy.in-progress{animation:signal 1.5s steps(2,end) infinite}.buoy.failure{animation:signal .8s steps(2,end) infinite}
      @keyframes surface{50%{transform:translateX(-12px)}}@keyframes accent{to{opacity:.7}}@keyframes ray{50%{opacity:.35;transform:translateX(25px)}}@keyframes drift{to{transform:translateX(35px)}}@keyframes sway{from{transform:skewX(-4deg)}to{transform:skewX(4deg)}}@keyframes rise{from{transform:translateY(15px);opacity:0}15%{opacity:.8}to{transform:translateY(-210px);opacity:0}}@keyframes swim{from{transform:translate(-80px,var(--lane)) scale(var(--scale))}to{transform:translate(980px,var(--lane)) scale(var(--scale))}}@keyframes swim-reverse{from{transform:translate(980px,var(--lane)) scale(var(--scale))}to{transform:translate(-80px,var(--lane)) scale(var(--scale))}}@keyframes tail{50%{transform:scaleX(.55)}}@keyframes twinkle{50%{opacity:.35}}@keyframes jelly{50%{transform:translateY(8px) scaleY(.92)}}@keyframes crab{50%{transform:translateX(90px)}}@keyframes turtle{50%{transform:translate(22px,5px)}}@keyframes seahorse{50%{transform:translateY(7px) rotate(2deg)}}@keyframes octopus{50%{transform:translateY(5px) scaleY(.95)}}@keyframes ray-swim{50%{transform:translate(42px,4px)}}@keyframes puffer{50%{transform:translate(12px,4px) scale(1.05)}}@keyframes starfish{to{transform:rotate(12deg)}}@keyframes flipper{to{transform:rotate(13deg)}}@keyframes tentacle{to{transform:skewX(6deg)}}@keyframes chest{50%{transform:rotate(-7deg)}}@keyframes signal{50%{opacity:.45}}
      @media(prefers-reduced-motion:reduce){*{animation:none!important}.swimmer,.swimmer.reverse{transform:translate(var(--rest),var(--lane)) scale(var(--scale))}.bubble{opacity:.65}.chest.open .lid{transform:rotate(-18deg) translateY(-7px)}}
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
    <g clip-path="url(#water-zone-${theme})">${bubbles(model)}${creatures.includes("fish") ? fish(model, palette) : ""}${ambientCreatures(creatures, model)}</g>
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
