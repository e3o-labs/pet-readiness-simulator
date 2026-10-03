# Pet Readiness Simulator · 나란히 걸어봄

A browser-first, seven-day practice experience for people considering life with a dog. It lets you try care routines, respond to fictional situations, and reflect on what you may need to prepare. It is built with Expo and React Native Web so the public project can grow into an installable PWA without requiring a native app release.

반려견 입양을 고민하는 사람이 브라우저에서 가상의 돌봄 상황과 7일 루틴을 연습해 보는 웹 경험입니다. 입양 적합성 판정이나 수의학·행동학적 진단을 제공하지 않습니다.

## Project status

This is an early open-source code baseline. The simulation and its score are not validated predictors of adoption outcomes. The app is not a substitute for a shelter, veterinarian, qualified behavior professional, or local legal guidance.

The repository contains software and explicitly synthetic test fixtures. It does not contain pilot participant records, contact lists, App Store or TestFlight evidence, production service configuration, unreviewed behavior-learning drafts, or private operator notes.

## Run locally

```sh
cd app
npm ci
npm test
npm run check
```

`npm run check` runs the test suite and exports the experience for web. The export runs in a browser and is the foundation for a PWA; it is not yet installable or offline-first. A manifest, rights-cleared install icons, update-safe offline behavior, and installation checks are on the roadmap. The same baseline checks run for pull requests in GitHub Actions.

## What the web experience does

- Keeps every screen in a centered mobile-width column, up to 430 CSS pixels; narrower browser windows use their full available width.
- Collects household, housing, schedule, budget, and experience choices for an on-device simulation.
- Offers fictional dog profiles, daily care prompts, reflection notes, and a summary of recorded choices.
- Stores simulation progress on the user's device.
- Keeps device camera access out of this baseline.
- Keeps the optional remote feedback flow inactive unless an operator supplies an endpoint and a public privacy notice.

See [the product scope](docs/specification.md), [safety boundaries](docs/product/safety-and-responsibility.md), and [data boundary](docs/data-boundary.md).

## Contributing

Share a [browser experience](https://github.com/e3o-labs/pet-readiness-simulator/issues/2) or [feature idea](https://github.com/e3o-labs/pet-readiness-simulator/issues/3). GitHub login is required and posts are public; use fictional examples without contact details or real care records. The app's public feedback screen links to these intake threads without attaching local simulation data. See [how feedback becomes work](docs/community-feedback.md) and [Vercel preview setup](docs/deployment.md).

Contributions are welcome in documentation, UX copy, tests, code, and carefully sourced research. Start with an issue tagged `good first issue` or `help wanted`. For new behavior or learning content, discuss the problem and agree on a short spec before opening a pull request.

Changes affecting animal health or behavior claims, breed/personality framing, scoring, privacy, retention, camera use, or user safety require maintainer review and may require a qualified subject-matter reviewer. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Source and releases

`e3o-labs/pet-readiness-simulator` is the canonical home for reviewed public code. The separate private operations repository remains responsible for release operations and evidence. A release record there must point to the exact public tag and commit SHA used to build it; code must not be independently edited in both repositories. This repository starts with a clean Git history and contains no private commits.

## License

Project code and documentation are offered under the MIT License. The dog-bark audio file has a separate public-domain rights record in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Third-party dependencies retain their own licenses.

## 한국어 안내

이 저장소는 제품 코드와 공개 문서만 담는 오픈소스 저장소입니다. 현재 브라우저에서 실행할 수 있고, 설치형 PWA 지원은 단계적으로 추가할 예정입니다. 실제 참여자 정보, 연락처 목록, 실기기 검증 기록, TestFlight/App Store 운영자료는 포함하지 않습니다. 점수는 준비 여부를 판정하거나 실제 입양 결과를 예측하지 않습니다.

기여는 문서, UX 문구, 테스트, 코드, 출처가 분명한 연구 제안부터 환영합니다. `good first issue` 또는 `help wanted` 표시가 있는 이슈를 확인하고, 동물 건강·행동 정보와 개인정보·안전·점수에 영향을 주는 변경은 먼저 논의해 주세요.
