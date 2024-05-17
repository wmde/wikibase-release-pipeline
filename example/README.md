# Wikibase Suite

The provided files are for configuring and deploying Wikibase Suite using Docker containers. Wikibase is an extension for MediaWiki that enables the creation and management of structured data, similar to Wikidata. In addition to this configuration of MediaWiki, Wikibase suite includes the Wikidata Query Service (WDQS), QuickStatements, Elasticsearch, and a reverse proxy with SSL services. The configuration is managed through Docker Compose and environment variables.

**Starting Wikibase Suite:**

1. Ensure the system meets minimum requirements:

    - AMD64 architecture
    - 8 GB RAM
    - 4 GB free disk space
    - Docker 22.0, or greater
    - Docker Compose 2.10, or greater

2. Copy the configuration template: `cp template.env .env`.
3. Open `.env` file and set configuration values according to instructions in the comments.
4. Start Wikibase Suite: `docker compose up --wait`.

**Stopping Wikibase Suite:**

- To stop Wikibase Suite, use `docker compose down`.

**Resetting Wikibase Suite Configuration:**

Most values set in `.env` are copied statically into the respective containers after the first time you run `docker compose up --wait`.

To reset the configuration and keep existing data:

1. Make any needed changes to the MediaWiki setup values in the `.env` file copied from `template.env` above. NOTE: Do not change `DB_*` values unless you are also re-creating the database (see "Removing Wikibase Suite Completely" below).
2. Delete `LocalSettings.php` from within the Docker volume `wikibase-config`, or delete the entire volume.
3. Restart Wikibase Suite: `docker compose down && docker compose up --wait`.

**Updating Wikibase Suite with Patch Releases:**

- Patch releases are applied automatically when recreating Docker containers: `docker compose down && docker compose up --wait`.

**Upgrading to New Major Releases of Wikibase Suite:**

- Major releases may require additional steps. Refer to specific upgrade instructions in the Migration Guide section of README.md.

**Removing Wikibase Suite Completely:**

To reset the configuration and data, and remove the Wikibase Suite Docker containers. *This will destroy all data, make sure to backup anything you wish to retain*:

`docker compose down --volumes`

## Migration Guide

**MediaWiki 1.39 to MediaWiki 1.40:**

- Details on migration steps from MediaWiki version 1.39 to 1.40 are outlined here. Ensure to follow the provided instructions carefully to ensure a smooth transition and compatibility with Wikibase Suite.

**MediaWiki 1.40 to MediaWiki 1.41:**

- Information on migrating from MediaWiki version 1.40 to 1.41 is provided in this section. Any specific upgrade notes or considerations are highlighted to assist in the upgrade process.

[Note: Replace placeholders with actual migration steps and considerations specific to each version upgrade.]

**From an existing MediaWiki installation to Wikibase Suite**

It is possible to migrate an existing MediaWiki installation to the Wikibase Suite Docker images. The process may require some manual configuration and adjustment to match the setup provided by the suite.

## FAQ

**Can I host Wikibase Suite locally?**

Yes, Wikibase Suite can be hosted locally for testing purposes. However, due to OAuth requirements, QuickStatements may not function properly without a publicly accessible domain names for both the `WIKIBASE_PUBLIC_HOST` and `QUICKSTATEMENTS_PUBLIC_HOST`. Running locally without publicly accessible addresses will also not generate a valid SSL certificate so accessing services will require allowing the invalid certificate on first load.

**Do you have any recommended Internet host / VPS provider recommendations?**

At this time, there are no specific recommendations for Internet hosts or VPS providers for hosting Wikibase Suite. The suite has been tested on various providers, and as long as the minimum technical requirements are met, it should run as expected.
