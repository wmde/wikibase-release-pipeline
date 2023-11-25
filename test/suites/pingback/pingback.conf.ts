import { DefaultTestSetup } from '../../helpers/DefaultTestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/pingback/*.ts'
];

export const testSetup = new DefaultTestSetup( 'pingback', {
	composeFiles: [
		'suites/pingback/docker-compose.override.yml'
	]
} );

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
