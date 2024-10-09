# Conventional commits

[Conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) are human and machine readable commit messages. We use them to automatically generate changelog items and version bumps on release using [NX](https://nx.dev).

NX supports the [a number of](https://github.com/nrwl/nx/blob/db10812da789cd48d3a722628a00feda9d0e3810/packages/nx/src/command-line/release/config/conventional-commits.ts) conventional commit types. We use the following for changelog generation as configured in [nx.json](https://github.com/wmde/wikibase-release-pipeline/blob/main/nx.json):

| Type     | SemVer Bump | Changelog Title  |
| -------- | ----------- | ---------------- |
| build    | none        | 📦 Build         |
| chore    | none        | 🏡 Chore         |
| ci       | none        | 🤖 CI            |
| docs     | none        | 📖 Documentation |
| feat     | minor       | 🚀 Features      |
| fix      | patch       | 🩹 Fixes         |
| perf     | patch       | 🔥 Performance   |
| refactor | patch       | 💅 Refactors     |
| style    | none        | 🎨 Styles        |
| test     | none        | ✅ Tests         |

