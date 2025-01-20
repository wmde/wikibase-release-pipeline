import { ltsSettings } from '../../setup/make-test-settings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.create( {
	...ltsSettings,
	name: 'repo_client-lts',
	specs: [ 'specs/repo_client/*.ts', 'specs/repo_client/extensions/*.ts' ],
	composeFiles: [
		...ltsSettings.composeFiles,
		'suites/repo_client/docker-compose.override.yml',
		'suites/repo_client-lts/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
