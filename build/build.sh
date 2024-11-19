#!/usr/bin/env bash  

# === Script setup

# Change to the directory where the script is located
cd "$(dirname "${BASH_SOURCE[0]}")" || exit

if [ "$#" -lt 1 ]; then
	echo "Usage: $0 <directory> <--dry-run> [docker buildx build arguments...]"
	exit 1
fi

# Change to the directory for the specified project
cd "$1" || { echo "Failed to change directory to $1"; exit 1; }

# Remove the first argument, leaving the rest for docker buildx build
shift

DRY_RUN=false
PUBLISH=false
BUILD_ARGS=()
BUILD_ENV_FILE="build.env"
DISALLOWED_ARGS=(
	"--firstRelease=true"
)

for arg in "$@"; do
	if [[ $arg == "--dry-run" || $arg == "--dryRun=true" ]]; then
		DRY_RUN=true
	elif [[ $arg == "--publish" ]]; then
		PUBLISH=true
	elif [[ " ${DISALLOWED_ARGS[*]} " =~ $arg ]]; then
		continue
	else
		BUILD_ARGS+=("$arg")
	fi
done

# === Setup tags

# publish to Dockerhub
if [ "$PUBLISH" == true ]; then
	IMAGE_VERSION=$(jq -r '.version' package.json)
	IMAGE_VERSION_MAJOR=$(echo "$IMAGE_VERSION" | cut -d '.' -f 1)
	IMAGE_VERSION_MINOR=$(echo "$IMAGE_VERSION" | cut -d '.' -f 1,2)
	TAGS+=(
		"${IMAGE_VERSION}"
		"${IMAGE_VERSION_MAJOR}"
		"${IMAGE_VERSION_MINOR}"
	)
	# get image specific tags
	# shellcheck disable=SC1090
	source "$BUILD_ENV_FILE"
	eval "$(declare -p IMAGE_TAGS)"
	TAGS+=(
		"${IMAGE_TAGS[@]}"
	)
	BUILD_ARGS+=("--push")

# build/test in CI
elif [ "$GITHUB_ACTIONS" == true ]; then
	TAGS+=(
		"dev-${GITHUB_RUN_ID}"
	)

# local build
else
	BUILD_ARGS+=("--load")
	# When not tagging anything but the image name the "latest" tag is by default applied,
	# making that explicit here:
	TAGS+=(
		"latest"
	)
fi

# transform TAGS to build args
IMAGE_NAME=$(jq -r '.name' package.json)

# publish to Dockerhub
if [ "$PUBLISH" == true ]; then
	# IMAGE_REGISTRY implies dockerhub if empty
	IMAGE_NAMESPACE=wikibase
# build/test in CI
elif [ "$GITHUB_ACTIONS" == true ]; then
	IMAGE_REGISTRY=ghcr.io
	IMAGE_NAMESPACE="${GITHUB_REPOSITORY_OWNER}/wikibase"
# local build
else
	IMAGE_NAMESPACE=wikibase
fi

IMAGE_URL=${IMAGE_REGISTRY+${IMAGE_REGISTRY}/}${IMAGE_NAMESPACE}/${IMAGE_NAME}

for TAG in "${TAGS[@]}"; do
	BUILD_ARGS+=("--tag ${IMAGE_URL}:${TAG}")
done

# === Transform vars in build.env to build args

while IFS='=' read -r key value; do
	# skip if the line is empty or the key is IMAGE_TAGS
	[ -z "$key" ] || [[ "$key" == IMAGE_TAGS ]] && continue

	if [ -n "$value" ]; then
		BUILD_ARGS+=("--build-arg" "$key=$value")
	fi
done < <(grep -E '^[A-Z_]+=.*' $BUILD_ENV_FILE)

# == Run build

BUILD_COMMAND="docker buildx build ${BUILD_ARGS[*]} ."

if [ "$DRY_RUN" == true ]; then
	echo "Dry-run. This is the build command which would run:"
	echo
	echo "$BUILD_COMMAND"
	echo
else
	exec $BUILD_COMMAND
fi
