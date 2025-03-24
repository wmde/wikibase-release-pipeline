## 4.0.1 (2025-03-21)


### 🏡 Chore

- allow traefik updates within 3.x.x

# 4.0.0 (2025-03-20)

### 🚀 Features

- ⚠️ wikibase:4, based on MediaWiki 1.43
- ⚠️ wdqs-frontend:2, support user config
- ⚠️ Serve QuickStatements from subdirectory
- ⚠️ Update SPARQL endpoint URL
- User defined MediaWiki extensions

### 📖 Documentation

- Describe new features
- Clarifications

### 🏡 Chore

- ⚠️ Remove wdqs-proxy

#### ⚠️ Breaking Changes

- ⚠️ wikibase:4, based on MediaWiki 1.43
- ⚠️ wdqs-frontend:2, support user config
- ⚠️ Serve QuickStatements from subdirectory
- ⚠️ Remove wdqs-proxy
- ⚠️ Update SPARQL endpoint URL

## 3.0.4 (2025-02-24)

### 🩹 Fixes

- set traefik restart policy to 'unless-stopped'

### 📖 Documentation

- fix updating images section

- update docs to mention version tags

## 3.0.3 (2024-11-07)

### 🩹 Fixes

- Bump WDQS-Updater version to 2

## 3.0.2 (2024-10-28)

### 🩹 Fixes

- Provide Concept URI to WDQS

### 📖 Documentation

- Add some notes about WDQS-frontend

- Fix backup script volume names

## 3.0.1 (2024-10-09)

### 🩹 Fixes

- `*_PUBLIC_HOST` URLs default to `.example` TLD from `example.com` ([T372455](https://phabricator.wikimedia.org/T372455))
- Removes extra published ports for wikibase, quickstatements, and wdqs-frontend services ([T372455](https://phabricator.wikimedia.org/T372455))
- Wikibase waits for Elasticsearch service to be up ([T371162](https://phabricator.wikimedia.org/T371162))

### 📖 Documentation

- Do not use `--wait` in `docker compose up` in order to see logs
- Link to WDQS updater crash FAQ entry
- Corrected typos

### 🏡 Chore

- Adds default Traefik LetsEncrypt configuration for services
