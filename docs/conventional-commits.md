# Conventional commits

[Conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) are human and machine readable commit messages. We use them to automatically generate changelog items and version bumps on release using [NX](https://nx.dev).

On release of a project, NX collects all commit messages from git for the project's directory (e.g. `build/wdqs`) since last release (e.g. `wdqs@1.0.1`). For this to work well we need to follow a certain procedure in our Pull requests:

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

### Documentation update

Some update to the docs bumping a minor version:

```
docs: describe how to work around sleeping cats
```


### Breaking change

All types can be breaking changes. Here is an example for a breaking refactor, bumping a major version.

```
refactor!: remove support for sabre-toothed tiger
```


