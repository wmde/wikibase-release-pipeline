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
  echo "Fixing Linting and Formatting Issues"
  NPM_JS_COMMAND="lint:fix-js"
  NPM_YML_COMMAND="lint:fix-yml"
  NEWLINE_FLAGS="--fix"
  BLACK_FLAGS=""
else
  NPM_JS_COMMAND="lint-js"
  NPM_YML_COMMAND="lint-yml"
  NEWLINE_FLAGS=""
  BLACK_FLAGS="--check"
fi

# ℹ️ Linting Javascript test/**/*.cjs,js,json,mjs,ts
$RUN_TEST_RUNNER_CMD "npm run $NPM_JS_COMMAND"

# ℹ️ Linting Markdown **/*.md
if $SHOULD_FIX
then
  $RUN_TEST_RUNNER_CMD "npm run lint:fix-md"
fi

# ℹ️ Linting YML **/*.yml
$RUN_TEST_RUNNER_CMD "npm run $NPM_YML_COMMAND"

# ℹ️ Linting Shell Scripts (**/*.sh) - https://github.com/koalaman/shellcheck#from-your-terminal
find . -type d -name node_modules -prune -false -o -name "*.sh" -print0 \
  | xargs -0 docker run --rm -v "$(pwd)":/code dcycle/shell-lint:2

# ℹ️ Linting Dockerfiles (**/Dockerfile) - https://github.com/hadolint/hadolint
docker run --rm -v "$(pwd)":/code -v "$(pwd)/.hadolint.yml":/.hadolint.yml hadolint/hadolint:latest-alpine sh -c "
  find . -name Dockerfile -print -o -type d -name node_modules -prune | xargs hadolint
"

# ℹ️ Formatting Python scripts
$RUN_TEST_RUNNER_CMD "python3 -m black ../ $BLACK_FLAGS"

# ℹ️ Linting newlines across the repo
MY_FILES="$(git ls-files)"
$TEST_COMPOSE run --rm --build -v "$(pwd):/tmp" test-runner -c "
  python3 scripts/add_newline.py /tmp '$MY_FILES' $NEWLINE_FLAGS
"
