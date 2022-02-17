# Test-system

The test systems are located on a CloudVPS machine at `wikibase-product-testing-2022.wikidata-dev.eqiad1.wikimedia.cloud`.

You can find all code for running test test systems in the `/opt/test-systems` directory.
This directory is owned by the `mediawiki` user.
Each test system is a copy of the `example` docker-compose setup, with customized env vars and settings.

Two test systems are maintained, one for the current "latest" major release, and one for the "previous" major release.

- Latest release (internal ports 83**)
  - https://wikibase-product-testing.wmcloud.org (8380 internal)
  - https://wikibase-query-testing.wmcloud.org (8381 internal)
  - https://wikibase-qs-testing.wmcloud.org (8382 internal)
- Previous release (internal ports 82**)
  - https://wikibase-product-testing-previous.wmcloud.org (8280 internal)
  - https://wikibase-query-testing-previous.wmcloud.org (8281 internal)
  - https://wikibase-qs-testing-previous.wmcloud.org (8282 internal)

These proxies are configured in Horizon https://horizon.wikimedia.org/project/proxy/

All of the internal ports need to be opened in the firewall for traffic from the proxies to make it to the docker hosted ports https://horizon.wikimedia.org/project/security_groups/3d459ac5-e78a-4a5e-a5e0-d31176ed3628/

## Initial creation

On an empty machine first you need some dependencies:

- Follow the `docker` install docs at https://docs.docker.com/engine/install/debian/
- Follow the `docker-compose` install docs at https://docs.docker.com/compose/install/

You can create the directory to store the test systems:

```sh
sudo mkdir /opt/test-systems
sudo chown mediawiki:wikidev /opt/test-systems
sudo chmod +775 /opt/test-systems
```

You can create a test system using the parameterized bash code below.
The inputs are:

 - TEST_SYSTEM: The name of the test system to create, should be either "latest" or "previous"
 - EXAMPLE_HASH: Hash of the release pipeline repository to use the docker-compose example from
 - BUILD_NUMBER: Build of images, or tag, to use for images of the test system

Do the following (with the parameters you require)...

```sh
# Inputs for setup
TEST_SYSTEM=latest
EXAMPLE_HASH=b8aa96cb0cd99054631b558535ef1f3a9b8d41b8
BUILD_NUMBER=1824280943

#TEST_SYSTEM=previous
#EXAMPLE_HASH=b8aa96cb0cd99054631b558535ef1f3a9b8d41b8
#BUILD_NUMBER=1853048237

# Calculate some things
PORT_BASE="83"
if [ "$TEST_SYSTEM" == "previous" ];
then
    # Only suffix domains of the "previous" system
    DOMAIN_SUFFIX=-$TEST_SYSTEM
    PORT_BASE="82"
fi

umask 002
mkdir -p /opt/test-systems/$TEST_SYSTEM
cd /opt/test-systems/$TEST_SYSTEM

# Download the repo at the desired version, and extract the example
wget https://github.com/wmde/wikibase-release-pipeline/archive/$EXAMPLE_HASH.zip
unzip $EXAMPLE_HASH.zip
rm $EXAMPLE_HASH.zip
cp -r ./wikibase-release-pipeline-$EXAMPLE_HASH/example/* .
rm -rf ./wikibase-release-pipeline-$EXAMPLE_HASH

# Create a .env file
cp ./template.env ./.env
echo "# Test system customizations" >> ./.env
# Default settings to change
echo "MW_WG_ENABLE_UPLOADS=true" >> ./.env
# Public facing domains
echo "WIKIBASE_HOST=wikibase-product-testing$DOMAIN_SUFFIX.wmflabs.org" >> ./.env
echo "WDQS_FRONTEND_HOST=wikibase-query-testing$DOMAIN_SUFFIX.wmflabs.org" >> ./.env
echo "QUICKSTATEMENTS_HOST=wikibase-qs-testing$DOMAIN_SUFFIX.wmflabs.org" >> ./.env
# Images to use
echo "WIKIBASE_IMAGE_NAME=ghcr.io/wmde/wikibase:$BUILD_NUMBER" >> ./.env
echo "WDQS_IMAGE_NAME=ghcr.io/wmde/wdqs:$BUILD_NUMBER" >> ./.env
echo "WDQS_FRONTEND_IMAGE_NAME=ghcr.io/wmde/wdqs-frontend:$BUILD_NUMBER" >> ./.env
echo "ELASTICSEARCH_IMAGE_NAME=ghcr.io/wmde/elasticsearch:$BUILD_NUMBER" >> ./.env
echo "WIKIBASE_BUNDLE_IMAGE_NAME=ghcr.io/wmde/wikibase-bundle:$BUILD_NUMBER" >> ./.env
echo "QUICKSTATEMENTS_IMAGE_NAME=ghcr.io/wmde/quickstatements:$BUILD_NUMBER" >> ./.env
echo "WDQS_PROXY_IMAGE_NAME=ghcr.io/wmde/wdqs-proxy:$BUILD_NUMBER" >> ./.env
# Ports to expose
echo "WIKIBASE_PORT=${PORT_BASE}80" >> ./.env
echo "WDQS_FRONTEND_PORT=${PORT_BASE}81" >> ./.env
echo "QS_PUBLIC_SCHEME_HOST_AND_PORT=https://wikibase-qs-testing$DOMAIN_SUFFIX.wmcloud.org" >> ./.env
echo "WB_PUBLIC_SCHEME_HOST_AND_PORT=https://wikibase-product-testing$DOMAIN_SUFFIX.wmcloud.org" >> ./.env
echo "QUICKSTATEMENTS_PORT=${PORT_BASE}82" >> ./.env

# Modify the quickstatements WB_PUBLIC_SCHEME_HOST_AND_PORT in the example
# TODO if this works for the test system, push this to the real example...
sed -i 's/WB_PUBLIC_SCHEME_HOST_AND_PORT=http:\/\/${WIKIBASE_HOST}:${WIKIBASE_PORT}/WB_PUBLIC_SCHEME_HOST_AND_PORT=${WB_PUBLIC_SCHEME_HOST_AND_PORT}/' ./docker-compose.extra.yml

# Create an extra LocalSettings.php file to load
wget https://gist.githubusercontent.com/addshore/760b770427eb81d4d1ee14eb331246ea/raw/92a464ca0ee6b2432cc1af9c977166f794c78488/gistfile1.txt
mv gistfile1.txt ./extra.LocalSettings.php
sed -i 's/#- .\/LocalSettings.php:\/var\/www\/html\/LocalSettings.d\/LocalSettings.override.php/- .\/extra.LocalSettings.php:\/var\/www\/html\/LocalSettings.d\/LocalSettings.extra.php/' ./docker-compose.yml
```

To start the test system:

```sh
# Run the thing
sudo docker-compose -f docker-compose.yml -f docker-compose.extra.yml up -d
```

TODO in order to keep the LocalSettings.php file between updates of the mediawiki container we want to copy it out, onto disk, and mount it in.
However that is a little dificult right now due to https://phabricator.wikimedia.org/T298632
So Adam will write these docs once that task is merged and resolved.

## Updating

All data is stored in volumes, so the easiest way to update a test system is to turn it off, recreate it using the steps above, just with different intputs, and then run `up` again.
Writing the docs for this step is also blocked on https://phabricator.wikimedia.org/T298632 so that LocalSetting.php can be taken along for this ride.
So Adam will write these docs once that task is merged and resolved.

Example for workflow run [1157808966](https://github.com/wmde/wikibase-release-pipeline/actions/runs/1157808966).

Remember to run update.php
