#!/bin/bash
# Cleans repository of undesired files
set -ex

REPO_DIR=$1

# remove git things from release package
rm "$REPO_DIR"/.git* -rf
