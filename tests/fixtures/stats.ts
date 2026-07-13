import type { RepositoryStats } from "../../src/model.js";

export const activeStats: RepositoryStats = {
  repository: "octo/repo-aquarium",
  title: "Repo Aquarium",
  stars: 12_450,
  commits30d: 67,
  mergedPullRequests30d: 5,
  closedIssues30d: 3,
  reviews30d: 7,
  contributors: [
    { login: "marina", contributions: 31, recentCommits: 12, pullRequests: 3, reviews: 4 },
    { login: "coral", contributions: 18, recentCommits: 5, pullRequests: 1, reviews: 2 },
    { login: "nautilus", contributions: 11, recentCommits: 2, pullRequests: 0, reviews: 1 },
    { login: "pearl", contributions: 7, recentCommits: 0, pullRequests: 0, reviews: 0 },
  ],
  languages: [
    { name: "TypeScript", bytes: 8_000, share: 0.8 },
    { name: "JavaScript", bytes: 1_000, share: 0.1 },
    { name: "CSS", bytes: 600, share: 0.06 },
    { name: "HTML", bytes: 400, share: 0.04 },
    { name: "Shell", bytes: 50, share: 0.005 },
  ],
  latestRelease: { tagName: "v1.0.0", publishedAt: "2026-07-05T12:00:00.000Z" },
  lastCommitAt: "2026-07-11T09:00:00.000Z",
  ci: { workflow: "CI", status: "completed", conclusion: "success" },
  generatedAt: "2026-07-12T12:00:00.000Z",
};

export const emptyStats: RepositoryStats = {
  repository: "octo/quiet-reef",
  title: "Quiet Reef",
  stars: 0,
  commits30d: 0,
  mergedPullRequests30d: 0,
  closedIssues30d: 0,
  reviews30d: 0,
  contributors: [],
  languages: [],
  latestRelease: null,
  lastCommitAt: null,
  ci: null,
  generatedAt: "2026-07-12T12:00:00.000Z",
};
