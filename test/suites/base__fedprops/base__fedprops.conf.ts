import { DefaultTestSetup } from '../../helpers/DefaultTestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/fedprops/*.ts'
];

export const testSetup = new DefaultTestSetup( 'base__fedprops', {
	composeFiles: [
		'suites/fedprops/docker-compose.override.yml'
	]
} );

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
