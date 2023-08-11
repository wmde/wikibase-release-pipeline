#!/usr/bin/env bash

# Dockerfile linting with Hadolint (uses rules from `.hadolint`)
# https://github.com/hadolint/hadolint
# -type d -name node_modules -prune
echo "✳️  Linting Dockerfiles (**/Dockerfile)"
docker run --rm -v "$(pwd)":/code -v ./.hadolint.yml:/.hadolint.yml hadolint/hadolint:latest-alpine sh -c "find /code -type f -name 'Dockerfile' | xargs hadolint"

# Bash Script linting with Spellcheck (bash)
# https://github.com/koalaman/shellcheck#from-your-terminal
echo "✳️  Linting Shell Scripts (*.sh)"
find . -type d -name node_modules -prune -false -o -name "*.sh" -print0 | xargs -0 docker run -v "$(pwd)":/code dcycle/shell-lint:2

# Javascript linting Selenium tests
echo "✳️  Linting Javascript in Selenium specs (Docker/test/selenium/specs/**/.js)"
{
  cd Docker/test/selenium
  npm install
} > /dev/null || exit
npm run lint --silent
cd ../../..  > /dev/null || exit

# Javascript linting Diagrams code
echo "✳️  Linting Javascript in Diagrams code (diagrams/**/.js)"
{
  cd diagrams
  npm install  > /dev/null || exit
} > /dev/null || exit
npm run lint --silent
cd ..  > /dev/null || exit
