# Wikibase Suite user-defined MediaWiki extensions

This directory is for additional MediaWiki or Wikibase extensions. To load an additional extension:

1. Put the extension in this directory.
2. Load the extension in `config/Extensions.php`.
3. Restart Wikibase so MediaWiki can update itself.

## Download an extension

Download additional MediaWiki extensions from the [MediaWiki Extension Distributor](https://www.mediawiki.org/wiki/Special:ExtensionDistributor). Select the MediaWiki version used by your Wikibase Suite release. You can find the installed MediaWiki version at `https://<WIKIBASE_PUBLIC_HOST>/wiki/Special:Version`.

From the Wikibase Suite directory, unpack the downloaded extension into `config/extensions`:

```sh
tar -xzf MyExtension.tar.gz -C config/extensions
```

Verify that `config/extensions/MyExtension` exists and contains an `extension.json` file.

## Load the extension

Follow the extension's installation instructions. In many cases, loading it only requires adding the following line to `config/Extensions.php`:

```php
wfLoadExtension( 'extensions/MyExtension' );
```

Then restart the Wikibase service:

```sh
docker compose restart wikibase
```

> [!NOTE]
> Some extensions instruct you to run `update.php` during installation. The Wikibase image runs `update.php` during startup, so you do not need to run it manually.

## Verify the extension

Visit `https://<WIKIBASE_PUBLIC_HOST>/wiki/Special:Version` and confirm that the extension appears in the list of installed extensions.

## Update extensions

You are responsible for updating extensions installed manually. Updates can contain security fixes and may be required when a Wikibase Suite major upgrade changes the MediaWiki version.

For more information, see the [MediaWiki extension manual](https://www.mediawiki.org/wiki/Manual:Extensions).
