#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { realpathSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collectRepositoryStats, parseRepository, toRepositoryStats } from "./github/index.js";
import { CREATURES, renderAquarium, THEMES, type Creature, type Theme } from "./index.js";

interface GenerateOptions {
  repository: string;
  theme: Theme;
  output: string;
  summary: string;
  title?: string;
  ciWorkflow?: string;
  creatures: Creature[];
}

const HELP = `Repo Aquarium

Usage:
  repo-aquarium generate --repo owner/repository --theme coral-day --output aquarium.svg

Options:
  --repo <owner/repository>  Public or token-accessible repository (required)
  --theme <name>             One of the six built-in aquarium themes
  --creatures <list>         Comma-separated cast (default: contributors,jellyfish,crab)
  --output <path>            SVG output path (required)
  --summary <path>           Stats JSON path (default: summary.json beside SVG)
  --title <text>             Override the aquarium title
  --ci-workflow <name>       Include the latest default-branch workflow state
  -h, --help                 Show this help

Authentication:
  Set GITHUB_TOKEN for private repositories or higher API limits. The token is
  sent only to api.github.com and is never written to output or logs.`;

function valueAfter(args: string[], index: number, flag: string): string {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`Missing value for ${flag}.`);
  return value;
}

export function parseGenerateArgs(argv: string[]): GenerateOptions | null {
  if (argv.includes("--help") || argv.includes("-h")) return null;
  if (argv[0] !== "generate") throw new Error(`Unknown command "${argv[0] ?? ""}". Use "generate".`);
  const values = new Map<string, string>();
  const allowed = new Set(["--repo", "--theme", "--creatures", "--output", "--summary", "--title", "--ci-workflow"]);
  for (let index = 1; index < argv.length; index += 1) {
    const flag = argv[index]!;
    if (!allowed.has(flag)) throw new Error(`Unknown option "${flag}".`);
    values.set(flag, valueAfter(argv, index, flag));
    index += 1;
  }
  const repository = values.get("--repo");
  const output = values.get("--output");
  const theme = values.get("--theme") ?? "coral-day";
  if (!repository) throw new Error("--repo is required.");
  parseRepository(repository);
  if (!output) throw new Error("--output is required.");
  if (extname(output).toLowerCase() !== ".svg") throw new Error("--output must end in .svg.");
  if (!(THEMES as readonly string[]).includes(theme)) {
    throw new Error(`Unknown theme "${theme}". Choose one of: ${THEMES.join(", ")}.`);
  }
  const creatureValues = (values.get("--creatures") ?? "contributors,jellyfish,crab")
    .split(",")
    .map((creature) => creature.trim())
    .filter(Boolean);
  const creatures = [...new Set(creatureValues)];
  if (creatures.length === 0) throw new Error("--creatures must include at least one creature.");
  for (const creature of creatures) {
    if (!(CREATURES as readonly string[]).includes(creature)) {
      throw new Error(`Unknown creature "${creature}". Choose from: ${CREATURES.join(", ")}.`);
    }
  }
  const absoluteOutput = resolve(output);
  const summaryOption = values.get("--summary");
  return {
    repository,
    theme: theme as Theme,
    output: absoluteOutput,
    summary: summaryOption ? resolve(summaryOption) : resolve(dirname(absoluteOutput), "summary.json"),
    title: values.get("--title"),
    ciWorkflow: values.get("--ci-workflow"),
    creatures: [...new Set(creatures.map((creature) => creature === "fish" ? "contributors" : creature))] as Creature[],
  };
}

export async function runCli(argv = process.argv.slice(2)): Promise<number> {
  let options: GenerateOptions | null;
  try {
    options = parseGenerateArgs(argv);
  } catch (error) {
    process.stderr.write(`repo-aquarium: ${error instanceof Error ? error.message : String(error)}\n`);
    process.stderr.write("Run with --help for usage.\n");
    return 1;
  }
  if (!options) {
    process.stdout.write(`${HELP}\n`);
    return 0;
  }

  try {
    const snapshot = await collectRepositoryStats(options.repository, {
      token: process.env.GITHUB_TOKEN,
      ciWorkflow: options.ciWorkflow,
    });
    const stats = toRepositoryStats(snapshot, options.title);
    const svg = renderAquarium(options.theme, stats, { title: stats.title, creatures: options.creatures });
    await mkdir(dirname(options.output), { recursive: true });
    await mkdir(dirname(options.summary), { recursive: true });
    await Promise.all([
      writeFile(options.output, svg, "utf8"),
      writeFile(
        options.summary,
        `${JSON.stringify({ ...stats, configuration: { theme: options.theme, creatures: options.creatures } }, null, 2)}\n`,
        "utf8",
      ),
    ]);
    process.stdout.write(`Generated ${options.theme} aquarium: ${options.output}\n`);
    process.stdout.write(`Wrote repository summary: ${options.summary}\n`);
    return 0;
  } catch (error) {
    process.stderr.write(`repo-aquarium: ${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

const invokedAsExecutable = process.argv[1]
  ? realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
  : false;

if (invokedAsExecutable) {
  void runCli().then((code) => {
    if (code !== 0) process.exitCode = code;
  });
}
