<?php

$wgMetaNamespace = "Project";

$wgEnableWikibaseRepo = true;
$wgEnableWikibaseClient = false;

wfLoadExtension( 'WikibaseRepository', "$IP/extensions/Wikibase/extension-repo.json" );
require_once "$IP/extensions/Wikibase/repo/ExampleSettings.php";

$wgWBRepoSettings['siteLinkGroups'] = [ 'mywikigroup' ];
$wgLocalDatabases = $wgWBRepoSettings['localClientDatabases'] = [ 'client_wiki', ];
