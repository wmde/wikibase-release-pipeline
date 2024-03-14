import { defaultTestSettings } from '../../setup/makeTestSettings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'base__repo',
	isBaseSuite: true,
	specs: [
		'specs/repo/api.ts',
		'specs/repo/property.ts',
		'specs/repo/special-item.ts',
		'specs/repo/special-property.ts',
		'specs/repo/queryservice.ts'
	],
	composeFiles: [
		...defaultTestSettings.composeFiles,
		'suites/repo/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
