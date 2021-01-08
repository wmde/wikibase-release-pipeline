# Caching

## Git cache

In order to reduce the time spent on fetching git repositories there is a `git_cache` folder included in the repository that will get populated by the `update_cache.sh` script file.

## Refreshing the docker cache

use the `DOCKER_CACHE_VERSION` env variable in the github workflow to refresh the docker cache.
