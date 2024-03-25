import { defaultTestSettings } from '../../setup/make-test-settings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'pingback',
	specs: [ 'specs/pingback/*.ts' ],
	composeFiles: [
		...defaultTestSettings.composeFiles,
		'suites/pingback/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
