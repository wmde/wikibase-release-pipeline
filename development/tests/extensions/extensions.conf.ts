import { defaultSettings } from '../_setup/make-test-settings.js';
import TestEnv from '../_setup/test-env.js';
import wdioConfig from '../_setup/wdio.conf.js';

export const testEnv = TestEnv.create( {
	...defaultSettings,
	name: 'extensions',
	maxInstances: 3,
	specs: [ 'extensions/*.spec.ts' ],
	composeFiles: [
		...defaultSettings.composeFiles,
		'extensions/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
