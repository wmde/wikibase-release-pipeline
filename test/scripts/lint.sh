#!/usr/bin/env bash
set -e

cd test

# ℹ️  Linting Dockerfiles (**/Dockerfile)
# https://github.com/hadolint/hadolint
docker run --rm -v "$(pwd)":/code -v "$(pwd)/../.hadolint.yml":/.hadolint.yml hadolint/hadolint:latest-alpine sh -c "find /code -type f -name 'Dockerfile' | xargs hadolint"

# ℹ️  Linting Shell Scripts (**/*.sh)
# https://github.com/koalaman/shellcheck#from-your-terminal
find . -type d -name node_modules -prune -false -o -name "*.sh" -print0 | xargs -0 docker run --rm -v "$(pwd)":/code dcycle/shell-lint:2

docker compose run --rm --volume "${PWD}/../docs/diagrams:/tmp/diagrams" test-runner -c "
# ℹ️  Linting Javascript (test/**/*.js and docs/diagrams/**/*.js)
  npm run lint --silent &&
  cd /tmp/diagrams
  npm install --loglevel=error --progress=false --no-audit --no-fund > /dev/null &&
  npm run lint --silent
"

cd ..  > /dev/null
