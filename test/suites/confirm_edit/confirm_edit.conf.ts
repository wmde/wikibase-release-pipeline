import { DefaultTestEnvironment } from '../../helpers/DefaultTestEnvironment.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/confirm_edit/*.ts'
];

export const testEnvironment = new DefaultTestEnvironment( 'confirm_edit', {
	composeFiles: [
		'suites/confirm_edit/docker-compose.override.yml'
	]
} );

export const config: WebdriverIO.Config = wdioConfig( testEnvironment, specs );
