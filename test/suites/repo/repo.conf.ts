import { DefaultTestSetup } from '../../helpers/TestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'../../specs/repo/*.ts',
	'../../specs/repo/extensions/*.ts'
];

export const testSetup = new DefaultTestSetup( 'repo', {
	composeFiles: [
		'./suites/repo/docker-compose.override.yml'
	]
} );

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
