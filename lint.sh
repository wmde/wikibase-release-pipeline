#!/usr/bin/env bash

# Dockerfile linting with Hadolint (uses rules from `.hadolint`)
# https://github.com/hadolint/hadolint
# -type d -name node_modules -prune
echo "ℹ️  Linting Dockerfiles (**/Dockerfile)"
docker run --rm -v "$(pwd)":/code -v ./.hadolint.yml:/.hadolint.yml hadolint/hadolint:latest-alpine sh -c "find /code -type f -name 'Dockerfile' | xargs hadolint"

# Bash Script linting with Spellcheck (bash)
# https://github.com/koalaman/shellcheck#from-your-terminal
echo "ℹ️  Linting Shell Scripts (**/*.sh)"
find . -type d -name node_modules -prune -false -o -name "*.sh" -print0 | xargs -0 docker run --rm -v "$(pwd)":/code dcycle/shell-lint:2

# Javascript linting Selenium tests
echo "ℹ️  Linting Javascript in test (test/**/.js)"
{
  cd test
  npm install --loglevel=error
} > /dev/null || exit
npm run lint --silent
cd ..  > /dev/null || exit

# Javascript linting Diagrams code
echo "ℹ️  Linting Javascript in Diagrams code (docs/diagrams/**/.js)"
{
  cd docs/diagrams
  npm install  --loglevel=error
} > /dev/null || exit
npm run lint --silent
cd ..  > /dev/null || exit
