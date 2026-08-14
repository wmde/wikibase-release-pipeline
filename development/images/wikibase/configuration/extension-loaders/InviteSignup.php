<?php

wfLoadExtension( 'InviteSignup' );

$wgGroupPermissions['*']['createaccount'] = false;
$wgGroupPermissions['user']['createaccount'] = false;
$wgGroupPermissions['sysop']['invitesignup'] = true;
$wgISGroups = [ 'confirmed' ];
