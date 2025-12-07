<?php

$wgHooks['SoftwareInfo'][] = function( &$software ) {
    $software['[https://www.mediawiki.org/wiki/Wikibase/Suite/Deploy Wikibase Suite Deploy]'] = 'yes';
    return true;
};