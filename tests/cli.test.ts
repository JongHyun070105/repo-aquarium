import { describe, expect, it } from "vitest";
import { parseGenerateArgs } from "../src/cli.js";

describe("parseGenerateArgs", () => {
  it("parses the documented generate command", () => {
    const parsed = parseGenerateArgs([
      "generate",
      "--repo", "acme/tank",
      "--theme", "deep-ocean",
      "--creatures", "turtle,seahorse,octopus",
      "--output", "build/aquarium.svg",
    ]);
    expect(parsed).toMatchObject({
      repository: "acme/tank",
      theme: "deep-ocean",
      creatures: ["turtle", "seahorse", "octopus"],
    });
    expect(parsed?.output).toMatch(/build\/aquarium\.svg$/);
    expect(parsed?.summary).toMatch(/build\/summary\.json$/);
  });

  it("defaults to contributors and normalizes the legacy fish alias", () => {
    const defaults = parseGenerateArgs([
      "generate",
      "--repo", "acme/tank",
      "--output", "build/aquarium.svg",
    ]);
    const legacy = parseGenerateArgs([
      "generate",
      "--repo", "acme/tank",
      "--creatures", "fish,contributors,crab",
      "--output", "build/aquarium.svg",
    ]);

    expect(defaults?.creatures).toEqual(["contributors", "jellyfish", "crab"]);
    expect(legacy?.creatures).toEqual(["contributors", "crab"]);
  });

  it("rejects invalid repositories, themes and output extensions", () => {
    expect(() => parseGenerateArgs(["generate", "--repo", "nope", "--output", "a.svg"])).toThrow("owner/repository");
    expect(() => parseGenerateArgs(["generate", "--repo", "acme/tank", "--theme", "space", "--output", "a.svg"])).toThrow("Unknown theme");
    expect(() => parseGenerateArgs(["generate", "--repo", "acme/tank", "--creatures", "dragon", "--output", "a.svg"])).toThrow("Unknown creature");
    expect(() => parseGenerateArgs(["generate", "--repo", "acme/tank", "--output", "a.png"])).toThrow("must end in .svg");
  });

  it("returns null for help", () => {
    expect(parseGenerateArgs(["--help"])).toBeNull();
  });
});
