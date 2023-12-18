import TestEnv from '../../setup/TestEnv.js';
import { defaultTestSettings } from '../../setup/makeTestSettings.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'repo_client',
	specs: [
		'specs/repo_client/*.ts',
		'specs/repo_client/extensions/*.ts'
	],
	composeFiles: [
		...defaultTestSettings.composeFiles,
		'suites/repo_client/docker-compose.override.yml'
	],
	waitForUrls: () => ( [
		...defaultTestSettings.waitForUrls(),
		testEnv.vars.WIKIBASE_CLIENT_URL
	] )
} );

export const config = wdioConfig( testEnv );
