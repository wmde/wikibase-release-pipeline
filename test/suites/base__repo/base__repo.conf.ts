import TestEnvironment from '../../setup/TestEnvironment.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnvironment.createAppendingToDefaults( {
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
		'suites/repo/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
