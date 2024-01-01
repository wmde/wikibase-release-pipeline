# Quickstatements docker image

Quickstatements as seen at [https://github.com/magnusmanske/quickstatements](https://github.com/magnusmanske/quickstatements)

### Environment variables

Variable                             | Default                  | Description
-------------------------------------|--------------------------|------------
`WB_PUBLIC_SCHEME_HOST_AND_PORT`     | NONE                     | Host and port of Wikibase as seen by the user's browser
`QS_PUBLIC_SCHEME_HOST_AND_PORT`     | NONE                     | Host and port of Quick Statements as seen by the user's browser
`OAUTH_CONSUMER_KEY`                 | NONE                     | OAuth consumer key (obtained from Wikibase)
`OAUTH_CONSUMER_SECRET`              | NONE                     | OAuth consumer secret (obtained from wikibase)
`PHP_TIMEZONE`                       | UTC                      | setting of php.ini date.timezone
`MW_SITE_LANG`                       | "en"                     | Site language
`MW_SITE_NAME`                       | "wikibase-docker"        | Site name
`WB_PROPERTY_NAMESPACE`              | NONE                     | Wikibase Property namespace
`WB_ITEM_NAMESPACE`                  | NONE                     | Wikibase Item namespace
`WB_PROPERTY_PREFIX`                 | NONE                     | Wikibase Property prefix
`WB_ITEM_PREFIX`                     | NONE                     | Wikibase Item prefix

### Filesystem layout

Directory                                   | Description                                                                   
--------------------------------------------|-------------------------------------------------------------------------------
`/var/www/html/quickstatements`             | Base quickstatements directory                                                
`/var/www/html/quickstatements/public_html` | The Apache Root folder                                                        
`/var/www/html/magnustools`                 | Base magnustools directory                                                    

File                      | Description                                                                                                                              
------------------------- | ------------------------------------------------------------------------------                                                           
`/templates/config.json`  | Template for Quickstatements' config.json (substituted to `/var/www/html/quickstatements/public_html/config.json` at runtime)            
`/templates/oauth.ini`    | Template for Quickstatements' oauth.ini (substituted to `/var/www/html/quickstatements/oauth.ini` at runtime)                            
`/templates/php.ini`      | php config (default provided sets date.timezone to prevent php complaining substituted to `/usr/local/etc/php/conf.d/php.ini` at runtime)


### Set up Quickstatements
Due to requirements of the process of authorizing Quickstatments against Wikibase via OAuth this container must be available on an address on the host machine which can also be seen within the Docker network. Set `QS_PUBLIC_SCHEME_HOST_AND_PORT` to this address. 

Likewise, Wikibase needs to be able to access Quickstatements for the OAuth callback on a host recognizable address which is set on `WB_PUBLIC_SCHEME_HOST_AND_PORT`. 

Note that Docker Engine doesn't provide such addresses so setting-up a reverse proxy such as nginx or haproxy (et al), alongside either public DNS entry or a local DNS server with entries that route to these container. See the Wikibase Suite example configuration for a working configuration which uses a provided localhost route "wikibase" and "quickstatements" subdomain for local testing.

You can pass the consumer and secret token you got from the wikibase to this container as the environment variables
 `OAUTH_CONSUMER_KEY` and `OAUTH_CONSUMER_SECRET`. If you don't, there are [extra-install scripts](../WikibaseBundle/extra-install/QuickStatements.sh) supplied in the Wikibase bundle that can automatically handle this.

You can now test that it works by navigating to `QS_PUBLIC_SCHEME_HOST_AND_PORT` and logging in.

You should be redirected to the wiki where you can authorize this Quickstatements to act on your behalf.

Finally you should be redirected back to Quickstatements and you should appear logged in.

Use Quickstatements as normal with the Run button. Currently "Run in background" is not supported by this image.

#### Troubleshooting
If you see an error such as mw-oauth exception when trying to log in check that you have passed the right consumer token
and secret token to quickstatements.

If you have changed the value of $wgSecretKey $wgOAuthSecretKey since you made the consumer you'll need to make another new consumer or
reissue the secret token for the old one.
