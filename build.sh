#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

set -o allexport
# shellcheck disable=SC1091
source ./variables.env
if [ -f ./local.env ]; then
    # shellcheck disable=SC1091
    source ./local.env
fi
set +o allexport

# ℹ️ Update Commit Hashes
function update_commit_hashes {
    docker build ./test -t wikibase-test-runner
    docker run --rm -v "$(pwd)":/workspace wikibase-test-runner bash -c "
        cd /workspace
        python3 update_commits.py
    "
}

function build() {
    # Function to derive _VERSION_MINOR and _VERSION_MAJOR variables
    derive_version_variables() {
        local version_variable="$1"
        local version="${!version_variable}"  # Get the value of the regular version variable
        local major_version="${version%%.*}"  # Extract major version (before first dot)
        local minor_version="${version#*.}"   # Remove up to first dot, leaving minor and patch version
        minor_version="${minor_version%%.*}"  # Extract minor version (before second dot)

        # Set _VERSION_MAJOR and _VERSION_MINOR variables
        export "${version_variable}_MAJOR=$major_version"
        export "${version_variable}_MINOR=$major_version.$minor_version"
    }

    # Loop through all variables starting with WBS_ and ending with _VERSION
    for var in $(compgen -A variable | grep '^WBS_.*_VERSION$'); do
        derive_version_variables "$var"
    done

    docker compose --env-file variables.env -f docker-compose.build.yml build "$@"
}

for arg in "$@"; do
    case $arg in
        update_hashes)
            update_commit_hashes
            exit 0
            ;;
    esac
done

build "$@"
