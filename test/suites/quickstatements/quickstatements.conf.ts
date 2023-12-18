import TestEnv from '../../setup/TestEnv.js';
import { defaultTestSettings } from '../../setup/makeTestSettings.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'quickstatements',
	specs: [
		'specs/repo_client/interwiki-links.ts',
		'specs/quickstatements/*.ts'
	],
	composeFiles: [
		...defaultTestSettings.composeFiles,
		'suites/quickstatements/docker-compose.override.yml'
	],
	waitForUrls: () => ( [
		...defaultTestSettings.waitForUrls(),
		testEnv.vars.QUICKSTATEMENTS_URL,
		testEnv.vars.WIKIBASE_CLIENT_URL
	] )
} );

export const config = wdioConfig( testEnv );
