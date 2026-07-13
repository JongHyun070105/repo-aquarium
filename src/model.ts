export const THEMES = [
  "coral-day",
  "deep-ocean",
  "github-dark",
  "sunset-lagoon",
  "arctic-ice",
  "neon-cyber",
] as const;

export const CREATURES = [
  "contributors",
  // Backward-compatible alias for contributors. Theme worlds no longer force
  // every contributor to render as a fish.
  "fish",
  "jellyfish",
  "crab",
  "turtle",
  "seahorse",
  "octopus",
  "ray",
  "pufferfish",
  "starfish",
] as const;

export type Theme = (typeof THEMES)[number];
export type Creature = (typeof CREATURES)[number];

export interface ContributorStat {
  login: string;
  contributions: number;
  recentCommits?: number;
  pullRequests?: number;
  reviews?: number;
}

export interface LanguageStat {
  name: string;
  bytes: number;
  share: number;
}

export interface ReleaseStat {
  tagName: string;
  publishedAt: string;
}

export interface CiStat {
  status: string;
  conclusion: string | null;
  workflow: string;
}

export interface RepositoryStats {
  repository: string;
  title: string;
  stars: number;
  commits30d: number;
  mergedPullRequests30d?: number;
  closedIssues30d?: number;
  reviews30d?: number;
  contributors: ContributorStat[];
  languages: LanguageStat[];
  latestRelease: ReleaseStat | null;
  lastCommitAt: string | null;
  ci: CiStat | null;
  generatedAt: string;
}

export type ActivityBand = "still" | "calm" | "active" | "surging";
export type CiState = "success" | "failure" | "in-progress" | "neutral" | "unknown";

export interface AquariumFish {
  id: string;
  label: string;
  species: 0 | 1 | 2 | 3;
  language: string;
  colorIndex: number;
  speedSeconds: number;
  delaySeconds: number;
  lane: number;
  reverse: boolean;
  scale: number;
  evolutionStage: 1 | 2 | 3;
  activityPoints: number;
  activityLabel: string;
}

export interface AquariumLanguage {
  name: string;
  share: number;
  species: 0 | 1 | 2 | 3;
}

export interface AquariumModel {
  repository: string;
  title: string;
  generatedAt: string;
  commits30d: number;
  stars: number;
  activity: ActivityBand;
  activityScore: number;
  fish: AquariumFish[];
  languages: AquariumLanguage[];
  bubbleCount: number;
  pearlCount: number;
  currentStrength: number;
  lastCommitLabel: string;
  chestOpen: boolean;
  releaseLabel: string | null;
  legendaryVisible: boolean;
  mergedPullRequests30d: number;
  closedIssues30d: number;
  reviews30d: number;
  ciState: CiState;
  ciLabel: string;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

const hash = (input: string): number => {
  let result = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    result ^= input.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
};

const validDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const daysBetween = (later: Date, earlier: Date): number =>
  Math.max(0, (later.getTime() - earlier.getTime()) / 86_400_000);

const activityBand = (commits: number): ActivityBand => {
  if (commits === 0) return "still";
  if (commits < 8) return "calm";
  if (commits < 40) return "active";
  return "surging";
};

export const normalizeCiState = (ci: CiStat | null): CiState => {
  if (!ci) return "unknown";
  const status = ci.status.toLowerCase();
  const conclusion = ci.conclusion?.toLowerCase() ?? "";
  if (status !== "completed" || ["queued", "waiting", "pending", "in_progress", "requested"].includes(status)) {
    return "in-progress";
  }
  if (conclusion === "success") return "success";
  if (["failure", "timed_out", "startup_failure", "cancelled", "action_required"].includes(conclusion)) {
    return "failure";
  }
  if (["neutral", "skipped", "stale"].includes(conclusion)) return "neutral";
  return "unknown";
};

const languageLimit = (languages: LanguageStat[]): AquariumLanguage[] => {
  const valid = [...languages].filter((item) => item.name.trim() && item.bytes >= 0);
  const total = valid.reduce((sum, item) => sum + item.bytes, 0);
  return valid
    .map((item) => ({
      ...item,
      normalizedShare: total > 0 ? item.bytes / total : clamp(item.share, 0, 1),
    }))
    .filter((item) => item.normalizedShare >= 0.01)
    .sort((left, right) => right.bytes - left.bytes || left.name.localeCompare(right.name))
    .slice(0, 4)
    .map((item, index) => ({
      name: item.name,
      share: item.normalizedShare,
      species: index as 0 | 1 | 2 | 3,
    }));
};

export const normalizeStats = (stats: RepositoryStats, options: { title?: string } = {}): AquariumModel => {
  const commits = Math.round(clamp(stats.commits30d, 0, 100_000));
  const stars = Math.round(clamp(stats.stars, 0, Number.MAX_SAFE_INTEGER));
  const generatedAt = validDate(stats.generatedAt) ?? new Date(0);
  const lastCommit = validDate(stats.lastCommitAt);
  const commitAge = lastCommit ? daysBetween(generatedAt, lastCommit) : Number.POSITIVE_INFINITY;
  const currentStrength = lastCommit ? clamp(1 - commitAge / 30, 0.15, 1) : 0.1;
  const contributors = [...stats.contributors]
    .filter((item) => item.login.trim())
    .sort((left, right) => right.contributions - left.contributions || left.login.localeCompare(right.login))
    .slice(0, 8);
  const languages = languageLimit(stats.languages);
  const fallbackPeople = Math.max(1, Math.min(8, 2 + Math.floor(Math.log2(commits + 1))));
  const people: ContributorStat[] = contributors.length > 0
    ? contributors
    : Array.from({ length: fallbackPeople }, (_, index) => ({ login: `activity-${index + 1}`, contributions: 0 }));
  const fish = people.map((person, index): AquariumFish => {
    const seed = hash(`${stats.repository}:${person.login}:${index}`);
    const species = (languages[index % Math.max(1, languages.length)]?.species ?? (seed % 4)) as 0 | 1 | 2 | 3;
    const recentCommits = Math.round(clamp(person.recentCommits ?? 0, 0, 10_000));
    const pullRequests = Math.round(clamp(person.pullRequests ?? 0, 0, 10_000));
    const reviews = Math.round(clamp(person.reviews ?? 0, 0, 10_000));
    const contributionBase = Math.min(18, Math.log2(Math.max(0, person.contributions) + 1) * 3);
    const activityPoints = Math.round(contributionBase + recentCommits * 2 + pullRequests * 4 + reviews * 3);
    const evolutionStage = (activityPoints >= 30 ? 3 : activityPoints >= 12 ? 2 : 1) as 1 | 2 | 3;
    return {
      id: `fish-${index + 1}`,
      label: person.login,
      species,
      language: languages[index % Math.max(1, languages.length)]?.name ?? "Repository activity",
      colorIndex: (seed >>> 4) % 4,
      speedSeconds: Number((18 - currentStrength * 8 + (seed % 40) / 10).toFixed(1)),
      delaySeconds: -((seed >>> 8) % 120) / 10,
      lane: index % 5,
      reverse: ((seed >>> 16) & 1) === 1,
      scale: 0.68 + evolutionStage * 0.1 + ((seed >>> 20) % 16) / 100,
      evolutionStage,
      activityPoints,
      activityLabel: `${recentCommits} commits · ${pullRequests} PRs · ${reviews} reviews`,
    };
  });
  const releaseDate = validDate(stats.latestRelease?.publishedAt);
  const releaseAge = releaseDate ? daysBetween(generatedAt, releaseDate) : Number.POSITIVE_INFINITY;
  const chestOpen = releaseAge <= 30;
  const ciState = normalizeCiState(stats.ci);
  const ciName = stats.ci?.workflow?.trim() || "CI";
  const ciLabel = ciState === "in-progress" ? `${ciName}: running` : `${ciName}: ${ciState}`;
  return {
    repository: stats.repository,
    title: options.title?.trim() || stats.title?.trim() || stats.repository.split("/").at(-1) || stats.repository,
    generatedAt: generatedAt.toISOString(),
    commits30d: commits,
    stars,
    activity: activityBand(commits),
    activityScore: clamp(Math.log2(commits + 1) / 7, 0, 1),
    fish,
    languages,
    bubbleCount: Math.round(clamp(8 + Math.sqrt(commits) * 2.5, 8, 34)),
    pearlCount: stars === 0 ? 0 : Math.round(clamp(1 + Math.log10(stars + 1) * 2.6, 1, 14)),
    currentStrength,
    lastCommitLabel: lastCommit
      ? commitAge < 1
        ? "last commit today"
        : `last commit ${Math.max(1, Math.floor(commitAge))}d ago`
      : "no commits yet",
    chestOpen,
    releaseLabel: stats.latestRelease?.tagName ?? null,
    legendaryVisible: releaseAge <= 7,
    mergedPullRequests30d: Math.round(clamp(stats.mergedPullRequests30d ?? 0, 0, 10_000)),
    closedIssues30d: Math.round(clamp(stats.closedIssues30d ?? 0, 0, 10_000)),
    reviews30d: Math.round(clamp(stats.reviews30d ?? 0, 0, 10_000)),
    ciState,
    ciLabel,
  };
};

export const isTheme = (value: string): value is Theme => (THEMES as readonly string[]).includes(value);
export const isCreature = (value: string): value is Creature => (CREATURES as readonly string[]).includes(value);
