#!/usr/bin/env bash

# Shared host boundary for invoking the containerized WBS tools application.

prepare_wbs_tools_environment_args() {
  WBS_TOOLS_ENVIRONMENT_ARGS=()
  local variable_name
  local variable_names="COMPOSE_PROJECT_NAME BUILD_CACHE_REGISTRY GITHUB_ACTIONS ${WBS_TOOLS_ENV_PASSTHROUGH:-}"
  for variable_name in $variable_names; do
    if [[ -v "$variable_name" ]]; then
      WBS_TOOLS_ENVIRONMENT_ARGS+=(-e "$variable_name")
    fi
  done
}

run_wbs_tools_validation() {
  docker run --rm \
    -e WBS_VALIDATE_OPTIONS=true \
    "$WBS_TOOLS_IMAGE" \
    node dist/wbs.js "$@"
}

run_wbs_tools_command() {
  local tty_flags=()
  if [[ -t 0 && -t 1 ]]; then
    tty_flags=(-it)
  else
    tty_flags=(-i)
  fi
  prepare_wbs_tools_environment_args
  exec docker run "${tty_flags[@]}" --rm \
    "${WBS_TOOLS_ENVIRONMENT_ARGS[@]}" \
    -e WBS_DIR="$WBS_DIR" \
    -e ENV_FILE_PATH="$ENV_FILE_PATH" \
    -e LOG_PATH="$WBS_DIR/installation.log" \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v "$WBS_DIR:$WBS_DIR" \
    -v "$WBS_DIR:/app/wbs" \
    -w "$WBS_DIR" \
    "$WBS_TOOLS_IMAGE" \
    node /app/dist/wbs.js "$@"
}
