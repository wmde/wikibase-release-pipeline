#!/usr/bin/env bash

# ℹ️ Linting JS, YAML, Python scripts, and general whitespace (optionally fix)
if [[ $1 == "--fix" || $1 == "-f" ]]; then
  echo "ℹ️ Fixing linting issues"
  npm run lint:fix
  # TODO: We only have 1 python script, should we do away with the Python dependency
  # and use Typescript/Javascript utility scripts instead?
  python3 -m black ./**/*.py
else
  npm run lint:js-and-yml
  npm run lint:whitespace
  python3 -m black ./**/*.py --check
fi

# ℹ️ Linting shell scripts (*.sh) with shellcheck
find . -type d \( -name node_modules -o -name .git \) -prune -o -type f -name "*.sh" -print0 | \
  xargs -0 shellcheck
shellcheck ./nx

# ℹ️ Linting Dockerfiles (**/Dockerfile) - https://github.com/hadolint/hadolint
find . -type d \( -name node_modules -o -name .git \) -prune -o -type f -name Dockerfile -print0 | \
  xargs -0 hadolint --config .hadolint.yml
