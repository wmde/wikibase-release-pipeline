# Conventional commits

[Conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) are human and machine readable commit messages. We use them with [NX](https://nx.dev) to preview changelog items and [semantic version (SemVer)](https://semver.org/) bumps while preparing releases.

The CI `Create Release` workflow is tag-only and does not run `nx release` or generate changelogs. Final changelogs are reviewed and committed as part of the release PR.

Here is an example of a commit message describing a bug fix in a backup script. In Nx preview output, this would bump the project's patch version number:

```
fix(backup-script): report error if no space left on device
```

When generating local Nx release previews, NX collects commit messages for the project's directory (e.g. `build/wdqs`) since last release (e.g. `wdqs@1.0.1`). For this to work well we need to follow a certain procedure in our Pull requests:

- Use conventional commit syntax for the PR title, then squash merge the PR, so that the squashed commit will contain the conventional commit message from the PR title on the target branch. The PR body will become the commit message body.
- Or: Merge with merge commit so that all commits from the PR are retained on the target branch. All commits in the PR should follow conventional commit syntax then.

## Supported types

NX supports [a number of](https://github.com/nrwl/nx/blob/db10812da789cd48d3a722628a00feda9d0e3810/packages/nx/src/command-line/release/config/conventional-commits.ts) conventional commit types. We use the following for changelog generation as configured in our [nx.json](https://github.com/wmde/wikibase-release-pipeline/blob/main/nx.json):

| Type     | SemVer Bump | Changelog Title  |
| -------- | ----------- | ---------------- |
| build    | patch       | 📦 Build         |
| chore    | patch       | 🏡 Chore         |
| ci       | patch       | 🤖 CI            |
| docs     | patch       | 📖 Documentation |
| feat     | minor       | 🚀 Features      |
| fix      | patch       | 🩹 Fixes         |
| perf     | patch       | 🔥 Performance   |
| refactor | patch       | 💅 Refactors     |
| style    | patch       | 🎨 Styles        |
| test     | patch       | ✅ Tests         |

## Examples

### Feature

A new feature implementation bumping the minor version:

```
feat: added support for cats
```

Will generate the following changelog entry:

#### 🚀 Features

- added support for cats

### Documentation update

Some update to the docs bumping a minor version:

```
docs: describe how to work around sleeping cats
```

Will generate the following changelog entry:

#### 📖 Documentation

- describe how to work around sleeping cats

### Breaking change

All types can be breaking changes. Here is an example for a breaking refactor, bumping a major version.

```
refactor!: remove support for sabre-toothed tiger
```

Will generate the following changelog entry:

#### 💅 Refactors

- remove support for sabre-toothed tiger

### Performance change for a certain component

Noting that a change is specific to a component or subsystem in a project.

```
pref(food-dispenser): improved speed
```

Will generate the following changelog entry:

#### 🔥 Performance

- food-dispenser: improved speed
