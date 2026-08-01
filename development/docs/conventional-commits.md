# Conventional Commits

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) keep commit history readable and make the release impact of a change explicit.

Version numbers and changelogs are currently curated in the release preparation PR. The CI `Create Release` workflow is tag-only: it reads committed package versions, audits or creates the corresponding tags, and does not infer versions or generate changelogs.

See the [release process](./releasing.md) for the complete preparation,
publication-ordering, and verification workflow.

## How to Use in PRs

To preserve conventional-commit metadata on `main`, use one of these:

- set the PR title to conventional-commit format and squash merge
- or merge without squashing and keep conventional-commit format in commits

## Supported Types

| Type     | Intended change |
| -------- | --------------- |
| build    | Build system or dependency changes |
| chore    | Maintenance that does not fit another type |
| ci       | Continuous integration changes |
| docs     | Documentation changes |
| feat     | New user-visible functionality |
| fix      | User-visible bug fixes |
| perf     | Performance improvements |
| refactor | Internal changes without intended behavior changes |
| style    | Formatting or presentation-only changes |
| test     | Test-only changes |

Any type can be a breaking change with `!`, which implies a major bump.

## Quick Examples

```text
fix(backup-script): report error if no space left on device
feat: add support for cats
refactor!: remove support for sabre-toothed tiger
```
