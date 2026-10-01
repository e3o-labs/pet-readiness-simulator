# Score and report

## Purpose

The score is a compact summary of choices recorded inside the simulation. It is meant to help a user notice topics to revisit; it is not a measure of a person's worth, an adoption decision, or a prediction of future care.

## Current implementation

The app starts five category summaries at a neutral value and applies fixed rule-based adjustments for recorded care evidence, a situation response, and the selected fictional profile. The final value is a rounded average. The report also marks whether the simulation record is complete and offers preparation suggestions.

These rules are product logic, not calibrated estimates. A high or low number has no validated relationship to adoption success, animal welfare outcomes, or a user's actual capacity.

## Required presentation

- Preserve the incomplete-record state; do not turn missing data into a confident verdict.
- Explain each suggestion with the recorded simulation evidence that produced it.
- Use neutral, actionable language and avoid pass/fail, shame, or eligibility claims.
- Keep the safety notice visible wherever the score is shown.
- Require maintainer review for changes to weights, thresholds, categories, or recommendation copy.
