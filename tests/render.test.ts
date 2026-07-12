import { XMLParser } from "fast-xml-parser";
import { describe, expect, it } from "vitest";
import { renderAquarium } from "../src/render/index.js";
import { THEMES } from "../src/model.js";
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
