import { describe, expect, it } from "vitest";
import { CREATURES, THEMES, isCreature, isTheme, normalizeCiState, normalizeStats } from "../src/model.js";
import { activeStats, emptyStats } from "./fixtures/stats.js";

describe("normalizeStats", () => {
  it("maps activity into deterministic aquarium features", () => {
    const first = normalizeStats(activeStats);
    const second = normalizeStats(structuredClone(activeStats));

    expect(first).toEqual(second);
    expect(first.activity).toBe("surging");
    expect(first.fish).toHaveLength(4);
    expect(first.languages).toHaveLength(4);
    expect(first.languages.map(({ name }) => name)).not.toContain("Shell");
    expect(first.bubbleCount).toBeGreaterThan(20);
    expect(first.pearlCount).toBeGreaterThan(1);
    expect(first.chestOpen).toBe(true);
    expect(first.ciState).toBe("success");
    expect(first.legendaryVisible).toBe(true);
    expect(first.mergedPullRequests30d).toBe(5);
    expect(first.fish.map(({ evolutionStage }) => evolutionStage)).toContain(3);
    expect(first.fish.map(({ evolutionStage }) => evolutionStage)).toContain(1);
  });

  it("provides a complete but quiet scene when GitHub has no data", () => {
    const model = normalizeStats(emptyStats);

    expect(model.activity).toBe("still");
    expect(model.fish.length).toBeGreaterThan(0);
    expect(model.bubbleCount).toBe(8);
    expect(model.pearlCount).toBe(0);
    expect(model.lastCommitLabel).toBe("no commits yet");
    expect(model.chestOpen).toBe(false);
    expect(model.ciState).toBe("unknown");
  });

  it("caps contributors and sorts them by contribution count", () => {
    const model = normalizeStats({
      ...activeStats,
      contributors: Array.from({ length: 12 }, (_, index) => ({ login: `user-${index}`, contributions: index })),
    });

    expect(model.fish).toHaveLength(8);
    expect(model.fish[0]?.label).toBe("user-11");
    expect(model.fish.at(-1)?.label).toBe("user-4");
  });

  it("hides languages below one percent of the repository while keeping the one-percent boundary", () => {
    const model = normalizeStats({
      ...activeStats,
      languages: [
        { name: "TypeScript", bytes: 9_801, share: 0.9801 },
        { name: "CSS", bytes: 100, share: 0.01 },
        { name: "Shell", bytes: 99, share: 0.0099 },
      ],
    });

    expect(model.languages.map(({ name }) => name)).toEqual(["TypeScript", "CSS"]);
    expect(model.languages.map(({ share }) => share)).toEqual([0.9801, 0.01]);
  });

  it("uses a logarithmic star scale", () => {
    const one = normalizeStats({ ...emptyStats, stars: 1 }).pearlCount;
    const hundred = normalizeStats({ ...emptyStats, stars: 100 }).pearlCount;
    const million = normalizeStats({ ...emptyStats, stars: 1_000_000 }).pearlCount;

    expect(one).toBeLessThan(hundred);
    expect(hundred).toBeLessThan(million);
    expect(million).toBeLessThanOrEqual(14);
  });

  it("shows legendary release creatures for seven days only", () => {
    const recent = normalizeStats({ ...activeStats, latestRelease: { tagName: "v2", publishedAt: "2026-07-06T12:00:00.000Z" } });
    const old = normalizeStats({ ...activeStats, latestRelease: { tagName: "v1", publishedAt: "2026-07-04T11:59:59.000Z" } });

    expect(recent.legendaryVisible).toBe(true);
    expect(old.legendaryVisible).toBe(false);
  });
});

describe("normalizeCiState", () => {
  it.each([
    ["completed", "success", "success"],
    ["completed", "failure", "failure"],
    ["completed", "cancelled", "failure"],
    ["in_progress", null, "in-progress"],
    ["queued", null, "in-progress"],
    ["completed", "neutral", "neutral"],
  ])("maps %s / %s to %s", (status, conclusion, expected) => {
    expect(normalizeCiState({ workflow: "CI", status, conclusion })).toBe(expected);
  });
});

describe("public render choices", () => {
  it("publishes the complete theme and creature sets", () => {
    expect(THEMES).toEqual([
      "coral-day",
      "deep-ocean",
      "github-dark",
      "sunset-lagoon",
      "arctic-ice",
      "neon-cyber",
    ]);
    expect(CREATURES).toEqual([
      "contributors",
      "fish",
      "jellyfish",
      "crab",
      "turtle",
      "seahorse",
      "octopus",
      "ray",
      "pufferfish",
      "starfish",
    ]);
    expect(isTheme("neon-cyber")).toBe(true);
    expect(isCreature("octopus")).toBe(true);
    expect(isCreature("shark")).toBe(false);
  });
});
