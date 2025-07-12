#!/bin/bash

curl -fsSL https://raw.githubusercontent.com/wmde/wikibase-release-pipeline/refs/heads/cloud-config-test/deploy/setup/cloud-init.yml -o /tmp/cloud-init.yml
# sudo cloud-init single --file /tmp/cloud-init.yml --name runcmd --frequency always
sudo cloud-init modules --mode=final --file /tmp/cloud-init.yml
