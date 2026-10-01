# Public product specification

## In scope

- A short onboarding flow for household, housing, schedule, budget, and prior experience.
- Fictional profiles selected as practice scenarios.
- Seven days of care prompts, scheduled routines, optional reminders, and reflection.
- A report based on the user's recorded simulation choices, with incomplete evidence clearly marked.
- Local persistence for simulation progress.
- Accessibility labels and reduced-motion behavior for key interactive elements.
- An optional feedback flow that is inactive until both a feedback endpoint and a public privacy notice are configured.

## Out of scope

- Adoption eligibility or matching decisions.
- Predicting the health, temperament, or behavior of a real animal.
- Veterinary diagnosis, treatment, or individualized behavior plans.
- Real participant recruitment, operator workflows, contact lists, and pilot evidence.
- Production feedback infrastructure or credentials.
- Camera/AR features as a default part of the experience; the experimental AR path is disabled unless explicitly enabled.

## Acceptance principles

The same inputs should produce deterministic summaries; missing records must remain visible; every recommendation should lead to a concrete next question; and user-facing language must preserve the limits in [the safety guidance](product/safety-and-responsibility.md).
