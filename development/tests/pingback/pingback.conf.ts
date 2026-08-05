import { defaultSettings } from '../_setup/make-test-settings.js';
import TestEnv from '../_setup/test-env.js';
import wdioConfig from '../_setup/wdio.conf.js';

export const testEnv = TestEnv.create( {
	...defaultSettings,
	name: 'pingback',
	specs: [ 'pingback/*.spec.ts' ],
	composeFiles: [
		...defaultSettings.composeFiles,
		'pingback/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
