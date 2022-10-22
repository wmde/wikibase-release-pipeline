# Test-cases

## Wikibase
- [ ] Create an item using the UI
  - [ ] Add a statement
  - [ ] Add a qualifier
  - [ ] Add a reference
- [ ] Create a property using the UI
  - [ ] add a statement
  - [ ] add a qualifier
  - [ ] add a reference
## Wikibase & WDQS/WDQS-frontend
- [x] Create an item on Wikibase, and verify it can be found on Query Service (including the label etc)
- [x] Delete an item on Wikibase, and verify that the item isn’t there on the query service any more
- [x] Create an item with a statement and verify that querying using prefixes work correctly (wdt:P1 etc.. )

## Wikibase Client & Repo
- [x] Create an item on repo with sitelink to client
- [x] Create an item on repo and verify that client can reference it using wikitext
- [ ] Verify that changes on repo are dispatched to client ( TODO figure out all use-cases )
  - [x] Sitelink created
  - [x] Item delete
  - [ ] TODO ...
- [x] Create an item on repo and verify that client can use it using Lua (Scribunto)

## Scribunto
- [x] Verify Lua module can be executed
- [x] Verify Lua module can be executed within time-limit

## Wikibase Federated properties (using wikidata.org as source wiki)
- [X] Create an item on Wikibase and add a statement using a federated property
  - [X] verify it is available with the correct rdf through the Entity page
  - [X] verify it is available through the WDQS-frontend with the correct prefixes

## Elasticsearch
- [X] Create item with an alias and search by item alias
- [X] Case-insensitive search should work through Wikibase


# Selenium tests

source the `.env` file in the root directory

Please see tests/selenium/README.md file in mediawiki repository.
## Environment

The behavior of the tests can be modified with several environment variables.

* `MW_SERVER`: protocol, host name and port of the MediaWiki installation.
  Defaults to `http://127.0.0.1:8080` (Vagrant).
* `MW_SCRIPT_PATH`: path to `index.php`, `api.php` etc. under `MW_SERVER`.
  Defaults to `/w`.
* `LOG_DIR`: Directory to leave logs and screenshots in.
  Defaults to a `log/` subdirectory of this directory.
* `WIKIBASE_PROPERTY_STRING`, `WIKIBASE_PROPERTY_URL`, etc.:
  Property ID of a property with datatype `string`, `url`, etc. –
  if not set, a new property of this type will be created each time the tests are run.
  (This will fail unless anonymous users are allowed to create properties on the wiki,
  so setting `WIKIBASE_PROPERTY_STRING` correctly is recommended.)

## Write more tests

When working on the browser tests,
you’ll want to consult the documentation of the following libraries we use:

* [WebdriverIO](https://webdriver.io/docs/api) for controlling the browser
  (`browser`, `$`, `waitForVisible`, …)
* [Mocha](https://mochajs.org/) as the general testing framework
  (`describe`, `it`, `before`, …)
* [`assert`](https://nodejs.org/api/assert.html) for simple assertions
  (`ok`, `strictEqual`, …)
