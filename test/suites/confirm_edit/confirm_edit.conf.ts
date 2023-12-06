import TestEnvironment from '../../setup/TestEnvironment.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnvironment.createAppendingToDefaults( {
	name: 'confirm_edit',
	specs: [
		'specs/confirm_edit/*.ts'
	],
	composeFiles: [
		'suites/confirm_edit/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
