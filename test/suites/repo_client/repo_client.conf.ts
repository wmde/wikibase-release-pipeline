import { defaultTestSettings } from '../../setup/make-test-settings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'repo_client',
	specs: [ 'specs/repo_client/*.ts', 'specs/repo_client/extensions/*.ts' ],
	composeFiles: [
		...defaultTestSettings.composeFiles,
		'suites/repo_client/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
