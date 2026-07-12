export type CiState = "success" | "failure" | "pending" | "unknown";

export interface ContributorStat {
  login: string;
  contributions: number;
  avatarUrl?: string;
}

export interface LanguageStat {
  name: string;
  bytes: number;
  share: number;
}

export interface ReleaseStat {
  tag: string;
  name: string;
  publishedAt: string;
  url: string;
}

export interface CiStat {
  workflow: string;
  state: CiState;
  status: string;
  conclusion: string | null;
  url?: string;
}

export interface RepositorySnapshot {
  repository: string;
  title: string;
  description: string | null;
  defaultBranch: string;
  stars: number;
  commits30d: number;
  contributors: ContributorStat[];
  languages: LanguageStat[];
  latestRelease: ReleaseStat | null;
  lastCommitAt: string | null;
  ci: CiStat | null;
  generatedAt: string;
}

export interface GitHubClientOptions {
  token?: string;
  apiUrl?: string;
  fetchImpl?: typeof fetch;
}
