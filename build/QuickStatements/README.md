# QuickStatements docker image

QuickStatements as seen at [https://github.com/magnusmanske/quickstatements](https://github.com/magnusmanske/quickstatements)

### Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `WIKIBASE_PUBLIC_URL` | NONE | Host and port of Wikibase as seen by the user's browser (required) |
| `QUICKSTATEMENTS_PUBLIC_URL` | NONE | Host and port of QuickStatements as seen by the user's browser (required) |
| `OAUTH_CONSUMER_KEY` | NONE | OAuth consumer key (obtained from Wikibase) |
| `OAUTH_CONSUMER_SECRET` | NONE | OAuth consumer secret (obtained from wikibase) |
| `PHP_TIMEZONE` | UTC | setting of php.ini date.timezone |
| `MW_WG_LANGUAGE_CODE` | "en" | Site language |
| `MW_WG_SITENAME` | "wikibase-docker" | Site name |
| `WB_PROPERTY_NAMESPACE` | NONE | Wikibase Property namespace |
| `WB_ITEM_NAMESPACE` | NONE | Wikibase Item namespace |
| `WB_PROPERTY_PREFIX` | NONE | Wikibase Property prefix |
| `WB_ITEM_PREFIX` | NONE | Wikibase Item prefix |

### Filesystem layout

| Directory                                   | Description                    |
| ------------------------------------------- | ------------------------------ |
| `/var/www/html/quickstatements`             | Base QuickStatements directory |
| `/var/www/html/quickstatements/public_html` | The Apache root folder         |
| `/var/www/html/magnustools`                 | Base magnustools directory     |

| File | Description |
| --- | --- |
| `/templates/config.json` | Template for QuickStatements' config.json (substituted to `/var/www/html/quickstatements/public_html/config.json` at runtime) |
| `/templates/oauth.ini` | Template for QuickStatements' oauth.ini (substituted to `/var/www/html/quickstatements/oauth.ini` at runtime) |
| `/templates/php.ini` | php config (default provided sets date.timezone to prevent php complaining substituted to `/usr/local/etc/php/conf.d/php.ini` at runtime) |

### Set up QuickStatements

In order to authorize QuickStatements against Wikibase via OAuth, this container must be available on an address on the host machine that is also visible within the Docker network. Set `QUICKSTATEMENTS_PUBLIC_URL` to this address.

Likewise, Wikibase needs to be able to access QuickStatements for the OAuth callback on a host-recognizable address, set using `WIKIBASE_PUBLIC_URL`.

Note that Docker Engine doesn't provide such addresses, so you will likely need to set up a reverse proxy (such as nginx or haproxy) alongside either public DNS entries or a local DNS server using entries that route to these container. See the Wikibase Suite Deployment Kit for more guidance on how to set that up.

You can pass the consumer and secret token you got from your Wikibase instance to this container using the environment variables `OAUTH_CONSUMER_KEY` and `OAUTH_CONSUMER_SECRET`. Alternatively you can let the [default-extra-install script](../Wikibase/default-extra-install.sh) supplied in the Wikibase bundle handle this for you.

Test whether it works by navigating to `QUICKSTATEMENTS_PUBLIC_URL` and logging in.

You should be redirected to the wiki, where you can authorize this QuickStatements to act on your behalf.

Finally you should be redirected back to QuickStatements, and you should see yourself logged in.

Use QuickStatements as you normally would, using the Run button. The "Run in background" option is not supported by this image.

#### Troubleshooting

If you see an error such as `mw-oauth exception` when trying to log in, check that you have passed the correct consumer token and secret token to QuickStatements.

If you have changed the value of $wgSecretKey $wgOAuthSecretKey since you made the consumer, you'll need to make another new consumer or reissue the secret token for the old one.
