#!/usr/bin/env bash

[ -f "local.env" ] || touch local.env
source local.env

# Default values
path="."
fix=false
prettier=false

# Function to display help message
usage() {
  echo "Usage: lint.sh <path> [--fix, -f] [--prettier]"
  exit 1
}

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --fix|-f)
      fix=true
      shift
      ;;
    --prettier)
      prettier=true
      shift
      ;;
    *)
      path="$1"
      shift
      ;;
  esac
done

# Ensure path is a directory
if [[ ! -d $path ]]; then
  echo "Error: Path '$path' does not exist or is not a directory."
  usage
fi

# Linting JS, YAML, Python scripts, and general whitespace
if $fix; then
  echo "ℹ️ Fixing linting issues which can be fixed automatically"

  if $prettier; then
    echo "ℹ️ Pre-processing with Prettier"
    prettier "$path/**/*.{cjs,js,mjs,ts,json}" --log-level error --write
    prettier "$path/**/*.md" --log-level error --config .prettierrc.json --write
    prettier "$path/**/*.{yml,yaml}" --log-level error --config .prettierrc.json --write
  fi

  echo "ℹ️ Running ESLint with fix"
  eslint "$path" --fix
  eslint "$path/**/**" --no-eslintrc --config .eslintrc-whitespace.json --fix

  echo "ℹ️ Running Black for Python"
  find "$path" -path "$path/node_modules" -prune -o -name '*.py' -print0 | xargs -0 -r \
    python3 -m black --quiet
else
  echo "ℹ️ Running ESLint (without --fix)"
  eslint "$path"
  eslint "$path/**/**" --no-eslintrc --config .eslintrc-whitespace.json

  echo "ℹ️ Running Python Black on all *.py files (with --check)"
  find "$path" -path "$path/node_modules" -prune -o -name '*.py' -print0 | xargs -0 -r \
    python3 -m black --diff --quiet --check
fi

echo "ℹ️ Running shellcheck on *.sh files"
find "$path" -type d \( -name node_modules -o -name .git \) -prune -o -type f -name "*.sh" -print0 | xargs -0 \
  shellcheck -x
# Always check nx script...
shellcheck -x ./nx

echo "ℹ️ Running hadolint on all Dockerfiles"
find "$path" -type d \( -name node_modules -o -name .git \) -prune -o -type f -name Dockerfile -print0 | xargs -0 -r \
  hadolint --config .hadolint.yml
