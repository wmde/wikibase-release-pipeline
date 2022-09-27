#!/bin/bash
# run `docker logs` for all containers
# Used in CI for outputing all logs when a run has failed
set -e

for container in $(docker ps --all | awk '{if(NR>1) print $NF}')
do
  echo "Container: $container"
  docker logs "$container"
done