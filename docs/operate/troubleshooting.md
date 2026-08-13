# Troubleshooting

Before troubleshooting Wikibase Suite (WBS), [log in to your server and change to your WBS directory](../README.md#access-your-wbs-server).

## Wikibase or other services don't start or show as "unhealthy" or "restarting"

Check the current status of the WBS services:

```sh
docker compose ps
```

If a service does not start, or if the status shows `unhealthy` or `restarting`, check the logs for that service. For example, run the following command to see the Wikibase startup logs:

```sh
docker compose logs wikibase
```

If the problem was caused by incorrect `.env` values, fix the values and then follow [Resetting an Instance](./reset.md) before starting again.

## Browser shows "This site can't be reached" or opens a different site

If your browser cannot find your WBS domain names, or if a domain name opens a parking page or another website, the DNS records may not point to your server yet.

Check the domain names in your `.env` file:

```sh
cat .env
```

Look for the `WIKIBASE_PUBLIC_HOST` and `WDQS_PUBLIC_HOST` values.

Then check whether each domain name resolves to your server's public IP address. Replace the example domain names below with the actual `WIKIBASE_PUBLIC_HOST` and `WDQS_PUBLIC_HOST` values from your `.env` file:

```sh
getent hosts yourdomain.example
getent hosts query.yourdomain.example
```

If the command prints no IP address, or if the returned IP address is different from your server's public IP address, update the DNS records with your DNS provider. DNS changes can also take time to become visible everywhere, so a recently changed record may need more time before WBS is reachable.

If the domain names point to your server but the browser still cannot reach WBS, check that ports `80` and `443` are reachable from the internet. You may need to update your server firewall, cloud provider firewall, or security group settings.

> [!NOTE]
> WBS uses Traefik to route web requests and request HTTPS certificates from Let's Encrypt. Let's Encrypt must be able to reach the Traefik service on port `80` using the same domain names that are configured in `.env`.

You can also check the Traefik logs:

```sh
docker compose logs traefik
```

## Browser shows "Your connection is not private" or "This connection is not private"

If your browser shows warnings when you open WBS, the HTTPS certificate may not have been issued yet.

Check the Traefik logs:

```sh
docker compose logs traefik
```

Look for Let's Encrypt errors such as `rateLimited`, `too many certificates already issued`, `too many failed authorizations recently`, or `retry after`.

> [!NOTE]
> WBS uses Traefik to route web requests and request HTTPS certificates from Let's Encrypt. Traefik stores certificate data in the `traefik-letsencrypt-data` Docker volume.

This can happen if the `traefik-letsencrypt-data` volume was removed repeatedly while resetting or reinstalling WBS. Keep this volume unless you are intentionally removing the instance.

If Let's Encrypt has rate-limited certificate requests, wait until the latest `retry after` time reported in the Traefik logs. At the time of writing, Let's Encrypt allows up to five certificates for the exact same set of domain names in seven days, with capacity for one certificate restoring every 34 hours. Failed validation attempts use a different limit and usually recover more quickly. See the [Let's Encrypt rate limits documentation](https://letsencrypt.org/docs/rate-limits/#new-certificates-per-exact-set-of-identifiers) for the current limits and retry behavior.

After the reported retry time has passed, restart Traefik so that it attempts certificate issuance again:

```sh
docker compose restart traefik
```

Then check the new certificate request in the logs:

```sh
docker compose logs --since=2m traefik |
  grep -Ei 'acme|certificate|letsencrypt|rate|error'
```

If the logs report another `retry after` time, wait until that time before restarting Traefik again. Repeated restarts do not bypass a Let's Encrypt rate limit.
