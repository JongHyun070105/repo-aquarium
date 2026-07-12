# Repo Aquarium

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-github-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-coral-day.svg">
  <img alt="Repo Aquarium showing the activity of JongHyun070105/repo-aquarium as a pixel-art aquarium" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-coral-day.svg" width="900">
</picture>

Turn a GitHub repository's recent activity into a living pixel-art aquarium. Repo Aquarium is a reusable GitHub Action and local CLI: no hosted service, account, database, analytics, or tracking.

[한국어 문서](docs/README.ko.md) · [Privacy](docs/privacy.md) · [Example workflow](examples/repo-aquarium.yml)

## One-minute install

Create `.github/workflows/repo-aquarium.yml` in the repository you want to visualize:

```yaml
name: Repo Aquarium

on:
  schedule:
    - cron: "17 3 * * *"
  workflow_dispatch:

permissions:
  contents: write
  actions: read

concurrency:
  group: repo-aquarium
  cancel-in-progress: false

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: JongHyun070105/repo-aquarium@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          themes: coral-day,github-dark
          # Optional: show the latest default-branch result on the CI buoy.
          # ci-workflow: ci.yml
```

Run the workflow once from **Actions → Repo Aquarium → Run workflow**. It creates or updates the `aquarium-output` branch. Add this directly below your README title:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OWNER/REPOSITORY/aquarium-output/aquarium-github-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/OWNER/REPOSITORY/aquarium-output/aquarium-coral-day.svg">
  <img alt="Repository activity aquarium" src="https://raw.githubusercontent.com/OWNER/REPOSITORY/aquarium-output/aquarium-coral-day.svg" width="900">
</picture>
```

Replace `OWNER/REPOSITORY` with your repository path. The workflow needs `contents: write`; keep `actions: read` only when using `ci-workflow`.

## Themes

| Theme | Scene |
| --- | --- |
| `coral-day` | Bright coral, turquoise water, and warm daylight |
| `deep-ocean` | Dark blue depths, bioluminescent life, and glowing particles |
| `github-dark` | GitHub's dark palette with green activity accents |

<p>
  <img alt="Coral Day Repo Aquarium theme" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-coral-day.svg" width="49%">
  <img alt="Deep Ocean Repo Aquarium theme" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-deep-ocean.svg" width="49%">
</p>

Each 900×320 SVG uses integer coordinates and crisp pixel edges. It includes an accessible title and description, visible text for CI state, and a finished static scene when `prefers-reduced-motion` is enabled.

## What the aquarium means

Repo Aquarium maps repository data deterministically, so the same statistics produce the same scene.

| Repository signal | Aquarium detail |
| --- | --- |
| Commits in the last 30 days | Fish population, swim speed, and bubble density |
| Up to 8 recent contributors | Individual fish |
| Up to 4 top languages | Fish species and colors |
| Latest release | Open treasure chest, light, and sparkles |
| Stars | Pearls and shell decorations on a logarithmic scale |
| Time since the latest commit | Current strength and creature activity |
| Optional workflow status | Buoy color, pixel icon, label, and signal pattern |

The scene also contains animated waves, light rays, layered parallax, bubbles, schooling fish, moving tails, swaying plants, a pulsing jellyfish, a walking crab, shining pearls, and a CI signal buoy.

## Action reference

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `github-token` | Yes | — | The consumer repository's `GITHUB_TOKEN` |
| `repository` | No | Current repository | Repository to visualize as `owner/name` |
| `themes` | No | `coral-day,github-dark` | Comma-separated themes to generate |
| `ci-workflow` | No | — | Workflow file/name whose latest default-branch status appears on the buoy |
| `publish-branch` | No | `aquarium-output` | Branch that receives generated files |
| `title` | No | Repository name | Title shown inside the aquarium |

Generated files are `aquarium-<theme>.svg` plus `summary.json`. Publishing happens only after every requested theme is generated successfully, so a failed run does not replace the last known-good aquarium.

Recommended permissions:

```yaml
permissions:
  contents: write
  actions: read # omit if ci-workflow is not used
```

## Local CLI

Generate an aquarium without installing a global package:

```bash
npx --yes --package='github:JongHyun070105/repo-aquarium#v1' repo-aquarium generate \
  --repo owner/repository \
  --theme coral-day \
  --output aquarium.svg
```

For public repositories, the CLI can use GitHub's unauthenticated API allowance. Set `GITHUB_TOKEN` for private repositories or a higher API limit:

```bash
GITHUB_TOKEN=github_token npx --yes --package='github:JongHyun070105/repo-aquarium#v1' repo-aquarium generate \
  --repo owner/repository \
  --theme deep-ocean \
  --output aquarium.svg
```

The token is read only for the current process. The CLI does not save it.

## Development

Repo Aquarium targets Node.js 24 and TypeScript.

```bash
npm ci
npm run typecheck
npm test
npm run build
```

The compiled JavaScript under `dist/` is committed because GitHub Actions runs it directly.

## Privacy and security

Repo Aquarium talks only to GitHub's API and writes only to the configured output branch. It does not operate a server, send analytics, create an account, store tokens, or transmit repository data to a third party. See the full [privacy notes](docs/privacy.md).

Pinning `@v1` receives compatible v1 fixes. For a fully immutable reference, pin a release tag such as `@v1.0.0` or a commit SHA.

## License

Code and original pixel artwork are licensed under the [MIT License](LICENSE).
