#!/usr/bin/env bash
set -e

SHOULD_FIX=false

# Check if the script is run with the --fix or -f option
if [[ $1 == "--fix" || $1 == "-f" ]]; then
  SHOULD_FIX=true
fi

# ℹ️ Linting JS, YAML, MD, Python scripts, and general whitespace (optionally fix)
if $SHOULD_FIX; then
  echo "Fixing Linting and Formatting Issues"
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
