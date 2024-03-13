# Test-system

The test systems are located on a CloudVPS machine at `wikibase-product-testing-2022.wikidata-dev.eqiad1.wikimedia.cloud`.

You can find all code for running test test systems in the `/opt/test-systems` directory.
This directory is owned by the `mediawiki` user.
Each test system is a copy of the `example` docker compose setup, with customized env vars and settings.

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

You can create a test system using the `prepare-docker-compose-config` script from https://github.com/wmde/wikibase-suite-test-system-tools which generates the necessary docker compose configuration using parametrized input. 
The input paremeters are:

 - IMAGE_PREFIX: Prefix of images to use. Use an empty string to use locally loaded images.
 - TEST_SYSTEM: The name of the test system to create, should be either "latest" or "previous"
 - EXAMPLE_HASH: Hash of the release pipeline repository to use the docker compose example from
 - BUILD_NUMBER: Build of images, or tag, to use for images of the test system

For example:

```sh
export IMAGE_PREFIX=ghcr.io/wmde/
export TEST_SYSTEM=latest
export EXAMPLE_HASH=53fd2bfa56085d43b1190371a8ed8c881643f4b8
export BUILD_NUMBER=latest

../prepare-docker-compose-config.sh
```

To start the test system:

```sh
sudo docker compose -f docker-compose.yml -f docker-compose.extra.yml up -d
```

TODO in order to keep the LocalSettings.php file between updates of the mediawiki container we want to copy it out, onto disk, and mount it in.
However that is a little dificult right now due to https://phabricator.wikimedia.org/T298632
So Adam will write these docs once that task is merged and resolved.

## Updating

All data is stored in volumes, so the easiest way to update a test system is to turn it off, recreate it using the steps above, just with different intputs, and then run `up` again.
The one thing that needs copying over and mounting in the docker compose file is the LocalSetting.php file for MediaWiki which on initial setup is created by the wikibase container and stored in the container only.

That would look something like this...

```sh
TEST_SYSTEM=latest
SCRIPT_RUN_DATE=$(date --iso)

cd /opt/test-systems/$TEST_SYSTEM
sudo docker cp ${TEST_SYSTEM}-wikibase-1:/var/www/html/LocalSettings.php /tmp/LocalSettings-${TEST_SYSTEM}-${SCRIPT_RUN_DATE}.php
sudo docker compose -f docker-compose.yml -f docker-compose.extra.yml down

cd /opt/test-systems
mv ./$TEST_SYSTEM ./${SCRIPT_RUN_DATE}-${TEST_SYSTEM}

# Recreate the system using the script above changing the env vars and copy and pasting it into the terminal

cd /opt/test-systems/$TEST_SYSTEM
sudo docker volume rm ${TEST_SYSTEM}_shared
sudo docker compose -f docker-compose.yml -f docker-compose.extra.yml up -d
```

You should check that all services are up and running

```sh
sudo docker compose -f docker-compose.yml -f docker-compose.extra.yml ps
```

**If the query service updater is restarting**, it is likely due to updates not having happened in the past month.

```sh
sudo docker compose -f docker-compose.yml -f docker-compose.extra.yml stop wdqs-updater
sudo docker compose -f docker-compose.yml -f docker-compose.extra.yml run --rm wdqs-updater bash

# Within the wdqs-updater shell run the following, with the current date (`20220908000000` in the example line below)
/wdqs/runUpdate.sh -h http://"$WDQS_HOST":"$WDQS_PORT" -- --wikibaseUrl "$WIKIBASE_SCHEME"://"$WIKIBASE_HOST" --conceptUri "$WIKIBASE_SCHEME"://"$WIKIBASE_HOST" --entityNamespaces "120,122" --init --start 20221022000000
# Then exit from the process and the bash shell once you see "Sleeping for 10 secs"

# Restart the service
sudo docker compose -f docker-compose.yml -f docker-compose.extra.yml start wdqs-updater
```

The service should now be up and running!
