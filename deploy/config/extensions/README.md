# Wikibase Suite User defined MediaWiki Extensions

- Put your extension here.
```

deploy
|
+- config
   |
   +- extensions
      |
      +- README.md <- you are here
      |
      +- MyExtension <- add this extension directory
         |
         +- extension.json

```
- Load via LocalSettings.php

```php
wfLoadExtension('extensions/MyExtension')
```
