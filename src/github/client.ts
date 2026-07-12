import type { GitHubClientOptions } from "./types.js";

export class GitHubApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly responseBody?: string,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export class GitHubClient {
  private readonly token?: string;
  private readonly apiUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: GitHubClientOptions = {}) {
    this.token = options.token;
    this.apiUrl = (options.apiUrl ?? "https://api.github.com").replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = path.startsWith("http") ? path : `${this.apiUrl}${path}`;
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/vnd.github+json");
    headers.set("X-GitHub-Api-Version", "2022-11-28");
    headers.set("User-Agent", "repo-aquarium-action");
    if (this.token) headers.set("Authorization", `Bearer ${this.token}`);

    let response: Response;
    try {
      response = await this.fetchImpl(url, { ...init, headers });
    } catch (error) {
      throw new Error(`Unable to reach GitHub API: ${error instanceof Error ? error.message : String(error)}`);
    }

    if (!response.ok) {
      const body = await response.text();
      let apiMessage = body;
      try {
        apiMessage = (JSON.parse(body) as { message?: string }).message ?? body;
      } catch {
        // Keep the plain response body.
      }
      const rateLimited = response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0";
      const hint = rateLimited
        ? " GitHub API rate limit exceeded; set GITHUB_TOKEN or try again after the reset time."
        : "";
      throw new GitHubApiError(`GitHub API ${response.status}: ${apiMessage || response.statusText}.${hint}`, response.status, body);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    });
  }

  patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    });
  }
}

export function parseRepository(value: string): { owner: string; repo: string; fullName: string } {
  const trimmed = value.trim();
  const match = /^([^/\s]+)\/([^/\s]+)$/.exec(trimmed);
  if (!match) throw new Error(`Invalid repository "${value}". Expected owner/repository.`);
  const owner = match[1]!;
  const repo = match[2]!;
  return { owner, repo, fullName: `${owner}/${repo}` };
}
