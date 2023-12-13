import TestEnv from '../../setup/TestEnv.js';
import wdioConfig from '../../setup/wdio.conf.js';

const testEnv = TestEnv.createAppendingToDefaults( {
	name: 'pingback',
	specs: [
		'specs/pingback/*.ts'
	],
	composeFiles: [
		'suites/pingback/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
