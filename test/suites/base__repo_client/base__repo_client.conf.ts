import { TestEnvironment } from '../../setup/TestEnvironment.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const environment = TestEnvironment.createAppendingToDefaults( {
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
		globalThis.env.WIKIBASE_CLIENT_URL
	] )
} );

export const config = wdioConfig( environment );
