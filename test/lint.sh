#!/usr/bin/env bash
set -e

# ℹ️ Linting JS, YAML, Python scripts, and general whitespace (optionally fix)
if [[ $1 == "--fix" || $1 == "-f" ]]; then
  echo "ℹ️ Fixing linting issues"
  npm run lint:fix --workspace test
  # TODO: We only have 1 python script, should we do away with the Python dependency
  # and use Typescript/Javascript utility scripts instead?
  python3 -m black ../
else
  npm run lint:js-and-yml --workspace test
  npm run lint:whitespace --workspace test
  python3 -m black ../ --check
fi

# ℹ️ Linting Shell Scripts (**/*.sh) - https://github.com/koalaman/shellcheck#from-your-terminal
(cd .. && find . -type d -name node_modules -prune -false -o -name "*.sh" -print0 \
  | xargs -0 docker run --rm -v .:/code dcycle/shell-lint:2)

# ℹ️ Linting Dockerfiles (**/Dockerfile) - https://github.com/hadolint/hadolint
(cd .. && docker run --rm -v .:/code -v "./test/.hadolint.yml":/.hadolint.yml hadolint/hadolint:latest-alpine sh -c "
  find . -name Dockerfile -print -o -type d -name node_modules -prune | xargs hadolint
")
