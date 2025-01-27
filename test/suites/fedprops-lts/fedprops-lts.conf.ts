import { ltsSettings } from '../../setup/make-test-settings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.create( {
	...ltsSettings,
	name: 'fedprops-lts',
	specs: [ 'specs/fedprops/*.ts' ],
	composeFiles: [
		...ltsSettings.composeFiles,
		'suites/fedprops/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
