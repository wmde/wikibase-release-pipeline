## 3.0.1 (2024-10-09)

### 🩹 Fixes

- `*_PUBLIC_HOST` URLs default to `.example` TLD from `example.com` ([T372455](https://phabricator.wikimedia.org/T372455))
- Removes published ports for wikibase, quickstatements, and wdqs-frontend services ([T372455](https://phabricator.wikimedia.org/T372455))
- Wikibase waits for elasticsearch service to be up ([T371162](https://phabricator.wikimedia.org/T371162))

### 📖 Documentation

- Do not use `--wait` in `docker compose up` in order to see logs
- Link to WDQS updater crash FAQ entry
- Corrected typos

### 🏡 Chore

- Adds default Traefik LetsEncrypt configuration for services

## 3.0.0 (2024-07-15)

### 🏡 Chore
- Initial release featuring MediaWiki 1.42.

## 2.0.0 (2024-07-15)

### 🏡 Chore
- Initial release featuring MediaWiki 1.41.

## 1.0.0 (2024-07-15)

### 🏡 Chore
- Initial release featuring MediaWiki 1.39.
