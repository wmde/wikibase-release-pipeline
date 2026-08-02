#!/usr/bin/env bash
set -euo pipefail

TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$TEST_DIR/../../../../.." && pwd)"
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
  # shellcheck disable=SC2016 # The generated fixture expands these variables when invoked.
  printf '#!/usr/bin/env bash\nprintf "%%s\\n" "$@" > "$WBS_DIR/wbs-invocation"\n' > "$fixture_repo/wbs"
  chmod +x "$fixture_repo/wbs"
  git -C "$fixture_repo" add tools/scripts/install.sh wbs

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
    WBS_SKIP_DEPENDENCY_INSTALLS=true \
    bash "$case_dir/bootstrap/install" "$@"
}

fixture_remote="$(create_fixture_remote releases)"

run_bootstrap latest "$fixture_remote"
grep -q '"version": "1.10.0"' "$TEST_ROOT/latest/wikibase-suite/package.json"
grep -qx 'install' "$TEST_ROOT/latest/wikibase-suite/wbs-invocation"
grep -qx -- '--web' "$TEST_ROOT/latest/wikibase-suite/wbs-invocation"

run_bootstrap explicit "$fixture_remote" --wbs-ref 'wbs@1.9.0'
grep -q '"version": "1.9.0"' "$TEST_ROOT/explicit/wikibase-suite/package.json"

run_bootstrap local-mode "$fixture_remote" --local --debug
grep -qx -- '--local' "$TEST_ROOT/local-mode/wikibase-suite/wbs-invocation"
grep -qx -- '--debug' "$TEST_ROOT/local-mode/wikibase-suite/wbs-invocation"

prerelease_repo="$TEST_ROOT/prerelease-only"
prerelease_remote="$TEST_ROOT/prerelease-only.git"
git init -q "$prerelease_repo"
git -C "$prerelease_repo" config user.email "wbs-tools-test@example.invalid"
git -C "$prerelease_repo" config user.name "WBS tools test"
mkdir -p "$prerelease_repo/tools/scripts"
printf '#!/usr/bin/env bash\nexit 0\n' > "$prerelease_repo/tools/scripts/install.sh"
chmod +x "$prerelease_repo/tools/scripts/install.sh"
printf '#!/usr/bin/env bash\nexit 0\n' > "$prerelease_repo/wbs"
chmod +x "$prerelease_repo/wbs"
git -C "$prerelease_repo" add tools/scripts/install.sh wbs
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
# shellcheck disable=SC2016 # The generated fixture expands these variables when invoked.
printf '#!/usr/bin/env bash\nprintf "%%s\\n" "$@" > "$WBS_DIR/wbs-invocation"\n' > "$local_checkout/wbs"
chmod +x "$local_checkout/wbs"
WBS_REPO_URL="$TEST_ROOT/missing.git" WBS_REF='' \
  WBS_SKIP_DEPENDENCY_INSTALLS=true bash "$local_checkout/install"
grep -qx -- '--web' "$local_checkout/wbs-invocation"

if WBS_SKIP_DEPENDENCY_INSTALLS=true bash "$TEST_ROOT/latest/bootstrap/install" --dev >"$TEST_ROOT/dev.log" 2>&1; then
  echo "Expected --dev on the bootstrap to fail."
  exit 1
fi
grep -q -- '--dev requires an existing checkout' "$TEST_ROOT/dev.log"

if WBS_SKIP_DEPENDENCY_INSTALLS=true bash "$TEST_ROOT/latest/bootstrap/install" --skip-clone >"$TEST_ROOT/skip-clone.log" 2>&1; then
  echo "Expected --skip-clone to be rejected."
  exit 1
fi
grep -q 'Unsupported install option: --skip-clone' "$TEST_ROOT/skip-clone.log"

echo "WBS bootstrap selection tests passed"
