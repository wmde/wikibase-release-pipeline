#!/bin/bash
docker build . -t builder && \
 docker run -i \
 -v $(pwd)/artifacts:/app/artifacts \
 -v $(pwd)/git_cache:/app/git_cache \
 -v /var/run/docker.sock:/var/run/docker.sock \
 builder:latest make $1