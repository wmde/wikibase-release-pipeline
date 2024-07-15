import { defaultTestSettings } from '../../setup/make-test-settings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

// TODO: The specs and setup in this suite are deprecated
// now that the entire test suite runs off the Deploy configuration.
//
// The user stories which reflect our current Deploy design,
// among other things, are likely to cover the now deprecated
// Upgrade test suite.
//
// Here are some proposed stories to cover:
//
// 1. User can setup and run all WBS services
// 2. User can stop and restart WBS services and all services
//    come up (no data change)
// 3. User can stop and restart WBS services and all services
//    come up (with data change). Checks if data remains.
// 4. A Wikibase and/or other services Docker Image upgrades happen
//    automatically on restart of services
// 5. Can change setup variables but instance is unchanged if a
//    /config/LocalSettings.php exists.
// 6. Wikibase instance is re-setup if /config/LocalSettings.php
//    is not provided.

export const testEnv = TestEnv.createWithDefaults( {
	name: 'deploy',
	specs: [
		'specs/quickstatements/*.ts',
		'specs/repo/queryservice.ts',
		'specs/elasticsearch/*.ts'
	],
	composeFiles: [
		...defaultTestSettings.composeFiles,
		'suites/deploy/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
