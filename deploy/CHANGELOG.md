## 3.0.3 (2024-11-07)


### 🩹 Fixes

- bump wdqs-updater version to 2 as well

## 3.0.2 (2024-10-28)


### 🩹 Fixes

- provide concept uri to wdqs


### 📖 Documentation

- WBS specific usage of WDQS frontend

- **deploy:** fix backup script volume names


### 🏡 Chore

- bump deploy to version 2

## **deploy@3.0.1** (2024-10-09)

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
