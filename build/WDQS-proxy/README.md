## wdqs-proxy docker image

Proxy to put infront of the wdqs image enforcing READONLY requests, query timeouts and limits access to blazegraph sparql endpoints.

In order to change how this image is configured just mount over the wdqs.template file.

## Environment variables

Variable                 | Default                      | Description
-------------------------|  ----------------------------| ----------
`PROXY_PASS_HOST`        | "wdqs.svc:9999"              | Where to forward the requests to
`PROXY_MAX_QUERY_MILLIS` | 60000                        | Timeout in milliseconds

### Filesystem layout

File                               | Description
---------------------------------  | ------------------------------------------------------------------------------
`/etc/nginx/conf.d/wdqs.template`  | Template for the nginx config (substituted to `/etc/nginx/conf.d/default.conf` at runtime)
`/etc/nginx/conf.d/default.conf`   | nginx config. To override this you must also use a custom entrypoint to avoid the file being overwritten.

### Development

This image is based directly on the nginx latest image, thus new images are not needed for new releases.

However if the latest image goes through a major version bump that renders our configuration broken we may need to create a new image.
