import { DefaultTestSetup } from '../../helpers/TestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

const specs = [
	'../../specs/confirm_edit/*.ts'
];

export const testSetup = new DefaultTestSetup( 'confirm_edit', {
	composeFiles: [
		'./suites/confirm_edit/docker-compose.override.yml'
	]
} );

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
