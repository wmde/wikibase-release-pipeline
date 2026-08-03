# Conventional Commits

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) keep commit history readable and make the release impact of a change explicit.

`wbs-dev update-versions` uses release-driving conventional commits together with changed project paths to propose versions and changelog entries. Operators still review and may edit that release metadata before committing it. The `wbs-dev release` commands only publish validated, committed release tags.

The highest release impact since the previous project tag selects the next semantic version: `fix` and `perf` produce a patch, `feat` produces a minor, and a breaking marker produces a major. Other commit types do not select a release version unless marked as breaking.

See the [release process](./releasing.md) for the complete preparation, publication-ordering, and verification workflow.

## How to Use in PRs

To preserve conventional-commit metadata on `main`, use one of these:

- set the PR title to conventional-commit format and squash merge
- or merge without squashing and keep conventional-commit format in commits

## Supported Types

| Type     | Intended change                                    |
| -------- | -------------------------------------------------- |
| build    | Build system or dependency changes                 |
| chore    | Maintenance that does not fit another type         |
| ci       | Continuous integration changes                     |
| docs     | Documentation changes                              |
| feat     | New user-visible functionality                     |
| fix      | User-visible bug fixes                             |
| perf     | Performance improvements                           |
| refactor | Internal changes without intended behavior changes |
| style    | Formatting or presentation-only changes            |
| test     | Test-only changes                                  |

Any type can be a breaking change with `!`, which implies a major bump.

## Quick Examples

```text
fix(backup-script): report error if no space left on device
feat: add support for cats
refactor!: remove support for sabre-toothed tiger
```
