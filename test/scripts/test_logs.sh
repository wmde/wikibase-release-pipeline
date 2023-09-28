#!/usr/bin/env bash
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

for suite in test/suites/*; do
    if ! [[ -d $suite ]]; then continue; fi

    suite_name=$(basename "$suite")

    echo "************************************************************************"
    echo "* $suite"
    echo "************************************************************************"

    echo
    echo "** mw.debug.log ********************************************************"
    cat "${suite}/results/mw.debug.log" || true
    echo
    echo "** ${suite_name}.log ********************************************************"
    cat "${suite}/results/${suite_name}.log" || true

    echo
    echo "** result.json *********************************************************"
    cat "${suite}/results/result.json" || true

    echo
    echo
done
