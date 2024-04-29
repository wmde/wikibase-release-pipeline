import { defaultTestSettings } from '../../setup/make-test-settings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'example',
	specs: [
		'specs/quickstatements/*.ts',
		'specs/repo/queryservice.ts',
		'specs/elasticsearch/*.ts'
	],
	composeFiles: [
		...defaultTestSettings.composeFiles,
		'suites/example/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
