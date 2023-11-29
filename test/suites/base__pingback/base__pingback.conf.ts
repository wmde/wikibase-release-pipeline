import { DefaultTestEnvironment } from '../../setup/DefaultTestEnvironment.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/pingback/*.ts'
];

export const testEnvironment = new DefaultTestEnvironment( 'base__pingback', {
	composeFiles: [
		'suites/pingback/docker-compose.override.yml'
	]
} );

export const config: WebdriverIO.Config = wdioConfig( testEnvironment, specs );
