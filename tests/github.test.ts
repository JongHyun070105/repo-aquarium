import { describe, expect, it, vi } from "vitest";
import { collectRepositoryStats } from "../src/github/collect.js";
import { publishArtifacts } from "../src/github/publish.js";

function json(value: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

describe("collectRepositoryStats", () => {
  it("normalizes limits, language shares, release and CI state", async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/repos/acme/tank")) return json({ full_name: "acme/tank", name: "tank", description: "demo", default_branch: "main", stargazers_count: 120 });
      if (url.endsWith("/languages")) return json({ TypeScript: 700, CSS: 200, HTML: 100, Shell: 50, Ruby: 25 });
      if (url.includes("/contributors")) return json(Array.from({ length: 9 }, (_, index) => ({ login: `u${index}`, contributions: 9 - index })));
      if (url.includes("/events?per_page=100")) return json([
        { type: "PushEvent", actor: { login: "u0" }, created_at: "2026-07-11T09:00:00Z", payload: { commits: [{}, {}] } },
        { type: "PullRequestEvent", actor: { login: "u0" }, created_at: "2026-07-10T09:00:00Z", payload: { action: "closed", pull_request: { merged: true } } },
        { type: "PullRequestReviewEvent", actor: { login: "u1" }, created_at: "2026-07-09T09:00:00Z", payload: { action: "created" } },
        { type: "IssuesEvent", actor: { login: "u2" }, created_at: "2026-07-08T09:00:00Z", payload: { action: "closed", issue: {} } },
        { type: "IssuesEvent", actor: { login: "u2" }, created_at: "2026-06-01T09:00:00Z", payload: { action: "closed", issue: {} } },
      ]);
      if (url.endsWith("/releases/latest")) return json({ tag_name: "v1.0.0", name: "First", published_at: "2026-07-10T00:00:00Z", html_url: "https://github.com/acme/tank/releases/v1" });
      if (url.includes("/commits?per_page=1")) return json([{ commit: { committer: { date: "2026-07-11T00:00:00Z" } } }]);
      if (url.includes("/commits?since=")) return json([{ commit: {} }, { commit: {} }]);
      if (url.includes("/actions/workflows/ci.yml/runs")) return json({ workflow_runs: [{ status: "completed", conclusion: "success", html_url: "https://example.test/run" }] });
      throw new Error(`Unexpected URL ${url}`);
    }) as typeof fetch;

    const stats = await collectRepositoryStats("acme/tank", {
      fetchImpl,
      ciWorkflow: "ci.yml",
      now: new Date("2026-07-12T00:00:00Z"),
    });

    expect(stats.commits30d).toBe(2);
    expect(stats.contributors).toHaveLength(8);
    expect(stats.contributors[0]).toMatchObject({ login: "u0", recentCommits: 2, pullRequests: 1, reviews: 0 });
    expect(stats.contributors.find(({ login }) => login === "u1")).toMatchObject({ reviews: 1 });
    expect(stats).toMatchObject({ mergedPullRequests30d: 1, closedIssues30d: 1, reviews30d: 1 });
    expect(stats.languages).toHaveLength(4);
    expect(stats.languages[0]).toMatchObject({ name: "TypeScript", share: 700 / 1075 });
    expect(stats.latestRelease?.tag).toBe("v1.0.0");
    expect(stats.ci).toMatchObject({ state: "success", workflow: "ci.yml" });
    expect(stats.lastCommitAt).toBe("2026-07-11T00:00:00Z");
  });

  it("returns empty optional data when release and commits do not exist", async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/repos/acme/empty")) return json({ full_name: "acme/empty", name: "empty", description: null, default_branch: "main", stargazers_count: 0 });
      if (url.endsWith("/languages")) return json({});
      if (url.includes("/contributors")) return json([]);
      if (url.includes("/events?per_page=100")) return json({ message: "Forbidden" }, 403);
      if (url.endsWith("/releases/latest")) return json({ message: "Not Found" }, 404);
      if (url.includes("/commits?per_page=1")) return json({ message: "Git Repository is empty." }, 409);
      if (url.includes("/commits?since=")) return json([]);
      throw new Error(`Unexpected URL ${url}`);
    }) as typeof fetch;

    const stats = await collectRepositoryStats("acme/empty", { fetchImpl });
    expect(stats).toMatchObject({ commits30d: 0, mergedPullRequests30d: 0, closedIssues30d: 0, reviews30d: 0, lastCommitAt: null, latestRelease: null, contributors: [], languages: [] });
  });

  it("explains anonymous rate limits without exposing the token", async () => {
    const fetchImpl = vi.fn(async () => json({ message: "API rate limit exceeded" }, 403, { "x-ratelimit-remaining": "0" })) as typeof fetch;
    const error = await collectRepositoryStats("acme/tank", { fetchImpl, token: "super-secret" }).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("set GITHUB_TOKEN");
    expect((error as Error).message).not.toContain("super-secret");
  });
});

describe("publishArtifacts", () => {
  it("creates an orphan output commit and ref only after every artifact exists", async () => {
    const calls: Array<{ url: string; method: string; body?: unknown }> = [];
    let blob = 0;
    const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      calls.push({ url, method, body });
      if (url.endsWith("/git/ref/heads/aquarium-output")) return json({ message: "Not Found" }, 404);
      if (url.endsWith("/git/blobs")) return json({ sha: `blob-${++blob}` }, 201);
      if (url.endsWith("/git/trees")) return json({ sha: "tree-1" }, 201);
      if (url.endsWith("/git/commits")) return json({ sha: "commit-1" }, 201);
      if (url.endsWith("/git/refs")) return json({ ref: "refs/heads/aquarium-output" }, 201);
      throw new Error(`Unexpected ${method} ${url}`);
    }) as typeof fetch;

    const result = await publishArtifacts("acme/tank", "aquarium-output", [
      { path: "aquarium-coral-day.svg", content: "<svg/>" },
      { path: "summary.json", content: "{}" },
    ], { token: "token", fetchImpl });

    expect(result).toEqual({ branch: "aquarium-output", commitSha: "commit-1" });
    const commitCall = calls.find(({ url }) => url.endsWith("/git/commits"));
    expect(commitCall?.body).toMatchObject({ tree: "tree-1", parents: [] });
    expect(calls.at(-1)?.body).toEqual({ ref: "refs/heads/aquarium-output", sha: "commit-1" });
  });

  it("does not move or create a ref if generation upload fails", async () => {
    const calls: string[] = [];
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      calls.push(url);
      if (url.endsWith("/git/ref/heads/aquarium-output")) return json({ object: { sha: "old" } });
      if (url.endsWith("/git/commits/old")) return json({ tree: { sha: "old-tree" } });
      if (url.endsWith("/git/blobs")) return json({ message: "boom" }, 500);
      throw new Error(`Unexpected URL ${url}`);
    }) as typeof fetch;

    await expect(publishArtifacts("acme/tank", "aquarium-output", [{ path: "summary.json", content: "{}" }], {
      token: "token",
      fetchImpl,
    })).rejects.toThrow("boom");
    expect(calls.some((url) => url.endsWith("/git/refs"))).toBe(false);
    expect(calls.some((url) => url.endsWith("/git/refs/heads/aquarium-output"))).toBe(false);
  });
});
