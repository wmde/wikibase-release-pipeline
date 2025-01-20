import { ltsSettings } from '../../setup/make-test-settings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.create( {
	...ltsSettings,
	name: 'quickstatements-lts',
	specs: [ 'specs/quickstatements/*.ts' ],
	composeFiles: [
		...ltsSettings.composeFiles,
		'suites/quickstatements/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
