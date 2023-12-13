import TestEnv from '../../setup/TestEnv.js';
import wdioConfig from '../../setup/wdio.conf.js';

const testEnv = TestEnv.createAppendingToDefaults( {
	name: 'repo',
	specs: [
		'specs/repo/*.ts',
		'specs/repo/extensions/*.ts'
	],
	composeFiles: [
		'suites/repo/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
