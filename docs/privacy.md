# Privacy and data handling

Repo Aquarium is designed to run without a hosted service or user tracking.

## Data it reads

The action or CLI requests only the GitHub repository data needed to draw the selected scene: repository metadata, recent commits and contributors, language totals, latest release, and—when configured—the latest run of one workflow on the default branch.

## Where data goes

- Requests go directly from the GitHub-hosted runner or your local machine to GitHub's API.
- Generated SVG and JSON files are written to the configured branch or local output path.
- Repo Aquarium has no analytics endpoint, telemetry SDK, database, hosted backend, advertising integration, or user account system.
- Repository data and tokens are not sent to the project maintainers or another third party.

## Tokens

`GITHUB_TOKEN` is supplied at runtime, used only to call GitHub's API, and is not written into generated SVG or JSON files. The project does not log or persist the token. GitHub Actions users should grant only `contents: write`, plus `actions: read` when `ci-workflow` is enabled.

## Published information

The generated `summary.json` and aquarium reflect repository statistics. When the repository is public, files on the output branch are public as well. Review your repository visibility and chosen output branch before enabling the action for private or sensitive projects.
