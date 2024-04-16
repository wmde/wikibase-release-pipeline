import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'example',
	specs: [
		'specs/quickstatements/*.ts',
		'specs/repo/queryservice.ts',
		'specs/elasticsearch/*.ts'
	],
	composeFiles: [
		'../example/docker-compose.yml',
		'suites/example/docker-compose.override.yml'
	],
	envFiles: [
		'../example/template.env',
		'suites/example/example.env',
		'../local.env'
	],
	beforeServices: async (): Promise<void> => {
		// bypass default local image loading
	}
} );

export const config = wdioConfig( testEnv );
