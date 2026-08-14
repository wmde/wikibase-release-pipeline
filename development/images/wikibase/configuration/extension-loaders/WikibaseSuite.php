<?php

if ( $wgEnableWikibaseRepo ?? true ) {
	wfLoadExtension( 'WikibaseSuite' );
}
