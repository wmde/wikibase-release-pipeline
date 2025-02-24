## 1.0.2 (2025-02-24)

### 🩹 Fixes

- Remove generated php.ini from deploy-lts config

### 📖 Documentation

- update docs to mention version tags

## 1.0.1 (2025-01-21)


### 🩹 Fixes

- Set traefik restart policy to 'unless-stopped'
- Bump WDQS-Updater version to 2
- Provide Concept URI to WDQS
- `*_PUBLIC_HOST` URLs default to `.example` TLD from `example.com`
- Removes extra published ports for wikibase, quickstatements, and wdqs-frontend services
- Wikibase waits for Elasticsearch service to be up

### 📖 Documentation

- Do not use `--wait` in `docker compose up` in order to see logs
- Link to WDQS updater crash FAQ entry
- Fix to image updating section
- Fix backup script volume names
- Fix link to WDQS readme
- Clarify running locally without DNS
- Add some notes about WDQS-frontend
- Corrected typos

### 🏡 Chore

- Add default Traefik LetsEncrypt configuration for services
