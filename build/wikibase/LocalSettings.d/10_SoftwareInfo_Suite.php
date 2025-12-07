<?php

$wgHooks['SoftwareInfo'][] = function( &$software ) {
    $software['[https://www.mediawiki.org/wiki/Wikibase/Suite Wikibase Suite]'] = 'yes';
    return true;
};