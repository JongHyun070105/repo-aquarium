import { GitHubApiError, GitHubClient, parseRepository } from "./client.js";
import type { CiState, GitHubClientOptions, RepositorySnapshot } from "./types.js";

interface RepoResponse {
  full_name: string;
  name: string;
  description: string | null;
  default_branch: string;
  stargazers_count: number;
}

interface CommitResponse {
  commit: { committer?: { date?: string | null }; author?: { date?: string | null } };
}

const encode = encodeURIComponent;

function ciState(status: string, conclusion: string | null): CiState {
  if (status !== "completed" || conclusion === null) return "pending";
  if (conclusion === "success") return "success";
  return "failure";
}

async function optional<T>(task: Promise<T>, acceptedStatuses: readonly number[] = [404]): Promise<T | null> {
  try {
    return await task;
  } catch (error) {
    if (error instanceof GitHubApiError && acceptedStatuses.includes(error.status)) return null;
    throw error;
  }
}

async function countRecentCommits(client: GitHubClient, basePath: string, since: string): Promise<number> {
  let count = 0;
  for (let page = 1; page <= 10; page += 1) {
    let commits: CommitResponse[];
    try {
      commits = await client.get<CommitResponse[]>(`${basePath}/commits?since=${encode(since)}&per_page=100&page=${page}`);
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 409) return 0;
      throw error;
    }
    count += commits.length;
    if (commits.length < 100) break;
  }
  return count;
}

export async function collectRepositoryStats(
  repository: string,
  options: GitHubClientOptions & { ciWorkflow?: string; now?: Date } = {},
): Promise<RepositorySnapshot> {
  const { owner, repo, fullName } = parseRepository(repository);
  const client = new GitHubClient(options);
  const base = `/repos/${encode(owner)}/${encode(repo)}`;
  const now = options.now ?? new Date();
  const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const repoInfo = await client.get<RepoResponse>(base);
  const [languagesRaw, contributorsRaw, latestRelease, latestCommit, commits30d] = await Promise.all([
    client.get<Record<string, number>>(`${base}/languages`),
    client.get<Array<{ login?: string; contributions?: number; avatar_url?: string }>>(`${base}/contributors?per_page=8&anon=0`),
    optional(client.get<{ tag_name: string; name: string | null; published_at: string; html_url: string }>(`${base}/releases/latest`)),
    optional(client.get<CommitResponse[]>(`${base}/commits?per_page=1`), [404, 409]),
    countRecentCommits(client, base, since),
  ]);

  const languageEntries = Object.entries(languagesRaw)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const languageTotal = Object.values(languagesRaw).reduce((sum, bytes) => sum + bytes, 0);

  let ci: RepositorySnapshot["ci"] = null;
  if (options.ciWorkflow) {
    const workflow = encode(options.ciWorkflow);
    const result = await optional(client.get<{
      workflow_runs: Array<{
        status: string;
        conclusion: string | null;
        html_url?: string;
      }>;
    }>(`${base}/actions/workflows/${workflow}/runs?branch=${encode(repoInfo.default_branch)}&per_page=1`));
    const run = result?.workflow_runs[0];
    ci = run
      ? {
          workflow: options.ciWorkflow,
          state: ciState(run.status, run.conclusion),
          status: run.status,
          conclusion: run.conclusion,
          url: run.html_url,
        }
      : {
          workflow: options.ciWorkflow,
          state: "unknown",
          status: "not_found",
          conclusion: null,
        };
  }

  const commit = latestCommit?.[0];
  return {
    repository: repoInfo.full_name || fullName,
    title: repoInfo.name,
    description: repoInfo.description,
    defaultBranch: repoInfo.default_branch,
    stars: repoInfo.stargazers_count,
    commits30d,
    contributors: contributorsRaw.slice(0, 8).map((item, index) => ({
      login: item.login ?? `anonymous-${index + 1}`,
      contributions: item.contributions ?? 0,
      avatarUrl: item.avatar_url,
    })),
    languages: languageEntries.map(([name, bytes]) => ({
      name,
      bytes,
      share: languageTotal > 0 ? bytes / languageTotal : 0,
    })),
    latestRelease: latestRelease
      ? {
          tag: latestRelease.tag_name,
          name: latestRelease.name || latestRelease.tag_name,
          publishedAt: latestRelease.published_at,
          url: latestRelease.html_url,
        }
      : null,
    lastCommitAt: commit?.commit.committer?.date ?? commit?.commit.author?.date ?? null,
    ci,
    generatedAt: now.toISOString(),
  };
}
