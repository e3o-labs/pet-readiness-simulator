# Contributing

Thanks for helping make this project more useful and safer. Small, reviewable contributions are easiest to accept.

## Contribution areas

| Area | Good starting work | Review expectations |
| --- | --- | --- |
| Documentation | Clarify setup, accessibility, or product limits | Keep claims consistent with the app and cite external sources |
| UX | Improve navigation, readability, or non-judgmental Korean copy | Include before/after behavior and accessibility notes |
| Tests | Add deterministic cases or improve coverage | Use fictional fixtures only; state what the test proves |
| Code | Fix a bounded issue or implement an agreed spec | Include focused tests and explain data or dependency changes |
| Research | Propose sources or questions for expert review | Link the source, date, scope, limitations, and rights; research is not runtime approval |

## Issue to pull request

For public alpha observations and feature intake, see [the feedback workflow](docs/community-feedback.md). Maintainers keep the original feedback linked to its spec, PR, and release decision.

1. Search existing issues and discussions. Use a `good first issue` or `help wanted` issue when one fits.
2. For a new behavior, user-facing claim, or data flow, open a discussion or spec issue first. Describe the user problem, the smallest useful change, and how success will be checked.
3. Wait for a maintainer to confirm scope and mark any safety or privacy review needed.
4. Open a focused pull request linked to the issue. Explain the change, include evidence, and list checks run.
5. A maintainer reviews the diff, requests changes if needed, and merges after required checks and review are complete.

Maintainers use `good first issue` for bounded work with clear acceptance criteria and a likely first-time contributor path. They use `help wanted` for scoped work that can be picked up by anyone. A label is an invitation, not an assignment; contributors should comment before doing substantial work.

## Maintainer review gates

Ask for maintainer review before changing:

- Health, emergency, training, behavior, breed tendency, or personality claims.
- Readiness scoring, recommendation logic, or language that could sound like an adoption decision.
- Personal data, consent, retention, deletion, analytics, feedback transmission, or camera/photo behavior.
- Accessibility or safety flows that may change how a user interprets a result.

These changes need a written spec, source and rights notes where relevant, tests, and an explicit review decision. Maintainers must not present a general web source as expert approval. Health and behavior guidance intended for users requires review by a qualified professional before it is promoted as reviewed guidance.

## Pull request checklist

- [ ] The change matches an issue or an agreed discussion/spec.
- [ ] Tests cover the behavior that changed.
- [ ] `cd app && npm test` and `npm run check` pass, or failures are explained.
- [ ] User-facing text keeps the simulation and evidence limits clear.
- [ ] No real user, participant, contact, device, or operator data is included.
- [ ] New assets have a recorded source, license, and redistribution permission.
- [ ] New dependencies and their licenses are disclosed.

## Research and data

Use citations and describe what a source does not establish. Do not copy third-party images, videos, posts, or teaching materials without explicit reuse rights. Do not add real participant responses, contact details, private screenshots, device evidence, credentials, or production configuration to an issue or pull request. Use clearly fictional fixtures for tests.

## License

By submitting a contribution, you agree that your contribution is offered under the repository's MIT License. You retain copyright in your contribution. Do not submit material you do not have the right to license this way.
