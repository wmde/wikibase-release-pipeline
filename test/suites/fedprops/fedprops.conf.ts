import TestEnvironment from '../../setup/TestEnvironment.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnvironment.createAppendingToDefaults( {
	name: 'fedprops',
	specs: [
		'specs/fedprops/*.ts'
	],
	composeFiles: [
		'suites/fedprops/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
