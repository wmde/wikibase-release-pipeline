import TestEnv from '../../setup/TestEnv.js';
import wdioConfig from '../../setup/wdio.conf.js';

const testEnv = TestEnv.createAppendingToDefaults( {
	name: 'fedprops',
	specs: [
		'specs/fedprops/*.ts'
	],
	composeFiles: [
		'suites/fedprops/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
