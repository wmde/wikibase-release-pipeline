# Test-system

The test systems are located on a CloudVPS machine at `wikibase-product-testing-2022.wikidata-dev.eqiad1.wikimedia.cloud`.

You can find all code for running test test systems in the `/opt/test-systems` directory.
This directory is owned by the `mediawiki` user.
Each test system is a copy of the `example` docker-compose setup, with customized env vars and settings.

Four optional test systems are maintained.
These may or may not be running at any given time, as they are only intended for use during product verification during the release process.
Engineers can start and stop these

NOTE: Federated properties can not be enabled in wmde.9/1.37 releases. So that test system is not currently used / updated.
It can again be enabled in wmde.10/1.38

**Default Wikibase**

- Previous release (internal ports 82**)
  - https://wikibase-product-testing-previous.wmcloud.org (8280 internal)
  - https://wikibase-query-testing-previous.wmcloud.org (8281 internal)
  - https://wikibase-qs-testing-previous.wmcloud.org (8282 internal)
- Latest release (internal ports 83**)
  - https://wikibase-product-testing.wmcloud.org (8380 internal)
  - https://wikibase-query-testing.wmcloud.org (8381 internal)
  - https://wikibase-qs-testing.wmcloud.org (8382 internal)

**Federated Properties**

- Previous release with fed props (internal ports 84**)
  - https://wikibase-product-testing-fedprops-previous.wmcloud.org (8480 internal)
  - https://wikibase-query-testing-fedprops-previous.wmcloud.org (8481 internal)
  - https://wikibase-qs-testing-fedprops-previous.wmcloud.org (8482 internal)
- Latest release with fed props (internal ports 85**)
  - https://wikibase-product-testing-fedprops.wmcloud.org (8580 internal)
  - https://wikibase-query-testing-fedprops.wmcloud.org (8581 internal)
  - https://wikibase-qs-testing-fedprops.wmcloud.org (8582 internal)

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
IMAGE_PREFIX=ghcr.io/wmde/

TEST_SYSTEM=latest
EXAMPLE_HASH=53fd2bfa56085d43b1190371a8ed8c881643f4b8
BUILD_NUMBER=latest

#TEST_SYSTEM=fedprops
#EXAMPLE_HASH=53fd2bfa56085d43b1190371a8ed8c881643f4b8
#BUILD_NUMBER=3303724221

#TEST_SYSTEM=fedprops-previous
#EXAMPLE_HASH=53fd2bfa56085d43b1190371a8ed8c881643f4b8
#BUILD_NUMBER=2971822356

#TEST_SYSTEM=fedprops-previous
#EXAMPLE_HASH=53fd2bfa56085d43b1190371a8ed8c881643f4b8
#BUILD_NUMBER=2971822356

# Calculate some things
PORT_BASE="83"
DOMAIN_SUFFIX=-$TEST_SYSTEM
if [ "$TEST_SYSTEM" == "previous" ];
then
    PORT_BASE="82"
fi
if [ "$TEST_SYSTEM" == "latest" ];
then
    # Do not suffix domains on the latest system
    DOMAIN_SUFFIX=""
    PORT_BASE="83"
fi
if [ "$TEST_SYSTEM" == "fedprops-previous" ];
then
    PORT_BASE="84"
fi
if [ "$TEST_SYSTEM" == "fedprops" ];
then
    PORT_BASE="85"
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
echo "WIKIBASE_IMAGE_NAME=${IMAGE_PREFIX}wikibase:$BUILD_NUMBER" >> ./.env
echo "WDQS_IMAGE_NAME=${IMAGE_PREFIX}wdqs:$BUILD_NUMBER" >> ./.env
echo "WDQS_FRONTEND_IMAGE_NAME=${IMAGE_PREFIX}wdqs-frontend:$BUILD_NUMBER" >> ./.env
echo "ELASTICSEARCH_IMAGE_NAME=${IMAGE_PREFIX}elasticsearch:$BUILD_NUMBER" >> ./.env
echo "WIKIBASE_BUNDLE_IMAGE_NAME=${IMAGE_PREFIX}wikibase-bundle:$BUILD_NUMBER" >> ./.env
echo "QUICKSTATEMENTS_IMAGE_NAME=${IMAGE_PREFIX}quickstatements:$BUILD_NUMBER" >> ./.env
echo "WDQS_PROXY_IMAGE_NAME=${IMAGE_PREFIX}wdqs-proxy:$BUILD_NUMBER" >> ./.env
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
wget https://gist.githubusercontent.com/addshore/760b770427eb81d4d1ee14eb331246ea/raw/e0854a6593ca40afecab69ed1aa437b40cae53ba/extra-localsettings.txt
mv extra-localsettings.txt ./extra.LocalSettings.php
sed -i 's/#- .\/LocalSettings.php:\/var\/www\/html\/LocalSettings.d\/LocalSettings.override.php/- .\/extra.LocalSettings.php:\/var\/www\/html\/LocalSettings.d\/LocalSettings.extra.php/' ./docker-compose.yml

if [[ "$TEST_SYSTEM" == *"fedprop"* ]]; then
  echo "Configuring federated properties"
  wget https://gist.githubusercontent.com/addshore/760b770427eb81d4d1ee14eb331246ea/raw/e0854a6593ca40afecab69ed1aa437b40cae53ba/extra-localsettings-fedprops.txt
  cat extra-localsettings-fedprops.txt >> ./extra.LocalSettings.php
fi
```

To start the test system:

```sh
sudo docker-compose -f docker-compose.yml -f docker-compose.extra.yml up -d
```

TODO in order to keep the LocalSettings.php file between updates of the mediawiki container we want to copy it out, onto disk, and mount it in.
However that is a little dificult right now due to https://phabricator.wikimedia.org/T298632
So Adam will write these docs once that task is merged and resolved.

## Updating

All data is stored in volumes, so the easiest way to update a test system is to turn it off, recreate it using the steps above, just with different intputs, and then run `up` again.
The one thing that needs copying over and mounting in the docker-compose file is the LocalSetting.php file for MediaWiki which on initial setup is created by the wikibase container and stored in the container only.

That would look something like this...

```sh
TEST_SYSTEM=latest
SCRIPT_RUN_DATE=$(date --iso)

cd /opt/test-systems/$TEST_SYSTEM
sudo docker cp ${TEST_SYSTEM}_wikibase_1:/var/www/html/LocalSettings.php /tmp/LocalSettings-${TEST_SYSTEM}-${SCRIPT_RUN_DATE}.php
sudo docker-compose -f docker-compose.yml -f docker-compose.extra.yml down

cd /opt/test-systems
mv ./$TEST_SYSTEM ./${SCRIPT_RUN_DATE}-${TEST_SYSTEM}

# Recreate the system using the script above changing the env vars and copy and pasting it into the terminal

cd /opt/test-systems/$TEST_SYSTEM
sudo docker volume rm ${TEST_SYSTEM}_shared
sudo docker-compose -f docker-compose.yml -f docker-compose.extra.yml up -d
```

You should check that all services are up and running

```sh
sudo docker-compose -f docker-compose.yml -f docker-compose.extra.yml ps
```

**If the query service updater is restarting**, it is likely due to updates not having happened in the past month.

```sh
sudo docker-compose -f docker-compose.yml -f docker-compose.extra.yml stop wdqs-updater
sudo docker-compose -f docker-compose.yml -f docker-compose.extra.yml run --rm wdqs-updater bash

# Within the wdqs-updater shell run the following, with the current date (`20220908000000` in the example line below)
/wdqs/runUpdate.sh -h http://"$WDQS_HOST":"$WDQS_PORT" -- --wikibaseUrl "$WIKIBASE_SCHEME"://"$WIKIBASE_HOST" --conceptUri "$WIKIBASE_SCHEME"://"$WIKIBASE_HOST" --entityNamespaces "120,122" --init --start 20221022000000
# Then exit from the process and the bash shell once you see "Sleeping for 10 secs"

# Restart the service
sudo docker-compose -f docker-compose.yml -f docker-compose.extra.yml start wdqs-updater
```

The service should now be up and running!

## Using images from BuildArtifacts

You load images from tar files that are part of `BuildArtifacts` for any Github run.

Firstly, find the run summary that you want to load, such as https://github.com/wmde/wikibase-release-pipeline/actions/runs/3446873839.

When authenticated using the `gh` CLI tool, you can download `BuildArtifacts` of any run using the run ID.

```sh
gh run download 3446873839 -n BuildArtifacts -R wmde/wikibase-release-pipeline
```

Once downloaded you can load the compressed images and delete the artifacts from disk in a quick loop.

```sh
for file in *.docker.tar.gz; do     sudo docker load -i "$file"; rm "$file"; done
```

You can then follow the "Updating" section of this documentation, using `latest` as the `BUILD_NUMBER` environment variable and setting `IMAGE_PREFIX` to be empty. 

```sh
BUILD_NUMBER="latest"
IMAGE_PREFIX=""
```