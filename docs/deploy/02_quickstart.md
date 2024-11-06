# Quickstart

> 💡 If you want to run a quick test on a machine that has no public IP address (such as your local machine), check our [FAQ entry](./09_faq.md#can-i-host-wbs-deploy-locally) below.

### Requirements

#### Hardware

- Network connection with a public IP address
- AMD64 architecture
- 8 GB RAM
- 4 GB free disk space

#### Software

- Docker 22.0 (or greater)
- Docker Compose 2.10 (or greater)
- git

#### Domain names

You need three DNS records that resolve to your machine's IP address, one for each user-facing service:

- Wikibase, e.g., "wikibase.example"
- QueryService, e.g., "query.example"
- QuickStatements, e.g., "quickstatements.example"

### Initial setup

#### Download WBS Deploy

Check out the files from Github, move to the subdirectory `deploy` and check out the latest stable branch.

```sh
git clone https://github.com/wmde/wikibase-release-pipeline
cd wikibase-release-pipeline/deploy
git checkout deploy-3
```

#### Initial configuration

Make a copy of the configuration template in the `wikibase-release-pipeline/deploy` directory.

```sh
cp template.env .env
```

Follow the instructions in the comments in your newly created `.env` file to set usernames, passwords and domain names.

#### Starting

Run the following command from within `wikibase-release-pipeline/deploy`:

```sh
docker compose up
```

The first start can take a couple of minutes. Wait for your shell prompt to return.

🎉 Congratulations, your Wikibase Suite instance should now be up and running. Web interfaces are available over HTTPS (port 443) for the domain names you configured for Wikibase, the WDQS front end and Quickstatements.

> 💡 If anything goes wrong, you can run `docker logs <CONTAINER_NAME>` to see some hopefully helpful error messages.

