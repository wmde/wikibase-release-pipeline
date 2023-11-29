import { DefaultTestEnvironment } from '../../setup/DefaultTestEnvironment.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/repo/*.ts',
	'specs/repo/extensions/*.ts'
];

export const testEnvironment = new DefaultTestEnvironment( 'repo', {
	composeFiles: [
		'suites/repo/docker-compose.override.yml'
	]
} );

export const config: WebdriverIO.Config = wdioConfig( testEnvironment, specs );
