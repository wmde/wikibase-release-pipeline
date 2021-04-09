#!/bin/bash
set -ex

# Enables and configures elasticsearch index
bash /extra-install/ElasticSearch.sh

# Creates an OAuth consumer for quickstatements
bash /extra-install/QuickStatements.sh