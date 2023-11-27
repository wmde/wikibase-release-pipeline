import { DefaultTestSetup } from '../../helpers/DefaultTestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/confirm_edit/*.ts'
];

export const testSetup = new DefaultTestSetup( 'confirm_edit', {
	composeFiles: [
		'suites/confirm_edit/docker-compose.override.yml'
	]
} );

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
