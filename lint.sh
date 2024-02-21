#!/usr/bin/env bash
set -e
source ./test/scripts/test_runner_setup.sh

SHOULD_FIX=false
while getopts f flag
do
    case "${flag}" in
        f) SHOULD_FIX=true;;
        *)
    esac
done

if $SHOULD_FIX
then
  echo "Fixing Linting issues in Typescript"
  NPM_LINT_COMMAND="npm run lint:fix --silent"
  PYTHON_FLAGS="--fix"
else
  NPM_LINT_COMMAND="npm run lint --silent"
  PYTHON_FLAGS=""
fi

# ℹ️ Linting Javascript test/**/*.ts
$TEST_COMPOSE run --rm --build -v "$(pwd)/test:/tmp/test" test-runner -c "
  $NPM_LINT_COMMAND &&
  cd /tmp/test &&
  npm ci --progress=false > /dev/null &&
  $NPM_LINT_COMMAND
"

# ℹ️ Linting Shell Scripts (**/*.sh) - https://github.com/koalaman/shellcheck#from-your-terminal
find . -type d -name node_modules -prune -false -o -name "*.sh" -print0 \
  | xargs -0 docker run --rm -v "$(pwd)":/code dcycle/shell-lint:2

# ℹ️ Linting Dockerfiles (**/Dockerfile) - https://github.com/hadolint/hadolint
docker run --rm -v "$(pwd)":/code -v "$(pwd)/.hadolint.yml":/.hadolint.yml hadolint/hadolint:latest-alpine sh -c "
  find . -name Dockerfile -print -o -type d -name node_modules -prune | xargs hadolint
"

# ℹ️ Linting newlines across the repo
MY_FILES="$(git ls-files)"
$TEST_COMPOSE run --rm --build -v "$(pwd):/tmp" test-runner -c "
  python3 scripts/add_newline.py /tmp '$MY_FILES' $PYTHON_FLAGS
"
