import TestEnv from '../../setup/TestEnv.js';
import { defaultTestSettings } from '../../setup/makeTestSettings.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'base__repo_client',
	isBaseSuite: true,
	specs: [
		'specs/repo_client/interwiki-links.ts',
		'specs/repo_client/item.ts',
		'specs/repo/api.ts'
	],
	composeFiles: [
		...defaultTestSettings.composeFiles,
		'suites/repo_client/docker-compose.override.yml'
	],
	waitForUrls: () => ( [
		testEnv.vars.WIKIBASE_CLIENT_URL
	] )
} );

export const config = wdioConfig( testEnv );
