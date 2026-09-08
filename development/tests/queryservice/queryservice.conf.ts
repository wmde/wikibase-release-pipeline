import { defaultSettings } from '../_setup/make-test-settings.js';
import TestEnv from '../_setup/test-env.js';
import wdioConfig from '../_setup/wdio.conf.js';

export const testEnv = TestEnv.create( {
	...defaultSettings,
	name: 'queryservice',
	specs: [ 'queryservice/*.spec.ts' ],
	composeProfiles: [ 'queryservice' ],
	composeFiles: [
		...defaultSettings.composeFiles,
		'queryservice/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
