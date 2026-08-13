#!/usr/bin/env bash
set -e

docker_login() {
  local token=$1
  shift
  local output

  if ! output=$(printf '%s' "$token" | docker login "$@" --password-stdin 2>&1); then
    printf '%s\n' "$output" >&2
    return 1
  fi
}

if [[ -n "${DOCKERHUB_TOKEN:-}" ]]; then
  docker_login "$DOCKERHUB_TOKEN" --username wmdetravisbot
fi

GHCR_TOKEN=${WBS_GHCR_TOKEN:-${GITHUB_TOKEN:-${GH_TOKEN:-}}}
if [[ -n "$GHCR_TOKEN" && -n "${GITHUB_REPOSITORY_OWNER:-}" ]]; then
  docker_login "$GHCR_TOKEN" ghcr.io --username "$GITHUB_REPOSITORY_OWNER"
fi

# Keep the container-owned workspace dependencies synchronized with the project
# configuration and package-manager version. Restore the image snapshot
# explicitly instead of relying on Docker to initialize nested named volumes
# from paths hidden by the /workspace bind mount.
if [ -f "pnpm-lock.yaml" ]; then
  dependency_state_hash=$(
    {
      sha256sum package.json pnpm-lock.yaml pnpm-workspace.yaml
      pnpm --version
      node --version
    } | sha256sum | cut -d ' ' -f 1
  )
  dependency_state_marker="node_modules/.wbs-dev-dependencies"
  installed_hash=$(cat "$dependency_state_marker" 2>/dev/null || true)

  if [[ "$installed_hash" != "$dependency_state_hash" ]] ||
    [[ ! -x node_modules/.bin/tsx ]] ||
    [[ ! -x images/wbs-tools/node_modules/.bin/vite ]]; then
    dependency_snapshot="/opt/wbs-dev-dependencies"
    snapshot_hash=$(cat \
      "$dependency_snapshot/node_modules/.wbs-dev-dependencies" \
      2>/dev/null || true)

    if [[ "$snapshot_hash" == "$dependency_state_hash" ]] &&
      [[ -x "$dependency_snapshot/node_modules/.bin/tsx" ]] &&
      [[ -x "$dependency_snapshot/images/wbs-tools/node_modules/.bin/vite" ]]; then
      echo "Restoring workspace dependencies from the image" >&2
      mkdir -p node_modules images/wbs-tools/node_modules
      find node_modules -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
      find images/wbs-tools/node_modules \
        -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
      cp -a "$dependency_snapshot/node_modules/." node_modules/
      cp -a "$dependency_snapshot/images/wbs-tools/node_modules/." \
        images/wbs-tools/node_modules/
    else
      echo "Installing workspace dependencies from the frozen lockfile" >&2
      pnpm install --frozen-lockfile >&2
    fi
    printf '%s\n' "$dependency_state_hash" > "$dependency_state_marker"
  fi
else
  echo "pnpm-lock.yaml does not exist, running 'pnpm install'" >&2
  pnpm install >&2
fi

# Execute the command passed to the development container.
exec bash "$@"
