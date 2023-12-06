import TestEnvironment from '../../setup/TestEnvironment.js';
import envVars from '../../setup/envVars.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnvironment.createAppendingToDefaults( {
	name: 'base__repo_client',
	isBaseSuite: true,
	specs: [
		'specs/repo_client/interwiki-links.ts',
		'specs/repo_client/item.ts',
		'specs/repo/api.ts'
	],
	composeFiles: [
		'suites/repo_client/docker-compose.override.yml'
	],
	waitForURLs: () => ( [
		envVars.WIKIBASE_CLIENT_URL
	] )
} );

export const config = wdioConfig( testEnv );
