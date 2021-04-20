# Quickstatements docker image

Quickstatements as seen at [https://github.com/magnusmanske/quickstatements](https://github.com/magnusmanske/quickstatements)

### Environment variables

Variable                             | Default                  | Description
-------------------------------------|--------------------------|------------
`WIKIBASE_SCHEME_AND_HOST`           | NONE                     | Host and port of Wikibase instance as seen by Quick Statements
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


### Set up quickstatements
In order for quickstatements to communicate with wikibase it needs to know where your instance is and how it can find it.
This must be done by setting the ENV variable `WIKIBASE_SCHEME_AND_HOST`. n.b. This should reflect how this container when running
sees the wikibase container. For example the example docker container alias like `wikibase.svc`.

The user's browser will also be redirected to the Wikibase instance and finally back to quickstatements. The address
the user sees for the Wikibase may be different from how the running container sees it. For example: it may be running
on localhost on a specific port. e.g. http://localhost:8181. This should be passed to the quickstatements container as
`WB_PUBLIC_SCHEME_HOST_AND_PORT`.

One must also know how this container will be visible to the user as well so it can ask the wikibase to redirect the
user back here. This should be passed as `QS_PUBLIC_SCHEME_HOST_AND_PORT`.

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
