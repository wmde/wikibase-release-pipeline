import { DefaultTestEnvironment } from '../../helpers/DefaultTestEnvironment.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/repo/api.ts',
	'specs/repo/property.ts',
	'specs/repo/special-item.ts',
	'specs/repo/special-property.ts',
	'specs/repo/queryservice.ts'
];

export const testEnvironment = new DefaultTestEnvironment( 'base__repo', {
	composeFiles: [
		'suites/repo/docker-compose.override.yml'
	]
} );

export const config: WebdriverIO.Config = wdioConfig( testEnvironment, specs );
