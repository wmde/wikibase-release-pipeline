import TestEnv from '../../setup/TestEnv.js';
import wdioConfig from '../../setup/wdio.conf.js';

global.testEnv = TestEnv.createAppendingToDefaults( {
	name: 'base__pingback',
	isBaseSuite: true,
	specs: [
		'specs/pingback/*.ts'
	],
	composeFiles: [
		'suites/pingback/docker-compose.override.yml'
	]
} );

export const config = wdioConfig();
