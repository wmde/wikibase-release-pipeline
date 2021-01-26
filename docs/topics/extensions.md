# Extensions

## OAuth

### Creating an OAuth consumer

To create an OAuth consumer
```
# set these environment variables
MW_ADMIN_NAME=WikibaseDockerAdmin 
QS_PUBLIC_SCHEME_HOST_AND_PORT=http://wdqs.svc:9999


# execute this inside the container
php /var/www/html/extensions/OAuth/maintenance/createOAuthConsumer.php \
    --approve \
    --callbackUrl $QS_PUBLIC_SCHEME_HOST_AND_PORT/api.php \
    --callbackIsPrefix true \
    --user $MW_ADMIN_NAME \
    --name QuickStatements \
    --description QuickStatements \
    --version 1.0.1 \
    --grants createeditmovepage \
    --grants editpage \
    --grants highvolume \
    --jsonOnSuccess

# or execute it from outside
docker exec -it wikibase <COMMAND>
```

A successful response should return with `"created": true` flag set.

```
{"created":true,"id":1,"name":"QuickStatements","key":"30e532f04e1bdf63ac281fcbc819170c","secret":"f60f31ad4196af40bb0598e1d4d3435a3515604e","approved":1}
```

## QuickStatements

### Configure OAuth

Replace the <OAUTH_CONSUMER_KEY> and <OAUTH_CONSUMER_SECRET> with the key and secret that was generated when [Creating an OAuth consumer](#creating-an-oauth-consumer). 

Create the following file and place it at `/quickstatements/data/oauth.ini` in the wikibase container.

```
; HTTP User-Agent header
agent = 'Wikibase Docker QuickStatements'
; assigned by Special:OAuthConsumerRegistration (request modelled after https://www.wikidata.org/wiki/Special:OAuthListConsumers/view/77b4ae5506dd7dbb0bb07f80e3ae3ca9)
consumerKey = '<OAUTH_CONSUMER_KEY>'
consumerSecret = '<OAUTH_CONSUMER_SECRET>'
```


