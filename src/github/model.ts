import type { RepositoryStats } from "../model.js";
import type { RepositorySnapshot } from "./types.js";

export function toRepositoryStats(snapshot: RepositorySnapshot, title?: string): RepositoryStats {
  return {
    repository: snapshot.repository,
    title: title?.trim() || snapshot.title,
    stars: snapshot.stars,
    commits30d: snapshot.commits30d,
    mergedPullRequests30d: snapshot.mergedPullRequests30d,
    closedIssues30d: snapshot.closedIssues30d,
    reviews30d: snapshot.reviews30d,
    contributors: snapshot.contributors.map(({ login, contributions, recentCommits, pullRequests, reviews }) => ({
      login,
      contributions,
      recentCommits,
      pullRequests,
      reviews,
    })),
    languages: snapshot.languages,
    latestRelease: snapshot.latestRelease
      ? { tagName: snapshot.latestRelease.tag, publishedAt: snapshot.latestRelease.publishedAt }
      : null,
    lastCommitAt: snapshot.lastCommitAt,
    ci: snapshot.ci
      ? {
          workflow: snapshot.ci.workflow,
          status: snapshot.ci.status,
          conclusion: snapshot.ci.conclusion,
        }
      : null,
    generatedAt: snapshot.generatedAt,
  };
}
