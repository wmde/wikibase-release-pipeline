import TestEnv from '../../setup/TestEnv.js';
import wdioConfig from '../../setup/wdio.conf.js';

const testEnv = TestEnv.createAppendingToDefaults( {
	name: 'quickstatements',
	specs: [
		'specs/repo_client/interwiki-links.ts',
		'specs/quickstatements/*.ts'
	],
	composeFiles: [
		'suites/quickstatements/docker-compose.override.yml'
	],
	waitForURLs: () => ( [
		testEnv.vars.QUICKSTATEMENTS_URL,
		testEnv.vars.WIKIBASE_CLIENT_URL
	] )
} );

export const config = wdioConfig( testEnv );
