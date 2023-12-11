import TestEnv from '../../setup/TestEnv.js';
import wdioConfig from '../../setup/wdio.conf.js';

global.testEnv = TestEnv.createAppendingToDefaults( {
	name: 'confirm_edit',
	specs: [
		'specs/confirm_edit/*.ts'
	],
	composeFiles: [
		'suites/confirm_edit/docker-compose.override.yml'
	]
} );

export const config = wdioConfig();
