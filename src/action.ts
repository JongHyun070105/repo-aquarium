import * as core from "@actions/core";
import * as github from "@actions/github";
import { collectRepositoryStats, publishArtifacts, toRepositoryStats } from "./github/index.js";
import { CREATURES, renderAquarium, THEMES, type Creature, type Theme } from "./index.js";

function currentRepository(): string {
  const { owner, repo } = github.context.repo;
  if (!owner || !repo) throw new Error("GITHUB_REPOSITORY is unavailable. Run this action inside a GitHub repository workflow.");
  return `${owner}/${repo}`;
}

export function parseThemes(value: string): Theme[] {
  const requested = (value || "coral-day,github-dark")
    .split(",")
    .map((theme) => theme.trim())
    .filter(Boolean);
  const unique = [...new Set(requested)];
  if (unique.length === 0) throw new Error("At least one aquarium theme is required.");
  for (const theme of unique) {
    if (!(THEMES as readonly string[]).includes(theme)) {
      throw new Error(`Unknown theme "${theme}". Choose one of: ${THEMES.join(", ")}.`);
    }
  }
  return unique as Theme[];
}

export function parseCreatures(value: string): Creature[] {
  const requested = (value || "fish,jellyfish,crab")
    .split(",")
    .map((creature) => creature.trim())
    .filter(Boolean);
  const unique = [...new Set(requested)];
  if (unique.length === 0) throw new Error("At least one aquarium creature is required.");
  for (const creature of unique) {
    if (!(CREATURES as readonly string[]).includes(creature)) {
      throw new Error(`Unknown creature "${creature}". Choose from: ${CREATURES.join(", ")}.`);
    }
  }
  return unique as Creature[];
}

export async function runAction(): Promise<void> {
  const token = core.getInput("github-token", { required: true });
  core.setSecret(token);
  const destinationRepository = currentRepository();
  const sourceRepository = core.getInput("repository") || destinationRepository;
  const ciWorkflow = core.getInput("ci-workflow") || undefined;
  const publishBranch = core.getInput("publish-branch") || "aquarium-output";
  const title = core.getInput("title") || undefined;
  const themes = parseThemes(core.getInput("themes"));
  const creatures = parseCreatures(core.getInput("creatures"));

  core.info(`Collecting repository activity for ${sourceRepository}.`);
  const snapshot = await collectRepositoryStats(sourceRepository, { token, ciWorkflow });
  const stats = toRepositoryStats(snapshot, title);

  // Generate every requested file before making any Git ref mutation. This is
  // the fail-closed boundary that preserves the previous successful aquarium.
  const artifacts = themes.map((theme) => ({
    path: `aquarium-${theme}.svg`,
    content: renderAquarium(theme, stats, { title: stats.title, creatures }),
  }));
  artifacts.push({
    path: "summary.json",
    content: `${JSON.stringify({ ...stats, configuration: { themes, creatures } }, null, 2)}\n`,
  });

  core.info(`Publishing ${artifacts.length} files to ${destinationRepository}:${publishBranch}.`);
  const published = await publishArtifacts(destinationRepository, publishBranch, artifacts, {
    token,
    message: `chore: update repo aquarium for ${sourceRepository}`,
  });
  const paths = artifacts.map(({ path }) => path);
  core.setOutput("branch", published.branch);
  core.setOutput("files", JSON.stringify(paths));
  core.info(`Repo Aquarium published at commit ${published.commitSha}.`);
}

void runAction().catch((error: unknown) => {
  core.setFailed(error instanceof Error ? error.message : String(error));
});
