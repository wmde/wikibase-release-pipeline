#!/usr/bin/env bash

set -eu

test -f /run/wbs-ready
curl --silent --fail http://localhost/wiki/Main_Page > /dev/null
