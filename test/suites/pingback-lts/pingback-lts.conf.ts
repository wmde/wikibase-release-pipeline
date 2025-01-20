import { ltsSettings } from '../../setup/make-test-settings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.create( {
	...ltsSettings,
	name: 'pingback-lts',
	specs: [ 'specs/pingback/*.ts' ],
	composeFiles: [
		...ltsSettings.composeFiles,
		'suites/pingback/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
