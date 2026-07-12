import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { CREATURES, renderAquarium, THEMES, type RepositoryStats } from '../src/index.js';

const stats: RepositoryStats = {
  repository: 'JongHyun070105/repo-aquarium',
  title: 'Repo Aquarium',
  stars: 256,
  commits30d: 42,
  contributors: [
    { login: 'octonaut', contributions: 24 },
    { login: 'coral-coder', contributions: 12 },
    { login: 'pixel-diver', contributions: 6 },
  ],
  languages: [
    { name: 'TypeScript', bytes: 88_000, share: 0.88 },
    { name: 'CSS', bytes: 8_000, share: 0.08 },
    { name: 'HTML', bytes: 4_000, share: 0.04 },
  ],
  latestRelease: { tagName: 'v1.0.0', publishedAt: new Date().toISOString() },
  lastCommitAt: new Date().toISOString(),
  ci: { workflow: 'test.yml', status: 'completed', conclusion: 'success' },
  generatedAt: new Date().toISOString(),
};

const destination = resolve('examples/generated');
await mkdir(destination, { recursive: true });
for (const theme of THEMES) {
  await writeFile(
    resolve(destination, `aquarium-${theme}.svg`),
    renderAquarium(theme, stats, { creatures: [...CREATURES] }),
    'utf8',
  );
}
await writeFile(
  resolve(destination, 'summary.json'),
  `${JSON.stringify({ ...stats, configuration: { themes: THEMES, creatures: CREATURES } }, null, 2)}\n`,
  'utf8',
);
