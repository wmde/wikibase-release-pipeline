import TestEnv from '../../setup/TestEnv.js';
import { defaultTestSettings } from '../../setup/makeTestSettings.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'fedprops',
	specs: [
		'specs/fedprops/*.ts'
	],
	composeFiles: [
		...defaultTestSettings.composeFiles,
		'suites/fedprops/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
