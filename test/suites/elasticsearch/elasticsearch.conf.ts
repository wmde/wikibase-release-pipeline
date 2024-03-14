import { defaultTestSettings } from '../../setup/makeTestSettings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'elasticsearch',
	specs: [ 'specs/elasticsearch/*.ts' ],
	composeFiles: [
		...defaultTestSettings.composeFiles,
		'suites/elasticsearch/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
