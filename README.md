# Repo Aquarium

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-github-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-coral-day.svg">
  <img alt="Repo Aquarium showing the activity of JongHyun070105/repo-aquarium as a pixel-art aquarium" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-coral-day.svg" width="900">
</picture>

Turn a GitHub repository's recent activity into a living pixel-art aquarium. Repo Aquarium is a reusable GitHub Action and local CLI: no hosted service, account, database, analytics, or tracking.

[한국어 문서](docs/README.ko.md) · [Privacy](docs/privacy.md) · [Example workflow](examples/repo-aquarium.yml)

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
          creatures: fish,jellyfish,crab
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
| `sunset-lagoon` | A warm tropical sunset reflected across the lagoon |
| `arctic-ice` | Clear polar water, glacier blues, and cold highlights |
| `neon-cyber` | Electric cyan and magenta in a futuristic night aquarium |

<p>
  <img alt="Coral Day Repo Aquarium theme" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-coral-day.svg" width="49%">
  <img alt="Deep Ocean Repo Aquarium theme" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-deep-ocean.svg" width="49%">
</p>
<p>
  <img alt="GitHub Dark Repo Aquarium theme" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-github-dark.svg" width="49%">
  <img alt="Sunset Lagoon Repo Aquarium theme" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-sunset-lagoon.svg" width="49%">
</p>
<p>
  <img alt="Arctic Ice Repo Aquarium theme" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-arctic-ice.svg" width="49%">
  <img alt="Neon Cyber Repo Aquarium theme" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-neon-cyber.svg" width="49%">
</p>

Each 900×320 SVG uses integer coordinates and crisp pixel edges. It includes an accessible title and description, visible text for CI state, and a finished static scene when `prefers-reduced-motion` is enabled.

## Creatures

Use a comma-separated list to decide which creatures are rendered. Allowed values are `fish`, `jellyfish`, `crab`, `turtle`, `seahorse`, `octopus`, `ray`, `pufferfish`, and `starfish`. The default is `fish,jellyfish,crab`; order is ignored and repeated values are removed.

```yaml
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
  themes: coral-day,neon-cyber
  creatures: fish,turtle,seahorse,octopus,ray,pufferfish,starfish
```

## What the aquarium means

Repo Aquarium maps repository data deterministically, so the same statistics produce the same scene.

| Repository signal | Aquarium detail |
| --- | --- |
| Commits in the last 30 days | Fish population, swim speed, and bubble density |
| Up to 8 recent contributors | Individual fish labeled with the contributor's GitHub login |
| Up to 4 languages at 1% or more | Fish species, colors, and the language legend |
| Latest release | Open treasure chest, light, and sparkles |
| Stars | Pearls and shell decorations on a logarithmic scale |
| Time since the latest commit | Current strength and creature activity |
| Optional workflow status | Buoy color, pixel icon, label, and signal pattern |

The scene also contains animated waves, light rays, layered parallax, bubbles, schooling fish, moving tails, swaying plants, a pulsing jellyfish, a walking crab, shining pearls, and a CI signal buoy.

Languages below 1% of the repository total are treated as incidental and are excluded from both the header legend and fish-species selection. Among the remaining languages, Repo Aquarium uses up to the top four. Each contributor fish displays its contributor name so the living population can be matched back to the people building the repository.

## Action reference

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `github-token` | Yes | — | The consumer repository's `GITHUB_TOKEN` |
| `repository` | No | Current repository | Repository to visualize as `owner/name` |
| `themes` | No | `coral-day,github-dark` | Comma-separated themes to generate |
| `creatures` | No | `fish,jellyfish,crab` | Comma-separated selection from the nine built-in creatures |
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
  --creatures fish,turtle,seahorse,octopus \
  --output aquarium.svg
```

For public repositories, the CLI can use GitHub's unauthenticated API allowance. Set `GITHUB_TOKEN` for private repositories or a higher API limit:

```bash
GITHUB_TOKEN=github_token npx --yes --package='github:JongHyun070105/repo-aquarium#v1' repo-aquarium generate \
  --repo owner/repository \
  --theme neon-cyber \
  --creatures fish,jellyfish,ray,pufferfish,starfish \
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
