#!/bin/bash
docker build . -t builder && \
 docker run -it \
 -v $(pwd)/artifacts:/artifacts \
 -v $(pwd)/git_cache:/app/git_cache \
 -v /var/run/docker.sock:/var/run/docker.sock \
 builder:latest make $1