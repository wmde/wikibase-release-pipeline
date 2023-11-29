import { DefaultTestEnvironment } from '../../helpers/DefaultTestEnvironment.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/pingback/*.ts'
];

export const testEnvironment = new DefaultTestEnvironment( 'pingback', {
	composeFiles: [
		'suites/pingback/docker-compose.override.yml'
	]
} );

export const config: WebdriverIO.Config = wdioConfig( testEnvironment, specs );
