import TestEnv from '../../setup/TestEnv.js';
import envVars from '../../setup/envVars.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createAppendingToDefaults( {
	name: 'repo_client',
	specs: [
		'specs/repo_client/*.ts',
		'specs/repo_client/extensions/*.ts'
	],
	composeFiles: [
		'suites/repo_client/docker-compose.override.yml'
	],
	waitForURLs: () => ( [
		envVars.WIKIBASE_CLIENT_URL
	] )
} );

export const config = wdioConfig( testEnv );
