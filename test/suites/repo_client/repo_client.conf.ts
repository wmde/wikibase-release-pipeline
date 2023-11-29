import { DefaultTestEnvironment } from '../../helpers/DefaultTestEnvironment.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/repo_client/*.ts',
	'specs/repo_client/extensions/*.ts'
];

export const testEnvironment = new DefaultTestEnvironment( 'repo_client', {
	composeFiles: [
		'suites/repo_client/docker-compose.override.yml'
	],
	waitForURLs: () => ( [
		process.env.MW_CLIENT_SERVER
	] )
} );

export const config: WebdriverIO.Config = wdioConfig( testEnvironment, specs );
