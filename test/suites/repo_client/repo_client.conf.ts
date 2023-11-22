import { DefaultTestSetup } from '../../helpers/TestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

const specs = [
	'../../specs/repo_client/*.ts',
	'../../specs/repo_client/extensions/*.ts'
];

export const testSetup = new DefaultTestSetup( 'repo_client', {
	composeFiles: [
		'./suites/repo_client/docker-compose.override.yml'
	],
	checkIfUpURLs: [
		process.env.MW_CLIENT_SERVER
	]
} );

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
