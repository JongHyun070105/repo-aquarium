import { chmod, readFile, writeFile } from 'node:fs/promises';

const cliPath = new URL('../dist/cli/index.js', import.meta.url);
const source = await readFile(cliPath, 'utf8');
if (!source.startsWith('#!/usr/bin/env node')) {
  await writeFile(cliPath, `#!/usr/bin/env node\n${source}`);
}
await chmod(cliPath, 0o755);
