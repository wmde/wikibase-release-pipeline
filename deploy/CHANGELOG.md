## **deploy@3.1.0** (2024-10-04)

### 🚀 Features

- Updates documentation
- Adds default Traefik LetsEncrypt configuration for services

### 🩹 Fixes

- `*_PUBLIC_HOST` URLs default to `.example` TLD from `example.com` ([T372455](https://phabricator.wikimedia.org/T372455))
- Removes published ports for wikibase, quickstatements, and wdqs-frontend services ([T372455](https://phabricator.wikimedia.org/T372455))
- Wikibase waits for elasticsearch service to be up ([T371162](https://phabricator.wikimedia.org/T371162))
