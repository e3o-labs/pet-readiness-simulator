# Source provenance

The initial export contains only files reviewed for the public boundary. The new repository starts with a clean Git history; it does not copy private commit history or operational records.

After the baseline is accepted, this public repository is the canonical source for code changes. The private operations repository remains private and should record the exact public tag and commit SHA used for each release or test build. Do not maintain independent copies of product code in both repositories.

The private repository may record test results and operational evidence against a public SHA. Those records do not belong in this repository.
