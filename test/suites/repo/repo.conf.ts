import { defaultTestSettings } from '../../setup/make-test-settings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'repo',
	specs: [ 'specs/repo/*.ts', 'specs/repo/extensions/*.ts' ],
	composeFiles: [
		...defaultTestSettings.composeFiles,
		'suites/repo/docker-compose.override.yml'
	],
	envFiles: [ ...defaultTestSettings.envFiles, 'suites/repo/repo.env' ]
} );

export const config = wdioConfig( testEnv );
