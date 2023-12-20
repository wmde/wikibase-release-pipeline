#!/usr/bin/env bash
set -e

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
  echo "Fixing Errors"
  NPM_LINT_COMMAND="npm run fix --silent --no-update-notifier"
  PYTHON_FLAGS="--fix"
else
  NPM_LINT_COMMAND="npm run lint --silent --no-update-notifier"
  PYTHON_FLAGS=""
fi

# ℹ️ Linting Dockerfiles (**/Dockerfile)
# https://github.com/hadolint/hadolint
docker run --rm -v "$(pwd)":/code -v "$(pwd)/.hadolint.yml":/.hadolint.yml hadolint/hadolint:latest-alpine sh -c "find . -name Dockerfile -print -o -type d -name node_modules -prune | xargs hadolint"

# ℹ️ Linting Shell Scripts (**/*.sh)
# https://github.com/koalaman/shellcheck#from-your-terminal
find . -type d -name node_modules -prune -false -o -name "*.sh" -print0 | xargs -0 docker run --rm -v "$(pwd)":/code dcycle/shell-lint:2

if ! [[ -f "local.env" ]]; then
	touch local.env
fi

TEST_RUNNER_COMPOSE="docker compose -f test/docker-compose.yml --env-file ./test/test-runner.env --env-file ./local.env --progress quiet"

# ℹ️ Linting Javascript (test/**/*.ts and docs/diagrams/**/*.js)
$TEST_RUNNER_COMPOSE run --rm -v "$(pwd)/docs/diagrams:/tmp/diagrams" test-runner -c "
  npm ci --loglevel=error --progress=false --no-audit --no-fund --no-update-notifier > /dev/null &&
  $NPM_LINT_COMMAND &&
  cd /tmp/diagrams &&
  npm ci --loglevel=error --progress=false --no-audit --no-fund --no-update-notifier > /dev/null &&
  $NPM_LINT_COMMAND
"

# ℹ️ Linting newlines across the repo
MY_FILES="$(git ls-files)"
$TEST_RUNNER_COMPOSE run --rm -v "$(pwd):/tmp" test-runner -c "
  python3 scripts/add_newline.py /tmp '$MY_FILES' $PYTHON_FLAGS
"
