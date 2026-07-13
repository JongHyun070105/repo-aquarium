# Repo Aquarium

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-github-dark.svg?v=1.3.0">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-coral-day.svg?v=1.3.0">
  <img alt="Repo Aquarium living world showing theme-native roaming contributors, repository phenomena, and world characters" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-coral-day.svg?v=1.3.0" width="900">
</picture>

Turn a GitHub repository's recent activity into a living pixel-art aquarium. Repo Aquarium is a reusable GitHub Action and local CLI: no hosted service, account, database, analytics, or tracking.

[한국어 문서](docs/README.ko.md) · [Privacy](docs/privacy.md) · [Example workflow](examples/repo-aquarium.yml)

## v1.3 — Theme-native roaming cast

- Every theme gives contributors a different non-fish form: reef turtles, abyss octopods, Octocat divers, sunset skyfins, polar penguins, and neon maintenance drones.
- A release summons a legendary whale—or a kraken in Deep Ocean—for seven days.
- Contributor creatures evolve through three stages from weighted commit, merged-PR, and review activity.
- Recent merges become meteor showers, closed issues become auroras, reviews become constellations, and a failed selected CI workflow becomes a storm.

## What's new in v1.1

- Choose exactly which creatures appear with the new `creatures` input or CLI `--creatures` option.
- Explore three new scenes: `sunset-lagoon`, `arctic-ice`, and `neon-cyber`.
- Header-safe animation bounds keep moving creatures inside the underwater scene so they no longer cross the title and metrics area.

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
          creatures: contributors,jellyfish,crab
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

| Theme | Contributor form | Extra world cast |
| --- | --- | --- |
| `coral-day` | Reef turtles | Coral sprite and release whale |
| `deep-ocean` | Abyss octopods | Lantern keeper and release kraken |
| `github-dark` | Octocat divers | Code-world Octocat and green activity phenomena |
| `sunset-lagoon` | Sunset skyfins | Skyfin guide and golden release whale |
| `arctic-ice` | Polar penguins | Penguin guide and glacial release whale |
| `neon-cyber` | Maintenance drones | Drone guide, neon grid, and mecha whale |

<p>
  <img alt="Coral Day living world with reef-turtle contributors, a coral sprite, and a legendary whale" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-coral-day.svg?v=1.3.0" width="49%">
  <img alt="Deep Ocean living world with octopod contributors, an abyss keeper, and a legendary kraken" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-deep-ocean.svg?v=1.3.0" width="49%">
</p>
<p>
  <img alt="GitHub Dark living world with roaming Octocat contributors" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-github-dark.svg?v=1.3.0" width="49%">
  <img alt="Sunset Lagoon living world with roaming skyfin contributors and a golden whale" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-sunset-lagoon.svg?v=1.3.0" width="49%">
</p>
<p>
  <img alt="Arctic Ice living world with roaming penguin contributors and a glacial whale" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-arctic-ice.svg?v=1.3.0" width="49%">
  <img alt="Neon Cyber living world with roaming drone contributors and a mecha whale" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-neon-cyber.svg?v=1.3.0" width="49%">
</p>

Each 900×320 SVG uses integer coordinates and crisp pixel edges. It includes an accessible title and description, visible text for CI state, and a finished static scene when `prefers-reduced-motion` is enabled.

## Cast selection

Use a comma-separated list to decide which cast members are rendered. `contributors` renders repository contributors in forms selected by the theme—turtles, octopods, Octocats, skyfins, penguins, or drones. The remaining values are `jellyfish`, `crab`, `turtle`, `seahorse`, `octopus`, `ray`, `pufferfish`, and `starfish`. The default is `contributors,jellyfish,crab`; the old `fish` value remains a compatibility alias for `contributors`.

```yaml
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
  themes: coral-day,neon-cyber
  creatures: contributors,turtle,seahorse,octopus,ray,pufferfish,starfish
```

## What the aquarium means

Repo Aquarium maps repository data deterministically, so the same statistics produce the same scene.

| Repository signal | Aquarium detail |
| --- | --- |
| Commits in the last 30 days | Population, roaming speed, bubble density, and contributor growth |
| Up to 8 recent contributors | Named theme-specific characters with three evolution stages and multi-direction roaming |
| Up to 4 languages at 1% or more | Contributor colors and the language legend |
| Release from the last 7 days | Legendary whale, Deep Ocean kraken, or neon mecha whale |
| Recent merged pull requests | Meteor shower intensity |
| Recently closed issues | Aurora intensity |
| Recent pull request reviews | Constellation density and contributor growth |
| Failed selected CI | Lightning and rain storm |
| Latest release | Open treasure chest, light, and sparkles |
| Stars | Pearls and shell decorations on a logarithmic scale |
| Time since the latest commit | Current strength and creature activity |
| Optional workflow status | Buoy color, pixel icon, label, and signal pattern |

The scene also contains animated waves, light rays, layered parallax, bubbles, freely roaming creatures, gently rooted plants, shining pearls, and a CI signal buoy. Contributors and ambient creatures change horizontal and vertical direction while remaining inside the protected world area.

Languages below 1% of the repository total are treated as incidental and are excluded from both the header legend and contributor-form color selection. Among the remaining languages, Repo Aquarium uses up to the top four. Each contributor character displays its GitHub login.

Repo event signals come from GitHub's repository events feed. The feed can be delayed, so merge, issue, review, and per-contributor evolution changes are intentionally deterministic snapshots rather than real-time telemetry. If event access is unavailable, Repo Aquarium still renders normally with zero event phenomena.

## Action reference

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `github-token` | Yes | — | The consumer repository's `GITHUB_TOKEN` |
| `repository` | No | Current repository | Repository to visualize as `owner/name` |
| `themes` | No | `coral-day,github-dark` | Comma-separated themes to generate |
| `creatures` | No | `contributors,jellyfish,crab` | Theme-specific contributors plus optional ambient creatures; `fish` is a legacy alias |
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
  --creatures contributors,turtle,seahorse,octopus \
  --output aquarium.svg
```

For public repositories, the CLI can use GitHub's unauthenticated API allowance. Set `GITHUB_TOKEN` for private repositories or a higher API limit:

```bash
GITHUB_TOKEN=github_token npx --yes --package='github:JongHyun070105/repo-aquarium#v1' repo-aquarium generate \
  --repo owner/repository \
  --theme neon-cyber \
  --creatures contributors,jellyfish,ray,pufferfish,starfish \
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

Pinning `@v1` receives compatible v1 fixes. For a fully immutable reference, pin a release tag such as `@v1.1.0` or a commit SHA.

## License

Code and original pixel artwork are licensed under the [MIT License](LICENSE).
