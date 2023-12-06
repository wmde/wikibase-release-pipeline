import { TestEnvironment } from '../../setup/TestEnvironment.js';
import envVars from '../../setup/envVars.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const environment = TestEnvironment.createAppendingToDefaults( {
	name: 'quickstatements',
	specs: [
		'specs/repo_client/interwiki-links.ts',
		'specs/quickstatements/*.ts'
	],
	composeFiles: [
		'suites/quickstatements/docker-compose.override.yml'
	],
	waitForURLs: () => ( [
		envVars.QUICKSTATEMENTS_URL,
		envVars.WIKIBASE_CLIENT_URL
	] )
} );

export const config = wdioConfig( environment );
