# Repo Aquarium

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-github-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-coral-day.svg">
  <img alt="JongHyun070105/repo-aquarium의 활동을 보여주는 픽셀 아트 수족관" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-coral-day.svg" width="900">
</picture>

GitHub 저장소의 최근 활동을 살아 움직이는 픽셀 아트 수족관으로 바꿉니다. Repo Aquarium은 재사용 가능한 GitHub Action이자 로컬 CLI이며, 별도 서버·계정·데이터베이스·분석 도구·사용자 추적이 없습니다.

[English](../README.md) · [개인정보 처리](privacy.ko.md) · [예제 워크플로](../examples/repo-aquarium.yml)

## v1.1 새 기능

- 새 `creatures` 입력값과 CLI `--creatures` 옵션으로 장면에 나타날 생물을 직접 고를 수 있습니다.
- `sunset-lagoon`, `arctic-ice`, `neon-cyber` 테마가 추가되었습니다.
- 헤더 안전 애니메이션 경계를 적용해 움직이는 생물이 제목과 통계 영역을 침범하지 않고 수중 장면 안에서만 움직입니다.

## 1분 설치

수족관을 적용할 저장소에 `.github/workflows/repo-aquarium.yml`을 만듭니다.

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
          # 선택: CI 부표에 표시할 워크플로
          # ci-workflow: ci.yml
```

GitHub의 **Actions → Repo Aquarium → Run workflow**에서 한 번 실행하면 `aquarium-output` 브랜치가 생성됩니다. README 제목 바로 아래에 다음 코드를 추가하고 `OWNER/REPOSITORY`를 자신의 저장소 경로로 바꾸세요.

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/OWNER/REPOSITORY/aquarium-output/aquarium-github-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/OWNER/REPOSITORY/aquarium-output/aquarium-coral-day.svg">
  <img alt="저장소 활동 수족관" src="https://raw.githubusercontent.com/OWNER/REPOSITORY/aquarium-output/aquarium-coral-day.svg" width="900">
</picture>
```

워크플로에는 `contents: write` 권한이 필요합니다. `ci-workflow`를 쓰지 않는다면 `actions: read`는 생략할 수 있습니다.

## 테마

| 테마 | 장면 |
| --- | --- |
| `coral-day` | 밝은 산호초, 청록색 물, 따뜻한 햇빛 |
| `deep-ocean` | 어두운 심해, 발광 생물, 빛나는 입자 |
| `github-dark` | GitHub 다크 팔레트와 녹색 활동 강조 |
| `sunset-lagoon` | 석양빛이 번지는 따뜻한 열대 라군 |
| `arctic-ice` | 빙하색과 차가운 하이라이트가 있는 맑은 극지 바다 |
| `neon-cyber` | 전기빛 청록·자홍색으로 표현한 미래적인 야간 수족관 |

<p>
  <img alt="Coral Day Repo Aquarium 테마" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-coral-day.svg" width="49%">
  <img alt="Deep Ocean Repo Aquarium 테마" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-deep-ocean.svg" width="49%">
</p>
<p>
  <img alt="GitHub Dark Repo Aquarium 테마" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-github-dark.svg" width="49%">
  <img alt="Sunset Lagoon Repo Aquarium 테마" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-sunset-lagoon.svg" width="49%">
</p>
<p>
  <img alt="Arctic Ice Repo Aquarium 테마" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-arctic-ice.svg" width="49%">
  <img alt="Neon Cyber Repo Aquarium 테마" src="https://raw.githubusercontent.com/JongHyun070105/repo-aquarium/aquarium-output/aquarium-neon-cyber.svg" width="49%">
</p>

각 결과물은 900×320 반응형 SVG입니다. 정수 좌표와 선명한 픽셀 가장자리를 사용하며, 접근성용 제목·설명과 CI 상태 텍스트가 포함됩니다. `prefers-reduced-motion` 환경에서는 애니메이션을 멈추고 완성된 정적 장면을 보여줍니다.

## 생물 선택

쉼표로 구분한 목록으로 장면에 표시할 생물을 선택합니다. 허용값은 `fish`, `jellyfish`, `crab`, `turtle`, `seahorse`, `octopus`, `ray`, `pufferfish`, `starfish`입니다. 기본값은 `fish,jellyfish,crab`이며 중복값은 한 번만 적용됩니다.

```yaml
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
  themes: coral-day,neon-cyber
  creatures: fish,turtle,seahorse,octopus,ray,pufferfish,starfish
```

## 수족관 읽는 법

같은 통계는 항상 같은 장면을 만들도록 결정적으로 매핑합니다.

| 저장소 신호 | 수족관 표현 |
| --- | --- |
| 최근 30일 커밋 | 물고기 수, 이동 속도, 기포 밀도 |
| 최근 기여자 최대 8명 | 서로 다른 물고기 개체 |
| 상위 언어 최대 4개 | 물고기 종과 색상 |
| 최근 릴리스 | 열린 보물상자, 빛, 반짝임 |
| Stars | 로그 스케일로 늘어나는 진주와 조개 장식 |
| 마지막 커밋 이후 시간 | 수류와 생물 활동성 |
| 선택한 CI 워크플로 | 부표 색상, 픽셀 아이콘, 텍스트, 신호 패턴 |

공통 장면에는 수면 파동, 수중 광선, 다층 패럴랙스, 기포, 물고기 유영과 꼬리 움직임, 군집 이동, 해초 흔들림, 해파리 맥동, 게 이동, 진주 반짝임, 보물상자, CI 부표가 들어갑니다.

## Action 입력값

| 입력 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `github-token` | 예 | — | 사용하는 저장소의 `GITHUB_TOKEN` |
| `repository` | 아니요 | 현재 저장소 | 시각화할 `owner/name` |
| `themes` | 아니요 | `coral-day,github-dark` | 쉼표로 구분한 테마 목록 |
| `creatures` | 아니요 | `fish,jellyfish,crab` | 내장 생물 9종 중 표시할 생물을 쉼표로 구분한 목록 |
| `ci-workflow` | 아니요 | — | 기본 브랜치 최신 상태를 부표에 표시할 워크플로 파일명 또는 이름 |
| `publish-branch` | 아니요 | `aquarium-output` | 결과물을 게시할 브랜치 |
| `title` | 아니요 | 저장소명 | 수족관 안에 표시할 제목 |

생성 파일은 `aquarium-<theme>.svg`와 `summary.json`입니다. 요청한 모든 테마가 정상 생성된 뒤에만 게시하므로 실행 실패가 기존 정상 결과물을 덮어쓰지 않습니다.

## 로컬 CLI

전역 패키지 설치 없이 실행할 수 있습니다.

```bash
npx --yes --package='github:JongHyun070105/repo-aquarium#v1' repo-aquarium generate \
  --repo owner/repository \
  --theme coral-day \
  --creatures fish,turtle,seahorse,octopus \
  --output aquarium.svg
```

공개 저장소는 인증 없이도 GitHub API 허용량 안에서 사용할 수 있습니다. 비공개 저장소 또는 더 높은 API 한도가 필요하면 현재 프로세스에만 `GITHUB_TOKEN`을 설정하세요.

```bash
GITHUB_TOKEN=github_token npx --yes --package='github:JongHyun070105/repo-aquarium#v1' repo-aquarium generate \
  --repo owner/repository \
  --theme neon-cyber \
  --creatures fish,jellyfish,ray,pufferfish,starfish \
  --output aquarium.svg
```

토큰은 파일에 저장되지 않습니다.

## 개인정보와 보안

Repo Aquarium은 GitHub API와만 통신하고 설정한 결과 브랜치에만 파일을 씁니다. 별도 서버, 사용자 계정, 분석 SDK, 데이터베이스가 없으며 토큰이나 저장소 데이터를 제3자에게 전송하지 않습니다. 자세한 내용은 [개인정보 처리 안내](privacy.ko.md)를 참고하세요.

호환 가능한 v1 수정 사항을 받으려면 `@v1`을 사용합니다. 완전히 고정된 버전이 필요하면 `@v1.1.0` 또는 커밋 SHA를 사용하세요.

## 개발

Node.js 24와 TypeScript를 사용합니다.

```bash
npm ci
npm run typecheck
npm test
npm run build
```

## 라이선스

코드와 프로젝트용으로 직접 제작한 픽셀 아트는 모두 [MIT License](../LICENSE)로 제공됩니다.
