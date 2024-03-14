import { defaultTestSettings } from '../../setup/makeTestSettings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'quickstatements',
	specs: [ 'specs/repo_client/interwiki-links.ts', 'specs/quickstatements/*.ts' ],
	composeFiles: [
		...defaultTestSettings.composeFiles,
		'suites/quickstatements/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
