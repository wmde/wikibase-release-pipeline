#!/bin/bash

curl -fsSL https://raw.githubusercontent.com/wmde/wikibase-release-pipeline/refs/heads/cloud-config-test/deploy/setup/cloud-config.yml -o /tmp/cloud-config.yml
sudo cloud-init single --file /tmp/cloud-config.yml --name runcmd --frequency always
