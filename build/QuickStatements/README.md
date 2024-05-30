# QuickStatements

[QuickStatements](https://github.com/magnusmanske/quickstatements) is a tool to batch-edit [Wikibase](https://www.mediawiki.org/wiki/Wikibase).

> 💡 This image is part of Wikibase Suite (WBS). The [WBS Deployment Toolkit](https://github.com/wmde/wikibase-release-pipeline/example/README.md) provides everything including QuickStatements you need to self-host a Wikibase instance out of the box.

## Requirements

- a Wikibase instance with
  [OAuth](https://www.mediawiki.org/wiki/Extension:OAuth) enabled
- DNS resolution for QuickStatements and Wikibase
- configuration via environment variables

### Wikibase instance

We suggest to use the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wikibase). 
Follow the setup instructions over there to get it up and running.

### DNS resolution

In order to authorize QuickStatements against Wikibase via OAuth, this
container must be available on an address on the host machine that is also
visible within the Docker network. Set `QUICKSTATEMENTS_PUBLIC_URL` to this
address.

Likewise, Wikibase needs to be able to access QuickStatements for the OAuth
callback on a host-recognizable address, set using `WIKIBASE_PUBLIC_URL`.

Note that Docker Engine doesn't provide such addresses, so you will likely need
to set up a reverse proxy (such as nginx or traefik) alongside either public
DNS entries or a local DNS server using entries that route to these container.
See the [`docker-compose.yml` of the WBS Deployment Toolkit](https://github.com/wmde/wikibase-release-pipeline/example/docker-compose.yml) 
for more guidance on how to set that up.

### Environment variables

Variables in **bold** are required.

| Variable                         | Default    | Description                                                               |
| -------------------------------- | ---------- | ------------------------------------------------------------------------- |
| **`WIKIBASE_PUBLIC_URL`**        | undefined  | Host and port of Wikibase as seen by the user's browser (required)        |
| **`QUICKSTATEMENTS_PUBLIC_URL`** | undefined  | Host and port of QuickStatements as seen by the user's browser (required) |
| `OAUTH_CONSUMER_KEY`             | undefined  | OAuth consumer key (obtained from Wikibase)                               |
| `OAUTH_CONSUMER_SECRET`          | undefined  | OAuth consumer secret (obtained from wikibase)                            |
| `PHP_TIMEZONE`                   | "UTC"      | setting of php.ini date.timezone                                          |
| `MW_WG_LANGUAGE_CODE`            | "en"       | Site language                                                             |
| `MW_WG_SITENAME`                 | "wikibase" | Site name                                                                 |
| `WB_PROPERTY_NAMESPACE`          | undefined  | Wikibase Property namespace                                               |
| `WB_ITEM_NAMESPACE`              | undefined  | Wikibase Item namespace                                                   |
| `WB_PROPERTY_PREFIX`             | undefined  | Wikibase Property prefix                                                  |
| `WB_ITEM_PREFIX`                 | undefined  | Wikibase Item prefix                                                      |

## Set up QuickStatements

You can pass the consumer and secret token you got from your Wikibase instance
to this container using the environment variables `OAUTH_CONSUMER_KEY` and
`OAUTH_CONSUMER_SECRET`. Alternatively you can let the [default-extra-install
script](../Wikibase/default-extra-install.sh) supplied in the Wikibase bundle
handle this for you.

Test whether it works by navigating to `QUICKSTATEMENTS_PUBLIC_URL` and logging
in.

You should be redirected to the wiki, where you can authorize this
QuickStatements to act on your behalf.

Finally you should be redirected back to QuickStatements, and you should see
yourself logged in.

Use QuickStatements as you normally would, using the Run button. The "Run in
background" option is not supported by this image.

#### Troubleshooting

If you see an error such as `mw-oauth exception` when trying to log in, check
that you have passed the correct consumer token and secret token to
QuickStatements.

If you have changed the value of $wgSecretKey $wgOAuthSecretKey since you made
the consumer, you'll need to make another new consumer or reissue the secret
token for the old one.

### Internal filesystem layout

Hooking into the internal filesystem can be used to extend the functionality of this image.

| Directory                                   | Description                    |
| ------------------------------------------- | ------------------------------ |
| `/var/www/html/quickstatements`             | Base QuickStatements directory |
| `/var/www/html/quickstatements/public_html` | The Apache root folder         |
| `/var/www/html/magnustools`                 | Base magnustools directory     |

| File                     | Description                                                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/templates/config.json` | Template for QuickStatements' config.json (substituted to `/var/www/html/quickstatements/public_html/config.json` at runtime)             |
| `/templates/oauth.ini`   | Template for QuickStatements' oauth.ini (substituted to `/var/www/html/quickstatements/oauth.ini` at runtime)                             |
| `/templates/php.ini`     | php config (default provided sets date.timezone to prevent php complaining substituted to `/usr/local/etc/php/conf.d/php.ini` at runtime) |

## Source

This image is built from [this Dockerfile](https://github.com/wmde/wikibase-release-pipeline/blob/main/build/QuickStatements/Dockerfile).

## Authors

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).
