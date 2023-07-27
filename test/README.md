# Notes on `test` directory clean-up

## WIP

* `scripts/before_all.sh`: A test clean-up hook which runs before any test run (i.e. not before each suite in a `make test-all`. See Makefile.)

* `/test/scripts`: Move all `test/*.sh` files into this directory, making necessary changes to the `Makefile` and paths within each of those scripts.  This is one step in a larger effort to reduce the clutter in our `test` directory such that its more apparent where the actual tests/specs are._

* Refactor away the need for the blank `test/docker-compose.root.yml` currently at `test/test_suite.sh#54` ...

## Additional proposals

* Move everything from `Docker/test/selenium` here. Possibly flatten the test suites in `Docker/test/selenium/specs` to be top level (e.g. `test/repo`, etc). Also consider moving spec-related data and pages directly into the related spec directory (e.g. things in `Docker/test/selenium/data` & `pages`).

* Consolidating `test/config`, `test/suite_config`, and `test/upgrade` all under `test/config`

* Move `test/eporter` to `test/config/reporter`

* Move `test/log` to `test/log/?something?` and `test/mwlog` to `test/log/mwlog`

* Rename `test/default.env` to `test/test.env`

* Address strange naming of selenium screenshot directories in `log/selenium`, consider renaming that simply to `log/screenshots` or similar.
