import { DefaultTestSetup } from '../../helpers/DefaultTestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/repo_client/interwiki-links.ts',
	'specs/repo_client/item.ts',
	'specs/repo/api.ts'
];

export const testSetup = new DefaultTestSetup( 'base__repo_client', {
	composeFiles: [
		'suites/repo_client/docker-compose.override.yml'
	],
	waitForURLs: () => ( [
		process.env.MW_CLIENT_SERVER
	] )
} );

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
