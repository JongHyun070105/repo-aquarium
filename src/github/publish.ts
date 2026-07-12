import { GitHubApiError, GitHubClient, parseRepository } from "./client.js";
import type { GitHubClientOptions } from "./types.js";

export interface PublishArtifact {
  path: string;
  content: string;
}

interface GitRef { object: { sha: string } }
interface GitCommit { tree: { sha: string } }
interface GitObject { sha: string }

function validateBranch(branch: string): string {
  const value = branch.trim();
  if (!value || value.startsWith("-") || value.includes("..") || /[~^:?*\\\s]/.test(value)) {
    throw new Error(`Invalid publish branch "${branch}".`);
  }
  return value;
}

function validateArtifacts(artifacts: PublishArtifact[]): void {
  if (artifacts.length === 0) throw new Error("No aquarium artifacts were generated; refusing to publish an empty commit.");
  const paths = new Set<string>();
  for (const artifact of artifacts) {
    if (!artifact.path || artifact.path.startsWith("/") || artifact.path.includes("..")) {
      throw new Error(`Invalid artifact path "${artifact.path}".`);
    }
    if (paths.has(artifact.path)) throw new Error(`Duplicate artifact path "${artifact.path}".`);
    paths.add(artifact.path);
  }
}

export async function publishArtifacts(
  repository: string,
  branch: string,
  artifacts: PublishArtifact[],
  options: GitHubClientOptions & { message?: string } = {},
): Promise<{ branch: string; commitSha: string }> {
  if (!options.token) throw new Error("A GitHub token is required to publish aquarium artifacts.");
  validateArtifacts(artifacts);
  const publishBranch = validateBranch(branch);
  const { owner, repo } = parseRepository(repository);
  const client = new GitHubClient(options);
  const base = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git`;
  const refPath = `${base}/ref/heads/${publishBranch.split("/").map(encodeURIComponent).join("/")}`;

  let existingRef: GitRef | null = null;
  try {
    existingRef = await client.get<GitRef>(refPath);
  } catch (error) {
    if (!(error instanceof GitHubApiError && error.status === 404)) throw error;
  }

  let baseTree: string | undefined;
  if (existingRef) {
    const existingCommit = await client.get<GitCommit>(`${base}/commits/${existingRef.object.sha}`);
    baseTree = existingCommit.tree.sha;
  }

  // Blobs and the tree are created before the ref moves. Any error before the final
  // create/update call leaves the last known-good output branch untouched.
  const blobs = await Promise.all(artifacts.map(async (artifact) => {
    const blob = await client.post<GitObject>(`${base}/blobs`, {
      content: artifact.content,
      encoding: "utf-8",
    });
    return { path: artifact.path, mode: "100644", type: "blob", sha: blob.sha };
  }));

  const tree = await client.post<GitObject>(`${base}/trees`, {
    ...(baseTree ? { base_tree: baseTree } : {}),
    tree: blobs,
  });
  const commit = await client.post<GitObject>(`${base}/commits`, {
    message: options.message ?? "chore: update repo aquarium",
    tree: tree.sha,
    parents: existingRef ? [existingRef.object.sha] : [],
  });

  if (existingRef) {
    await client.patch(`${base}/refs/heads/${publishBranch.split("/").map(encodeURIComponent).join("/")}`, {
      sha: commit.sha,
      force: false,
    });
  } else {
    await client.post(`${base}/refs`, { ref: `refs/heads/${publishBranch}`, sha: commit.sha });
  }
  return { branch: publishBranch, commitSha: commit.sha };
}
