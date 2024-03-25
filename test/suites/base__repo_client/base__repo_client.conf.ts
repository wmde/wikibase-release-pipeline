import { defaultTestSettings } from '../../setup/make-test-settings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'base__repo_client',
	isBaseSuite: true,
	specs: [
		'specs/repo_client/interwiki-links.ts',
		'specs/repo_client/item.ts',
		'specs/repo/api.ts'
	],
	composeFiles: [
		...defaultTestSettings.composeFiles,
		'suites/repo_client/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
