import { defaultSettings } from '../../setup/make-test-settings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.create( {
	...defaultSettings,
	name: 'opensearch',
	specs: [ 'specs/opensearch/*.ts' ],
	composeProfiles: [ 'opensearch' ],
	composeFiles: [
		...defaultSettings.composeFiles,
		'suites/opensearch/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
