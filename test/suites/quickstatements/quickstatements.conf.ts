import { DefaultTestSetup } from '../../helpers/DefaultTestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/repo_client/interwiki-links.ts',
	'specs/quickstatements/*.ts'
];

export const testSetup = new DefaultTestSetup( 'quickstatements', {
	composeFiles: [
		'suites/quickstatements/docker-compose.override.yml'
	],
	waitForURLs: () => ( [
		process.env.QS_SERVER,
		process.env.MW_CLIENT_SERVER
	] )
} );

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
