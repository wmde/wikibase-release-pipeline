import { DefaultTestSetup } from '../../helpers/TestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

const specs = [
	'../../specs/repo_client/interwiki-links.ts',
	'../../specs/quickstatements/*.ts'
];

export const testSetup = new DefaultTestSetup( 'repo', {
	composeFiles: [
		'./suites/quickstatements/docker-compose.override.yml'
	],
	checkIfUpURLs: [
		process.env.QS_SERVER,
		process.env.MW_CLIENT_SERVER
	]
});

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
