import { XMLParser } from "fast-xml-parser";
import { describe, expect, it } from "vitest";
import { renderAquarium } from "../src/render/index.js";
import { CREATURES, THEMES } from "../src/model.js";
import { activeStats, emptyStats } from "./fixtures/stats.js";

describe("renderAquarium", () => {
  it.each(THEMES)("renders a valid, compact %s SVG", (theme) => {
    const svg = renderAquarium(theme, activeStats);
    const document = new XMLParser({ ignoreAttributes: false }).parse(svg) as Record<string, unknown>;

    expect(document).toHaveProperty("svg");
    expect(svg).toContain('viewBox="0 0 900 320"');
    expect(svg).toContain('shape-rendering="crispEdges"');
    expect(svg).toContain(`data-theme="${theme}"`);
    expect(Buffer.byteLength(svg)).toBeLessThan(600 * 1024);
  });

  it("is byte-for-byte deterministic", () => {
    expect(renderAquarium("coral-day", activeStats)).toBe(renderAquarium("coral-day", structuredClone(activeStats)));
  });

  it("reuses pixel-art symbols and includes the full motion system", () => {
    const svg = renderAquarium("deep-ocean", activeStats);

    for (const symbol of ["px-fish-0", "bubble", "pearl", "jelly", "crab", "spark"]) {
      expect(svg).toContain(`<symbol id="${symbol}"`);
      expect(svg).toContain(`href="#${symbol}"`);
    }
    for (const animation of ["surface", "ray", "drift", "rise", "swim", "tail", "twinkle", "jelly", "crab", "chest", "signal"]) {
      expect(svg).toContain(`@keyframes ${animation}`);
    }
  });

  it("defaults to contributor fish, jellyfish, and crab", () => {
    const svg = renderAquarium("coral-day", activeStats);

    expect(svg).toContain('href="#px-fish-');
    expect(svg).toContain('data-creature="jellyfish"');
    expect(svg).toContain('data-creature="crab"');
    expect(svg).not.toContain('data-creature="turtle"');
  });

  it("renders every contributor name as visible text attached to its fish", () => {
    const svg = renderAquarium("coral-day", activeStats, { creatures: ["fish"] });

    for (const { login } of activeStats.contributors) {
      expect(svg).toMatch(new RegExp(`<g class="swimmer[^>]*>[^<]*(?:<[^>]+>[^<]*)*<text[^>]*>${login}</text>`));
    }
    expect([...svg.matchAll(/<text[^>]*class="[^"]*fish-name[^"]*"[^>]*>/g)]).toHaveLength(activeStats.contributors.length);
  });

  it("does not render a language legend entry below one percent", () => {
    const svg = renderAquarium("github-dark", {
      ...activeStats,
      languages: [
        { name: "TypeScript", bytes: 9_801, share: 0.9801 },
        { name: "CSS", bytes: 100, share: 0.01 },
        { name: "Shell", bytes: 99, share: 0.0099 },
      ],
    });

    expect(svg).toContain("TypeScript 98%");
    expect(svg).toContain("CSS 1%");
    expect(svg).not.toContain("Shell");
  });

  it("renders every configurable creature from reusable original symbols", () => {
    const svg = renderAquarium("sunset-lagoon", activeStats, { creatures: [...CREATURES] });
    const symbols = ["turtle", "seahorse", "octopus", "ray", "pufferfish", "starfish"];

    for (const creature of CREATURES.filter((value) => value !== "fish")) {
      expect(svg).toContain(`data-creature="${creature}"`);
    }
    for (const symbol of symbols) {
      expect(svg).toContain(`<symbol id="${symbol}"`);
      expect(svg).toContain(`href="#${symbol}"`);
    }
    for (const animation of ["turtle", "seahorse", "octopus", "ray-swim", "puffer", "starfish", "flipper", "tentacle"]) {
      expect(svg).toContain(`@keyframes ${animation}`);
    }
  });

  it("gives each new theme its own scene decoration", () => {
    expect(renderAquarium("sunset-lagoon", activeStats)).toContain('data-theme-decoration="sunset-reflection"');
    expect(renderAquarium("arctic-ice", activeStats)).toContain('data-theme-decoration="ice-shelf"');
    expect(renderAquarium("neon-cyber", activeStats)).toContain('data-theme-decoration="neon-grid"');
  });

  it("allows a deliberately creature-free environmental scene", () => {
    const svg = renderAquarium("arctic-ice", activeStats, { creatures: [] });

    expect(svg).not.toContain('data-creature="');
    expect(svg).not.toContain('class="swimmer');
    expect(svg).toContain("Creatures: none");
  });

  it("keeps positioned creature anchors separate from animated inner groups", () => {
    const svg = renderAquarium("neon-cyber", activeStats, { creatures: [...CREATURES] });

    for (const match of svg.matchAll(/<g data-creature="([^"]+)"[^>]*transform="translate\(([^)]+)\)"[^>]*><title>[^<]+<\/title><g class="([^"]+-motion)"/g)) {
      expect(match[1]).toBeTruthy();
      expect(match[2]).toBeTruthy();
      expect(match[3]).toBeTruthy();
    }
    expect([...svg.matchAll(/data-creature=/g)]).toHaveLength(CREATURES.length - 1);
    expect(svg).not.toMatch(/<g class="(?:jelly|crab|turtle|seahorse|octopus|ray|puffer|starfish)-motion"[^>]*transform="translate/);
    expect(svg).toContain('transform="translate(52 220)"><g class="plant-motion"');
    expect(svg).toContain('transform="translate(590 209)"><g class="plant-motion alt"');
  });

  it("anchors plants to the floor and limits their animation to rooted swaying", () => {
    const svg = renderAquarium("coral-day", activeStats);
    const sway = svg.match(/@keyframes sway\{([^}]|}(?!@keyframes))*}/)?.[0] ?? "";

    expect(svg).toContain(".plant-motion{transform-box:fill-box;transform-origin:bottom center;");
    expect(svg).toContain('data-scene-object="plant" data-safe-zone="underwater" data-root-y="287" transform="translate(52 220)"><g class="plant-motion"');
    expect(svg).toContain('data-scene-object="plant" data-safe-zone="underwater" data-root-y="287" transform="translate(590 209)"><g class="plant-motion alt"');
    expect(svg).toContain('class="plant-root"');
    expect(svg).toContain('class="plant-mound"');
    expect(svg).not.toContain('.near{animation:');
    expect(sway).toContain("skewX(");
    expect(sway).not.toMatch(/translate[XY]?\(/);
  });

  it("keeps every ambient creature below the protected header and inside the tank at motion extremes", () => {
    const svg = renderAquarium("coral-day", activeStats, { creatures: [...CREATURES] });
    const openingTags = [...svg.matchAll(/<g data-creature="[^"]+"[^>]+>/g)].map(([tag]) => tag);

    expect(svg).toContain('<clipPath id="water-zone-coral-day"><rect x="8" y="88" width="884" height="224"/></clipPath>');
    expect(openingTags).toHaveLength(CREATURES.length - 1);
    for (const tag of openingTags) {
      const number = (name: string): number => Number(tag.match(new RegExp(`${name}="(-?[\\d.]+)"`))?.[1]);
      const x = number("data-anchor-x");
      const y = number("data-anchor-y");
      const width = number("data-width");
      const height = number("data-height");
      const minX = number("data-motion-x-min");
      const maxX = number("data-motion-x-max");
      const minY = number("data-motion-y-min");
      const maxY = number("data-motion-y-max");

      expect(tag).toContain('data-safe-zone="underwater"');
      expect(x + minX).toBeGreaterThanOrEqual(8);
      expect(x + width + maxX).toBeLessThanOrEqual(892);
      expect(y + minY).toBeGreaterThanOrEqual(88);
      expect(y + height + maxY).toBeLessThanOrEqual(312);
    }
  });

  it("has accessible text, non-color CI state, and reduced-motion fallback", () => {
    const svg = renderAquarium("github-dark", activeStats, { title: "A & B <reef>" });

    expect(svg).toContain('role="img"');
    expect(svg).toContain("<title id=");
    expect(svg).toContain("<desc id=");
    expect(svg).toContain("A &amp; B &lt;reef&gt;");
    expect(svg).toContain("SUCCESS");
    expect(svg).toContain("@media(prefers-reduced-motion:reduce)");
    expect(svg).toContain("animation:none!important");
  });

  it("renders data-empty fixtures without NaN, undefined, or broken references", () => {
    const svg = renderAquarium("coral-day", emptyStats);
    const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);

    expect(svg).not.toMatch(/NaN|undefined/);
    expect(new Set(ids).size).toBe(ids.length);
    for (const reference of svg.matchAll(/(?:href|url\()=["']?#?([\w-]+)/g)) {
      expect(reference[1]).toBeTruthy();
    }
  });
});
