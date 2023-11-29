import { DefaultTestEnvironment } from '../../helpers/DefaultTestEnvironment.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/fedprops/*.ts'
];

export const testEnvironment = new DefaultTestEnvironment( 'base__fedprops', {
	composeFiles: [
		'suites/fedprops/docker-compose.override.yml'
	]
} );

export const config: WebdriverIO.Config = wdioConfig( testEnvironment, specs );
