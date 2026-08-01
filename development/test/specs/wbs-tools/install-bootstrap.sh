#!/usr/bin/env bash
set -euo pipefail

TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$TEST_DIR/../../../.." && pwd)"
TEST_ROOT="$(mktemp -d)"

cleanup() {
  rm -r "$TEST_ROOT"
}
trap cleanup EXIT

create_commit() {
  local fixture_repo="$1"
  local version="$2"

  printf '{\n  "version": "%s"\n}\n' "$version" > "$fixture_repo/package.json"
  git -C "$fixture_repo" add package.json
  git -C "$fixture_repo" commit -q -m "WBS $version"
}

create_fixture_remote() {
  local fixture_name="$1"
  local fixture_repo="$TEST_ROOT/$fixture_name"
  local fixture_remote="$TEST_ROOT/$fixture_name.git"

  git init -q "$fixture_repo"
  git -C "$fixture_repo" config user.email "wbs-tools-test@example.invalid"
  git -C "$fixture_repo" config user.name "WBS tools test"

  mkdir -p "$fixture_repo/tools/scripts"
  printf '#!/usr/bin/env bash\nexit 0\n' > "$fixture_repo/tools/scripts/install.sh"
  chmod +x "$fixture_repo/tools/scripts/install.sh"
  git -C "$fixture_repo" add tools/scripts/install.sh

  create_commit "$fixture_repo" "1.9.0"
  git -C "$fixture_repo" tag 'wbs@1.9.0'

  create_commit "$fixture_repo" "1.10.0"
  git -C "$fixture_repo" tag 'wbs@1.10.0'

  create_commit "$fixture_repo" "2.0.0-rc.1"
  git -C "$fixture_repo" tag 'wbs@2.0.0-rc.1'
  git -C "$fixture_repo" tag 'wbs@not-semver'

  git clone -q --bare "$fixture_repo" "$fixture_remote"
  printf '%s' "$fixture_remote"
}

run_bootstrap() {
  local case_name="$1"
  local fixture_remote="$2"
  shift 2

  local case_dir="$TEST_ROOT/$case_name"
  mkdir -p "$case_dir/bootstrap"
  cp "$REPO_DIR/install" "$case_dir/bootstrap/install"

  WBS_DIR="$case_dir/wikibase-suite" \
    WBS_REPO_URL="$fixture_remote" \
    WBS_REF='' \
    bash "$case_dir/bootstrap/install" --skip-deps --skip-launch "$@"
}

fixture_remote="$(create_fixture_remote releases)"

run_bootstrap latest "$fixture_remote"
grep -q '"version": "1.10.0"' "$TEST_ROOT/latest/wikibase-suite/package.json"

run_bootstrap explicit "$fixture_remote" --wbs-ref 'wbs@1.9.0'
grep -q '"version": "1.9.0"' "$TEST_ROOT/explicit/wikibase-suite/package.json"

prerelease_repo="$TEST_ROOT/prerelease-only"
prerelease_remote="$TEST_ROOT/prerelease-only.git"
git init -q "$prerelease_repo"
git -C "$prerelease_repo" config user.email "wbs-tools-test@example.invalid"
git -C "$prerelease_repo" config user.name "WBS tools test"
mkdir -p "$prerelease_repo/tools/scripts"
printf '#!/usr/bin/env bash\nexit 0\n' > "$prerelease_repo/tools/scripts/install.sh"
chmod +x "$prerelease_repo/tools/scripts/install.sh"
git -C "$prerelease_repo" add tools/scripts/install.sh
create_commit "$prerelease_repo" "2.0.0-rc.1"
git -C "$prerelease_repo" tag 'wbs@2.0.0-rc.1'
git clone -q --bare "$prerelease_repo" "$prerelease_remote"

if run_bootstrap no-stable "$prerelease_remote" >"$TEST_ROOT/no-stable.log" 2>&1; then
  echo "Expected bootstrap without a stable release to fail."
  exit 1
fi
grep -q 'No stable Wikibase Suite release was found' "$TEST_ROOT/no-stable.log"

if run_bootstrap query-failure "$TEST_ROOT/missing.git" >"$TEST_ROOT/query-failure.log" 2>&1; then
  echo "Expected an unreachable release repository to fail."
  exit 1
fi
grep -q 'Could not query Wikibase Suite releases' "$TEST_ROOT/query-failure.log"

local_checkout="$TEST_ROOT/local-checkout"
mkdir -p "$local_checkout/tools/scripts"
git init -q "$local_checkout"
cp "$REPO_DIR/install" "$local_checkout/install"
printf '#!/usr/bin/env bash\nexit 0\n' > "$local_checkout/tools/scripts/install.sh"
chmod +x "$local_checkout/tools/scripts/install.sh"
WBS_REPO_URL="$TEST_ROOT/missing.git" WBS_REF='' \
  bash "$local_checkout/install" --dev --skip-launch

echo "WBS bootstrap selection tests passed"
