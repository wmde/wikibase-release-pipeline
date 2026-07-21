<?php

## OAuth Extension
wfLoadExtension( 'OAuth' );
$wgMWOAuthSharedUserIDs = true;
$wgMWOAuthSharedUserSource = 'local';
$wgGroupPermissions['sysop']['mwoauthproposeconsumer'] = true;
$wgGroupPermissions['sysop']['mwoauthmanageconsumer'] = true;
$wgGroupPermissions['sysop']['mwoauthviewprivate'] = true;
$wgGroupPermissions['sysop']['mwoauthupdateownconsumer'] = true;
