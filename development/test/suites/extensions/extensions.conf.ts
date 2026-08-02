import { defaultSettings } from '../../setup/make-test-settings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.create( {
	...defaultSettings,
	name: 'extensions',
	maxInstances: 3,
	specs: [ 'suites/extensions/specs/*.ts' ],
	composeFiles: [
		...defaultSettings.composeFiles,
		'suites/extensions/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
